// /src/utilities/nav.js
// Injects a TOC template (nav.html) into the ASIDE/container,
// then populates it from nav.json. No inline JS required.

// ---- fetch helpers ----
async function fetchText(url) {
    const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.text();
}
async function fetchJSON(url) {
    const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) throw new Error(`Failed to load ${url}: ${r.status}`);
    return r.json();
}

// ---- URL helpers ----
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

// ---- DOM helpers ----
function ensureTocList(container) {
    let list = container.querySelector('[data-toc]');
    if (list) return list;
    const nav = document.createElement('nav');
    nav.className = 'toc';
    nav.setAttribute('aria-label', 'Table of contents');
    list = document.createElement('ul');
    list.className = 'toc-list';
    list.setAttribute('data-toc', '');
    nav.appendChild(list);
    container.appendChild(nav);
    return list;
}

function setActiveFromPath(listEl, base, activeClass, path) {
    listEl.querySelectorAll('li').forEach((li) => {
        li.classList.remove(activeClass);
        const a = li.querySelector('a[aria-current="page"]');
        if (a) a.removeAttribute('aria-current');
    });
    const match = [...listEl.querySelectorAll('a[href]')].find((a) => {
        const u = new URL(a.href, location.origin);
        const lp = localizePath(u.pathname, base);
        return (lp || '/') === path;
    });
    if (match) {
        match.closest('li')?.classList.add(activeClass);
        match.setAttribute('aria-current', 'page');
    }
}

function renderTOC(listEl, navData, activeClass) {
    const base = normalizeBase(navData.basePath || '/');
    const items = (navData.routes || []).filter((r) => r.path !== '*');

    listEl.innerHTML = items
        .map((r) => {
            const label = (r.icon ? `${r.icon} ` : '') + r.title;
            if (r.disabled) return `<li class="disabled" aria-disabled="true"><span>${label}</span></li>`;
            const href = base + (r.path === '/' ? '' : r.path.replace(/^\//, ''));
            return `<li><a href="${href}">${label}</a></li>`;
        })
        .join('');

    const current = localizePath(location.pathname, base) || '/';
    setActiveFromPath(listEl, base, activeClass, current);

    document.addEventListener('route:after', (e) => {
        const path =
            (e && e.detail && e.detail.path) ||
            (localizePath(location.pathname, base) || '/');
        setActiveFromPath(listEl, base, activeClass, path);
    });
}

// ---- find our <script> element robustly (modules have no currentScript) ----
function findOwnScriptElement() {
    try {
        const selfUrl = new URL(import.meta.url, location.href).href;
        // Match the <script> whose resolved src equals import.meta.url
        const scripts = document.querySelectorAll('script[type="module"][src]');
        for (const s of scripts) {
            const srcUrl = new URL(s.getAttribute('src'), location.href).href;
            if (srcUrl === selfUrl) return s;
        }
    } catch {}
    // Fallbacks: last <script> tag, or any script that ends with nav.js
    const bySuffix =
        document.querySelector('script[type="module"][src$="/src/utilities/nav.js"]') ||
        document.querySelector('script[type="module"][src$="utilities/nav.js"]');
    if (bySuffix) return bySuffix;
    const all = document.scripts;
    return all[all.length - 1] || null;
}

// ---- autoboot ----
(async function autoboot() {
    if (typeof document === 'undefined') return;

    const scriptEl = findOwnScriptElement();
    if (!scriptEl) {
        console.error('nav.js: could not locate the <script> element for configuration.');
        return;
    }

    // Read data-* from the script tag
    const templateUrl  = scriptEl.dataset.template;           // e.g., /docs/dev/pages/nav.html
    let   navUrl       = scriptEl.dataset.nav || '';          // e.g., /docs/dev/conf/nav.json
    const containerSel = scriptEl.dataset.container || 'aside';
    const activeClass  = scriptEl.dataset.activeClass || 'active';

    const container = document.querySelector(containerSel);
    if (!container) {
        console.error('nav.js: container not found for selector:', containerSel);
        return;
    }

    try {
        // 1) Inject template (if provided). If not, ensure a skeleton.
        if (templateUrl) {
            const tpl = await fetchText(templateUrl);
            container.innerHTML = tpl;
        } else if (!container.querySelector('[data-toc]')) {
            ensureTocList(container);
        }

        // If data-nav not provided, try reading from template's nav[data-nav-src]
        if (!navUrl) {
            const probe =
                container.querySelector('nav[data-nav-src]') ||
                document.querySelector('nav[data-nav-src]');
            navUrl = probe?.getAttribute('data-nav-src') || '';
        }

        if (!navUrl) {
            console.error('nav.js: data-nav is required (or provide data-nav-src on <nav> in your template)');
            const listEl = container.querySelector('[data-toc]') || ensureTocList(container);
            listEl.innerHTML = `<li>Navigation config missing</li>`;
            return;
        }

        // 2) Fetch nav.json and render TOC
        const navData = await fetchJSON(navUrl);
        const listEl  = container.querySelector('[data-toc]') || ensureTocList(container);
        renderTOC(listEl, navData, activeClass);
    } catch (err) {
        const listEl = container.querySelector('[data-toc]') || ensureTocList(container);
        listEl.innerHTML = `<li>Error loading navigation</li>`;
        console.error('nav.js error:', err);
    }
})();
