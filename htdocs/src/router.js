// /src/router.js
// SPA fragment router driven by nav.json (same file your TOC uses).
// Auto-boot from <script type="module" src="/src/router.js" data-* ...> (no inline JS).
//
// Data attributes on the script tag:
//   data-nav="/docs/dev/conf/nav.json"   (required)
//   data-main="main.site-main"
//   data-aside="#site-nav"
//   data-active-class="active"
//   data-query-mode="array"              ("array" | "single")

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
    const norm = ('/' + pathname).replace(/\/+/g, '/');
    if (norm === base.slice(0, -1)) return '/';
    return norm.startsWith(base) ? norm.slice(base.length - 1) || '/' : null;
}
function parseQuery(qs, mode = 'array') {
    if (mode === 'single') {
        const o = {};
        for (const [k, v] of new URLSearchParams(qs)) o[k] = v;
        return o;
    }
    const out = {};
    for (const [k, v] of new URLSearchParams(qs)) {
        if (k in out) out[k] = Array.isArray(out[k]) ? out[k].concat(v) : [out[k], v];
        else out[k] = v;
    }
    return out;
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

// Build route regexes
function compile(routes) {
    return routes.map((r) => {
        const keys = [];
        const rx = new RegExp(
            '^' +
            r.path
                .replace(/\/:\w+/g, (m) => {
                    keys.push(m.slice(2));
                    return '/([^/]+)';
                })
                .replace(/\*/g, '.*') +
            '$'
        );
        return { def: r, rx, keys };
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

// Resolve contentRoot + file; guard against double final segment (e.g., "pages/pages")
function resolveFileURL(contentRoot, file) {
    if (!file) return null;
    if (/^https?:\/\//i.test(file)) return file;
    if (file.startsWith('/')) return file;
    let root = contentRoot || '/';
    root = root.replace(/\/+$/,'') + '/';
    let f = file.replace(/^\.\/+/,'').replace(/^\/+/,'');
    const lastSeg = root.replace(/\/+$/,'').split('/').filter(Boolean).pop(); // e.g., "pages"
    if (lastSeg && f.startsWith(lastSeg + '/')) f = f.slice(lastSeg.length + 1);
    return (root + f).replace(/\/+/g,'/');
}

export function createRouter({
                                 nav,                 // { basePath, contentRoot, routes[] }
                                 main = 'main',
                                 aside = 'aside',
                                 activeClass = 'active',
                                 queryMode = 'array'
                             } = {}) {
    if (!nav || !nav.routes) throw new Error('router: "nav" with routes[] is required');

    const BASE = normalizeBase(nav.basePath || '/');
    const CONTENT_ROOT = nav.contentRoot || '/';
    const MAIN = typeof main === 'string' ? document.querySelector(main) : main;
    const ASIDE = typeof aside === 'string' ? document.querySelector(aside) : aside;
    if (!MAIN) throw new Error('router: <main> element not found (check data-main)');

    const routeDefs = (nav.routes || []).filter(r => !r.disabled).map(r => ({
        ...r, _fileURL: resolveFileURL(CONTENT_ROOT, r.file || null)
    }));
    const compiled = compile(routeDefs);
    const notFound = routeDefs.find(r => r.path === '*') || { path: '*', title: 'Not found', _fileURL: null };

    const HTML_CACHE = new Map();  // url -> html
    const PENDING = new Map();     // url -> Promise<html>

    async function getHTML(url) {
        if (url == null) return `<section class="not-found"><h1>Not found</h1></section>`;
        if (HTML_CACHE.has(url)) return HTML_CACHE.get(url);
        if (PENDING.has(url)) return await PENDING.get(url);
        const p = fetchTEXT(url).then((txt) => {
            HTML_CACHE.set(url, txt);
            PENDING.delete(url);
            return txt;
        }).catch((e) => { PENDING.delete(url); throw e; });
        PENDING.set(url, p);
        return await p;
    }

    function setActive(path) {
        if (!ASIDE) return;
        const links = ASIDE.querySelectorAll('a[href]');
        links.forEach(a => a.parentElement?.classList.remove(activeClass));
        const match = [...links].find(a => {
            const u = new URL(a.href, location.href);
            const lp = localizePath(u.pathname, BASE);
            return (lp || '/') === path;
        });
        if (match) match.parentElement?.classList.add(activeClass);
    }

    async function render(html, { title }) {
        MAIN.innerHTML = html;
        if (title) document.title = title;
        const target = MAIN.querySelector('h1, [role="heading"]') || MAIN;
        target.setAttribute('tabindex','-1');
        target.focus({ preventScroll: true });
        window.scrollTo(0, 0);
    }

    async function load(url, replace = false) {
        const u = new URL(url, location.origin);
        const local = localizePath(u.pathname, BASE);
        const q = parseQuery(u.search, queryMode);

        const hit = local && matchRoute(local, compiled);
        const meta = hit ? hit.route : notFound;
        const params = hit ? hit.params : {};

        let html, titleToUse = meta.title;

        try {
            html = await getHTML(meta._fileURL);        // try normal fragment
        } catch (err) {
            try {
                html = await getHTML(notFound._fileURL);  // fallback to 404 fragment
                titleToUse = notFound.title || 'Not found';
            } catch {
                html = `<section class="not-found"><h1>Not found</h1><p>${String(err)}</p></section>`;
                titleToUse = 'Not found';
            }
        }

        if (replace) history.replaceState({ path: local, params, q }, '', u.toString());
        else history.pushState({ path: local, params, q }, '', u.toString());

        await render(html, { title: titleToUse });
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
        if (meta._fileURL) { try { await getHTML(meta._fileURL); } catch {} }
    }

    // Optional hover preloading for <a data-preload>
    addEventListener('mouseover', (e) => {
        const a = e.target.closest?.('a[data-preload][href]');
        if (!a) return;
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin) return;
        const local = localizePath(u.pathname, BASE);
        if (!local) return;
        const hit = matchRoute(local, compiled);
        if (!hit) return;
        preload(u.toString()); // fire & forget
    }, { passive: true });

    // Intercept internal links safely
    addEventListener('click', (e) => {
        const a = e.target.closest?.('a[href]');
        if (!a || isModifiedClick(e)) return;

        const u = new URL(a.href, location.href);
        if (!/^https?:$/.test(u.protocol)) return;

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

    const api = { start, navigate, preload, setActive, load, basePath: BASE, contentRoot: CONTENT_ROOT };
    return api;
}

// Optional manual boot helper
export async function bootFromNav(navUrl, opts = {}) {
    const nav = await fetchJSON(navUrl);
    return createRouter({ nav, ...opts }).start();
}

// --- Auto-boot & expose global instance -------------------------------------
(async function autobootFromScriptTag() {
    if (typeof document === 'undefined') return;
    const scriptEl = document.currentScript || [...document.scripts].slice(-1)[0];
    if (!scriptEl || !scriptEl.dataset) return;

    const navUrl = scriptEl.dataset.nav;
    if (!navUrl) return;

    const mainSel   = scriptEl.dataset.main || 'main';
    const asideSel  = scriptEl.dataset.aside || 'aside';
    const activeCls = scriptEl.dataset.activeClass || 'active';
    const qMode     = scriptEl.dataset.queryMode || 'array';

    try {
        const nav = await fetchJSON(navUrl);
        // Expose the running router so pages can call navigate()/preload() without inline JS
        // e.g., window.PicoRouter.navigate('/docs/dev/api')
        window.PicoRouter = createRouter({
            nav,
            main: mainSel,
            aside: asideSel,
            activeClass: activeCls,
            queryMode: qMode
        }).start();
    } catch (e) {
        const main = document.querySelector(mainSel);
        if (main) main.innerHTML = `<section class="error"><h1>Router error</h1><p>${String(e)}</p></section>`;
        console.error('router autoboot error:', e);
    }
})();
