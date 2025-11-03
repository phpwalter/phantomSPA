/**
 * @file nav-tree.js
 * @version 2.1.0
 * @description PhantomSPA navigation tree plugin
 * Renders a recursive sidebar nav from nav.json with no dependencies.
 * Supports basePath-aware links, <details> persistence, lazy-loading, and active highlighting.
 */

export async function setup(spa, options = {}) {
    const config = {
        nav: '/docs/dev/conf/nav.json',
        container: '#site-nav',
        activeClass: 'active',
        ...options
    };

    console.group('[nav-tree] init');

    try {
        // Load nav JSON
        const navData = await fetchJSON(config.nav);
        const basePath = navData.basePath || '/';
        const routes = navData.routes || [];

        if (!routes.length) throw new Error('No routes in nav.json');

        // Find target container
        const container = document.querySelector(config.container);
        if (!container) throw new Error(`Container not found: ${config.container}`);

        // Build and inject nav
        const nav = document.createElement('nav');
        nav.classList.add('toc');
        nav.setAttribute('aria-label', 'Table of contents');
        nav.appendChild(buildNavTree(routes, basePath));
        container.innerHTML = '';
        container.appendChild(nav);

        // Enhance UX
        restoreDetailsState(nav);
        persistDetailsState(nav);
        highlightActiveLink(nav, config.activeClass);

        console.info('[nav-tree] rendered successfully');
    } catch (err) {
        console.error('[nav-tree] failed to render:', err.message);
    }

    console.groupEnd();
}

/* ----------------------------
   Recursive nav renderer
----------------------------- */
function buildNavTree(routes = [], basePath = '/') {
    const ul = document.createElement('ul');
    ul.classList.add('nav-list');

    for (const route of routes) {
        if (route.path === '*') continue; // skip wildcard
        const li = document.createElement('li');

        // Subtree (folder)
        if (route.children && route.children.length > 0) {
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.innerHTML = `<span class="icon">${route.icon || ''}</span><span class="title">${route.title || ''}</span>`;
            details.appendChild(summary);
            details.appendChild(buildNavTree(route.children, basePath));

            // Lazy load optional
            if (route.lazy) {
                details.dataset.lazy = 'true';
                details.addEventListener('toggle', async () => {
                    if (details.open && !details.dataset.loaded) {
                        try {
                            const slug = (route.title || '').toLowerCase().replace(/\s+/g, '-');
                            const html = await fetchText(`/docs/dev/nav-partials/${slug}.html`);
                            const wrapper = document.createElement('div');
                            wrapper.innerHTML = html;
                            details.appendChild(wrapper);
                            details.dataset.loaded = 'true';
                            console.info('[nav-tree] lazy-loaded:', slug);
                        } catch (err) {
                            console.warn('[nav-tree] lazy load failed:', err.message);
                        }
                    }
                });
            }

            li.appendChild(details);
        }

        // Single route
        else if (route.path) {
            const a = document.createElement('a');
            a.classList.add('nav-link');
            const fullPath = `${basePath.replace(/\/$/, '')}/${route.path.replace(/^\/+/, '')}`;
            a.href = fullPath;
            a.innerHTML = `<span class="icon">${route.icon || ''}</span><span class="title">${route.title || ''}</span>`;
            li.appendChild(a);
        }

        ul.appendChild(li);
    }

    return ul;
}

/* ----------------------------
   Active route highlighter
----------------------------- */
function highlightActiveLink(nav, className = 'active') {
    const apply = () => {
        const links = nav.querySelectorAll('a.nav-link');
        links.forEach(link => link.classList.remove(className));

        const match = [...links].find(a => a.pathname === location.pathname);
        if (match) {
            match.classList.add(className);
            match.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    window.addEventListener('popstate', apply);
    apply();
}

/* ----------------------------
   <details> open state
----------------------------- */
function restoreDetailsState(nav) {
    const state = JSON.parse(localStorage.getItem('navTreeDetails') || '{}');
    nav.querySelectorAll('details').forEach(detail => {
        const summary = detail.querySelector('summary');
        const key = summary?.textContent?.trim();
        if (key && state[key] !== undefined) {
            detail.open = state[key];
        }
    });
}

function persistDetailsState(nav) {
    const state = JSON.parse(localStorage.getItem('navTreeDetails') || '{}');
    nav.querySelectorAll('details').forEach(detail => {
        const summary = detail.querySelector('summary');
        const key = summary?.textContent?.trim();
        if (!key) return;

        detail.addEventListener('toggle', () => {
            state[key] = detail.open;
            localStorage.setItem('navTreeDetails', JSON.stringify(state));
        });
    });
}

/* ----------------------------
   Fetch helpers
----------------------------- */
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
}

async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.text();
}
