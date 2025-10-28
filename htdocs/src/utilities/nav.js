// /src/utilities/nav.js — TOC builder that:
// 1) fetches an HTML template (nav.html) and injects it into the target container
// 2) fetches nav.json and renders links into the template's <ul data-toc>
// 3) keeps active state in sync with router via 'route:after' events
//
// Required data-* attributes on this <script> tag:
//   data-template  → URL to HTML template (e.g., /docs/dev/pages/nav.html)
//   data-nav       → URL to JSON spec     (e.g., /docs/dev/conf/nav.json)
//   data-container → CSS selector for the ASIDE container (e.g., #site-nav)
// Optional:
//   data-active-class → class name for the active <li> (default: "active")

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

// Ensure we have a <ul data-toc> to inject into.
function ensureTocList(rootEl) {
    // prefer existing [data-toc]
    let list = rootEl.querySelector('[data-toc]');
    if (list) return list;

    // fallback: create standard skeleton
    const nav = document.createElement('nav');
    nav.className = 'toc';
    const ul = document.createElement('ul');
    ul.className = 'toc-list';
    ul.setAttribute('data-toc', '');
    nav.appendChild(ul);
    rootEl.appendChild(nav);
    return ul;
}

function setActiveFromPath(listEl, base, activeClass, path) {
    listEl.querySelectorAll('li').forEach((li) => li.classList.remove(activeClass));
    const match = [...listEl.querySelectorAll('a[href]')].find((a) => {
        const u = new URL(a.href, location.origin);
        const lp = localizePath(u.pathname, base);
        return (lp || '/') === path;
    });
    if (match) match.closest('li')?.classList.add(activeClass);
}

function renderTOC(listEl, navData, activeClass) {
    const base = normalizeBase(navData.basePath || '/');
    const items = (navData.routes || []).filter((r) => r.path !== '*'); // omit catch-all

    listEl.innerHTML = items
        .map((r) => {
            const label = (r.icon ? `${r.icon} ` : '') + r.title;
            const href = base + (r.path === '/' ? '' : r.path.replace(/^\//, ''));
            if (r.disabled) {
                return `<li class="disabled" aria-disabled="true"><span>${label}</span></li>`;
            }
            return `<li><a href="${href}">${label}</a></li>`;
        })
        .join('');

    // initial active
    const current = localizePath(location.pathname, base) || '/';
    setActiveFromPath(listEl, base, activeClass, current);

    // stay in sync after router navigations
    document.addEventListener('route:after', (e) => {
        const path = (e && e.detail && e.detail.path) || (localizePath(location.pathname, base) || '/');
        setActiveFromPath(listEl, base, activeClass, path);
    });
}

(async function autoboot() {
    const scriptEl = document.currentScript || [...document.scripts].slice(-1)[0];
    if (!scriptEl || !scriptEl.dataset) return;

    const templateUrl = scriptEl.dataset.template; // e.g., /docs/dev/pages/nav.html
    const navUrl = scriptEl.dataset.nav;           // e.g., /docs/dev/conf/nav.json
    const containerSel = scriptEl.dataset.container || 'aside';
    const activeClass = scriptEl.dataset.activeClass || 'active';

    const container = document.querySelector(containerSel);
    if (!container) {
        console.error('nav.js: container not found for selector:', containerSel);
        return;
    }

    try {
        // 1) Load & inject the HTML template into the ASIDE (if provided)
        if (templateUrl) {
            const html = await fetchText(templateUrl);
            container.innerHTML = html; // inject your <nav class="toc">…</nav> skeleton
        } else if (!container.querySelector('[data-toc]')) {
            // No template provided and no existing skeleton → create one
            ensureTocList(container);
        }

        // 2) Load nav.json and render items into <ul data-toc>
        const navData = await fetchJSON(navUrl);
        const listEl =
            container.querySelector('[data-toc]') ||
            ensureTocList(container); // safety: ensure a mount point exists

        renderTOC(listEl, navData, activeClass);
    } catch (err) {
        // Show a simple error in the container
        const listEl =
            container.querySelector('[data-toc]') || ensureTocList(container);
        listEl.innerHTML = `<li>Error loading navigation</li>`;
        console.error('nav.js error:', err);
    }
})();
