// /src/router.js
// SPA fragment router driven by nav.json. Auto-boots from its <script data-*>.
//
// Script tag example:
// <script type="module"
//   src="/src/router.js"
//   data-nav="/docs/dev/conf/nav.json"
//   data-main="main.site-main"
//   data-aside="#site-nav"
//   data-active-class="active"
//   data-query-mode="array"
//   defer></script>

// /src/router.js
// PhantomSPA router: nav.json-driven SPA with Markdown + per-page CSS injection.

// /src/router.js
// PhantomSPA router: nav.json-driven SPA with Markdown + per-page CSS injection.

import { markdownToHtml } from '/src/utilities/markdown.js';

/* -------------------------- small utilities -------------------------- */

function isModifiedClick(e) {
    return e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}
function normalizeBase(p = '/') {
    let out = p || '/';
    if (!out.startsWith('/')) out = '/' + out;
    if (!out.endsWith('/')) out = out + '/';
    return out.replace(/\/+/g, '/');
}
function localizePath(pathname, base) {
    const n = ('/' + pathname).replace(/\/+/g, '/');
    if (n === base.slice(0, -1)) return '/';
    return n.startsWith(base) ? n.slice(base.length - 1) || '/' : null;
}
function parseQuery(qs, mode = 'array') {
    if (mode === 'single') {
        const o = {};
        for (const [k, v] of new URLSearchParams(qs)) o[k] = v;
        return o;
    }
    const o = {};
    for (const [k, v] of new URLSearchParams(qs)) {
        if (k in o) o[k] = Array.isArray(o[k]) ? o[k].concat(v) : [o[k], v];
        else o[k] = v;
    }
    return o;
}
async function fetchJSON(url) {
    const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.json();
}
async function fetchTEXT(url) {
    const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.text();
}
function compile(routes) {
    return routes.map((def) => {
        const keys = [];
        const rx = new RegExp(
            '^' +
            def.path
                .replace(/\/:\w+/g, (m) => {
                    keys.push(m.slice(2));
                    return '/([^/]+)';
                })
                .replace(/\*/g, '.*') +
            '$'
        );
        return { def, rx, keys };
    });
}
function matchRoute(pathname, compiled) {
    for (const r of compiled) {
        const m = pathname.match(r.rx);
        if (m) {
            const params = {};
            r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
            return { route: r.def, params };
        }
    }
    return null;
}
function resolveFileURL(contentRoot, file) {
    if (!file) return null;
    if (/^https?:\/\//i.test(file)) return file;
    if (file.startsWith('/')) return file;
    let root = contentRoot || '/';
    root = root.replace(/\/+$/,'') + '/';
    let f = file.replace(/^\.\/+/, '').replace(/^\/+/, '');
    const lastSeg = root.replace(/\/+$/,'').split('/').filter(Boolean).pop(); // e.g., "pages"
    if (lastSeg && f.startsWith(lastSeg + '/')) f = f.slice(lastSeg.length + 1); // avoid /pages/pages
    return (root + f).replace(/\/+/g,'/');
}
function looksLikeMarkdown(url) {
    return typeof url === 'string' && /\.md(?:\?.*)?$/i.test(url);
}
function pageClassFromURL(fileUrl) {
    try {
        const p = new URL(fileUrl, location.origin).pathname;
        const base = p.split('/').pop().split('?')[0] || '';
        const stem = base.replace(/\.(md|html)$/i, '');
        const slug = stem.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
        return slug ? `page-${slug}` : '';
    } catch {
        return '';
    }
}
function pageSlugFromURL(fileUrl) {
    return (pageClassFromURL(fileUrl) || '').replace(/^page-/, '');
}
function dedupe(arr = []) {
    const seen = new Set(); const out = [];
    for (const x of arr) { if (!seen.has(x)) { seen.add(x); out.push(x); } }
    return out;
}

/* ------------------------- page-style injection ------------------------- */

function computePageStyleHrefs(routeMeta, nav) {
    const out = [];
    if (Array.isArray(routeMeta.styles) && routeMeta.styles.length) {
        out.push(...routeMeta.styles);
    } else if (nav.stylesRoot && routeMeta.file) {
        const slug = pageSlugFromURL(routeMeta.file);
        if (slug) out.push(`${nav.stylesRoot.replace(/\/+$/,'')}/${slug}.css`);
    }
    return dedupe(out);
}

function applyPageStyles(hrefs = [], pageKey = '') {
    const HEAD = document.head || document.getElementsByTagName('head')[0];

    // Remove only styles we previously injected (base assets stay in place)
    [...document.querySelectorAll('link[rel="stylesheet"][data-owned="router"]')].forEach((link) => {
        const keep = hrefs.includes(link.getAttribute('href') || '');
        if (!keep) link.remove();
    });

    // Add any missing styles for this page
    hrefs.forEach((href) => {
        if (!href) return;
        const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
        if (existing) {
            if (!existing.hasAttribute('data-owned')) existing.setAttribute('data-owned', 'router');
            existing.setAttribute('data-page-style', pageKey);
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-owned', 'router');
        link.setAttribute('data-page-style', pageKey);
        HEAD.appendChild(link);
    });
}

/* ----------------------- fragment fetch + caching ----------------------- */

const HTML_CACHE = new Map(); // url -> html
const PENDING = new Map();    // url -> Promise<html>

function isAlreadyWrapped(html) {
    return /^\s*<section[^>]*\bclass=["'][^"']*\bdoc-page\b/i.test(html);
}

async function getFragmentHTML(url) {
    if (url == null) return `<section class="doc-page"><h1>Not found</h1></section>`;
    if (HTML_CACHE.has(url)) return HTML_CACHE.get(url);
    if (PENDING.has(url)) return await PENDING.get(url);

    const p = (async () => {
        const raw = await fetchTEXT(url);
        // Markdown → HTML
        if (looksLikeMarkdown(url)) {
            const body = await markdownToHtml(raw);
            const cls = pageClassFromURL(url);
            // ensure code blocks without class default to plaintext
            const sanitized = body.replace(/<pre><code(?![^>]*class=)/g, '<pre><code class="language-plaintext"');
            return `<section class="doc-page md ${cls}" data-src="${url}" data-page="${cls}">${sanitized}</section>`;
        }
        // Raw HTML fragment → wrap if needed
        if (!isAlreadyWrapped(raw)) {
            const cls = pageClassFromURL(url);
            return `<section class="doc-page ${cls}" data-src="${url}" data-page="${cls}">${raw}</section>`;
        }
        return raw;
    })()
        .then((html) => {
            HTML_CACHE.set(url, html);
            PENDING.delete(url);
            return html;
        })
        .catch((e) => {
            PENDING.delete(url);
            throw e;
        });

    PENDING.set(url, p);
    return await p;
}

/* ------------------------------ router core ----------------------------- */

export function createRouter({
                                 nav,                 // { basePath, contentRoot, stylesRoot?, routes[] }
                                 main = 'main',
                                 aside = 'aside',
                                 activeClass = 'active',
                                 queryMode = 'array'
                             } = {}) {
    if (!nav || !nav.routes) throw new Error('router: "nav" with routes[] is required');

    const BASE = normalizeBase(nav.basePath || '/');
    const CONTENT_ROOT = nav.contentRoot || '/';
    const STYLES_ROOT = nav.stylesRoot || null;

    const MAIN = typeof main === 'string' ? document.querySelector(main) : main;
    const ASIDE = typeof aside === 'string' ? document.querySelector(aside) : aside;
    if (!MAIN) throw new Error('router: <main> element not found (check data-main)');

    const routeDefs = (nav.routes || [])
        .filter((r) => !r.disabled)
        .map((r) => ({ ...r, _fileURL: resolveFileURL(CONTENT_ROOT, r.file || null) }));
    const compiled = compile(routeDefs);
    const notFound = routeDefs.find((r) => r.path === '*') || { path: '*', title: 'Not found', _fileURL: null };

    function setActive(path) {
        if (!ASIDE) return;
        const links = ASIDE.querySelectorAll('a[href]');
        links.forEach((a) => a.parentElement?.classList.remove(activeClass));
        const hit = [...links].find((a) => {
            const u = new URL(a.href, location.href);
            const lp = localizePath(u.pathname, BASE);
            return (lp || '/') === path;
        });
        if (hit) {
            hit.parentElement?.classList.add(activeClass);
            hit.setAttribute('aria-current', 'page');
        }
    }

    async function render(html, { title, meta }) {
        MAIN.innerHTML = html;
        if (title) document.title = title;

        // Mirror page class onto <main> for easy scoping
        const section = MAIN.querySelector('.doc-page');
        if (section) {
            const pageClass = [...section.classList].find((c) => c.startsWith('page-')) || '';
            MAIN.setAttribute('data-page', pageClass);
            MAIN.classList.forEach((c) => { if (c.startsWith('page-')) MAIN.classList.remove(c); });
            if (pageClass) MAIN.classList.add(pageClass);

            // Inject page-specific CSS (from route.styles[] or stylesRoot)
            const metaWithStyles = meta ? { ...meta } : null;
            if (metaWithStyles) {
                // attach stylesRoot so compute can use it
                const navWithStyles = STYLES_ROOT ? { ...nav, stylesRoot: STYLES_ROOT } : nav;
                const hrefs = computePageStyleHrefs(metaWithStyles, navWithStyles);
                applyPageStyles(hrefs, pageClass);
            }
        }

        const target = MAIN.querySelector('h1,[role="heading"]') || MAIN;
        target.setAttribute('tabindex','-1');
        target.focus({ preventScroll: true });
        window.scrollTo(0, 0);

        // Prism highlight if available
        if (window.Prism && typeof window.Prism.highlightAllUnder === 'function') {
            window.Prism.highlightAllUnder(MAIN);
        }
    }

    async function load(url, replace = false) {
        const u = new URL(url, location.origin);
        const local = localizePath(u.pathname, BASE);
        const q = parseQuery(u.search, queryMode);

        const hit = local && matchRoute(local, compiled);
        const meta = hit ? hit.route : notFound;
        const params = hit ? hit.params : {};

        // Route without file → immediate 404 fragment
        if (!meta._fileURL) {
            const html404 = await getFragmentHTML(notFound._fileURL);
            const title404 = notFound.title || 'Not found';
            if (replace) history.replaceState({ path: local, params, q }, '', u.toString());
            else history.pushState({ path: local, params, q }, '', u.toString());
            await render(html404, { title: title404, meta: notFound });
            setActive(local || '/');
            document.dispatchEvent(new CustomEvent('route:after', { detail: { path: local || '/', params, query: q, meta: notFound } }));
            return;
        }

        let html, titleToUse = meta.title;
        try {
            html = await getFragmentHTML(meta._fileURL);
        } catch (err) {
            try {
                html = await getFragmentHTML(notFound._fileURL);
                titleToUse = notFound.title || 'Not found';
            } catch {
                html = `<section class="doc-page"><h1>Not found</h1><p>${String(err)}</p></section>`;
                titleToUse = 'Not found';
            }
        }

        if (replace) history.replaceState({ path: local, params, q }, '', u.toString());
        else history.pushState({ path: local, params, q }, '', u.toString());

        await render(html, { title: titleToUse, meta });
        setActive(local || '/');

        document.dispatchEvent(new CustomEvent('route:after', {
            detail: { path: local || '/', params, query: q, meta }
        }));
    }

    function navigate(url, replace = false) { return load(url, replace); }

    async function preload(url) {
        const u = new URL(url, location.origin);
        const local = localizePath(u.pathname, BASE);
        const hit = local && matchRoute(local, compiled);
        const meta = hit ? hit.route : notFound;
        if (meta._fileURL) { try { await getFragmentHTML(meta._fileURL); } catch {} }
    }

    // Hover preloading for <a data-preload>
    addEventListener('mouseover', (e) => {
        const a = e.target.closest?.('a[data-preload][href]');
        if (!a) return;
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin) return;
        const local = localizePath(u.pathname, BASE);
        if (!local) return;
        const hit = matchRoute(local, compiled);
        if (!hit) return;
        preload(u.toString());
    }, { passive: true });

    // Intercept navigation clicks
    addEventListener('click', (e) => {
        const a = e.target.closest?.('a[href]');
        if (!a || isModifiedClick(e)) return;
        const u = new URL(a.href, location.href);
        if (!/^https?:$/.test(u.protocol)) return;        // ignore mailto:, tel:, etc.
        const local = localizePath(u.pathname, BASE);
        const isLocal = u.origin === location.origin && local !== null;
        const target = a.getAttribute('target');
        const rel = (a.getAttribute('rel') || '').split(/\s+/);
        const isExternalRel = rel.includes('external');
        const hit = local && matchRoute(local, compiled);

        if (!isLocal || !hit || a.hasAttribute('download') || (target && target !== '_self') || isExternalRel) return;
        e.preventDefault();
        navigate(u.toString());
    });

    addEventListener('popstate', () => navigate(location.href, true));

    function start() { navigate(location.href, true); return api; }

    const api = { start, navigate, preload, setActive, load, basePath: BASE, contentRoot: CONTENT_ROOT, stylesRoot: STYLES_ROOT };
    return api;
}

/* ---------------------------- manual boot API --------------------------- */

export async function bootFromNav(navUrl, opts = {}) {
    const nav = await fetchJSON(navUrl);
    return createRouter({ nav, ...opts }).start();
}

/* -------------------------- robust auto-boot ---------------------------- */

function findOwnScriptElement() {
    try {
        const selfUrl = new URL(import.meta.url, location.href).href;
        const scripts = document.querySelectorAll('script[type="module"][src]');
        for (const s of scripts) {
            const srcUrl = new URL(s.getAttribute('src'), location.href).href;
            if (srcUrl === selfUrl) return s;
        }
    } catch {}
    // Fallbacks
    return (
        document.querySelector('script[type="module"][src$="/src/router.js"]') ||
        document.querySelector('script[type="module"][src$="router.js"]') ||
        document.scripts[document.scripts.length - 1] ||
        null
    );
}

(async function autobootFromScriptTag() {
    if (typeof document === 'undefined') return;
    const scriptEl = findOwnScriptElement();
    if (!scriptEl || !scriptEl.dataset) return;

    const navUrl   = scriptEl.dataset.nav;
    if (!navUrl) return;

    const mainSel   = scriptEl.dataset.main || 'main';
    const asideSel  = scriptEl.dataset.aside || 'aside';
    const activeCls = scriptEl.dataset.activeClass || 'active';
    const qMode     = scriptEl.dataset.queryMode || 'array';

    try {
        const nav = await fetchJSON(navUrl);
        // Expose router for programmatic calls (navigate/preload)
        window.PicoRouter = createRouter({
            nav,
            main: mainSel,
            aside: asideSel,
            activeClass: activeCls,
            queryMode: qMode
        }).start();
    } catch (e) {
        const main = document.querySelector(mainSel);
        if (main) main.innerHTML = `<section class="doc-page"><h1>Router error</h1><p>${String(e)}</p></section>`;
        console.error('router autoboot error:', e);
    }
})();
