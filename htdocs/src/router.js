/**
 * PhantomSPA Router Plugin
 * Handles navigation and content loading with basePath awareness.
 */

export async function setup(spa, options = {}) {
    const config = options.config || spa.config || {};
    const navPath = options.nav || config.nav || '/docs/dev/conf/nav.json';
    const basePath = config.basePath || '/docs/dev/';
    const contentRoot = config.contentRoot || '/docs/dev/pages/';
    let routes = [];

    /**
     * Loads and parses the navigation config.
     */
    async function fetchRoutes() {
        const res = await fetch(navPath);
        if (!res.ok) throw new Error(`[router.js] Failed to load nav config: ${navPath}`);
        const data = await res.json();
        routes = data.routes || [];
    }

    /**
     * Normalizes path and matches a route.
     * @returns {object} matching route or fallback
     */
    function getMatchedRoute() {
        const path = location.pathname.replace(basePath, '/') || '/';
        const route = routes.find(r => r.path === path);
        if (route) {
            console.log('[router] route matched:', route);
            return route;
        }
        const fallback = routes.find(r => r.path === '*');
        console.warn('[router] No match. Fallback to:', fallback);
        return fallback;
    }

    /**
     * Loads and renders the page content.
     */
    async function handleNavigation() {
        const route = getMatchedRoute();
        if (!route) {
            console.error('[router] No route matched and no fallback found');
            return;
        }

        const fileURL = contentRoot + route.file;
        console.log('[router] loading:', fileURL);

        const res = await fetch(fileURL);
        if (!res.ok) throw new Error(`[router.js] Failed to load page: ${fileURL}`);
        const content = await res.text();

        const main = document.querySelector('main');
        if (!main) {
            console.error('[router] No <main> element found');
            return;
        }

        // Render markdown or HTML
        if (route.file.endsWith('.md')) {
            const html = await spa.renderMarkdown(content);
            main.innerHTML = html;
        } else {
            main.innerHTML = content;
        }

        document.title = route.title || 'Untitled';
        history.replaceState({}, route.title, location.pathname);

        // Emit route:after event for enhancers
        if (spa.events) {
            spa.events.dispatchEvent(new CustomEvent('route:after', { detail: { route } }));
        }
        document.dispatchEvent(new CustomEvent('route:after', { detail: { route } }));
    }

    // SPA lifecycle: first load + route change
    await fetchRoutes();
    await handleNavigation();

    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a && a.href && a.origin === location.origin) {
            const relative = a.pathname.startsWith(basePath);
            if (relative) {
                e.preventDefault();
                history.pushState({}, '', a.pathname);
                handleNavigation();
            }
        }
    });
}

// Auto-initialize when loaded as standalone script
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        const routerScript = document.querySelector('script[src*="router.js"]');
        if (routerScript && window.spa) {
            const navPath = routerScript.getAttribute('data-nav');
            const options = navPath ? { nav: navPath } : {};
            await setup(window.spa, options);
        }
    });
}
