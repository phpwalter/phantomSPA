/**
 * PhantomSPA Router Plugin
 * Handles navigation and content loading with basePath awareness.
 * Supports dynamic CSS loading per route.
 */

export async function setup(spa, options = {}) {
    const config = options.config || spa.config || {};
    const navPath = options.nav || config.nav || '/docs/dev/conf/nav.json';
    const basePath = config.basePath || '/docs/dev/';
    const contentRoot = config.contentRoot || '/docs/dev/pages/';
    let routes = [];

    // Track loaded page-specific CSS
    const loadedPageCSS = new Set();
    let currentPageCSSId = null;

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
     * Dynamically load a CSS file
     * @param {string} href - CSS file path
     * @param {string} id - Unique ID for the link element
     * @returns {Promise} Resolves when CSS is loaded
     */
    function loadCSS(href, id) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.getElementById(id)) {
                console.log(`[router] CSS already loaded: ${id}`);
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                loadedPageCSS.add(id);
                console.log(`[router] CSS loaded: ${href}`);
                resolve();
            };
            link.onerror = () => {
                console.warn(`[router] Failed to load CSS: ${href}`);
                reject(new Error(`Failed to load CSS: ${href}`));
            };
            document.head.appendChild(link);
        });
    }

    /**
     * Unload the current page-specific CSS
     */
    function unloadCurrentPageCSS() {
        if (currentPageCSSId) {
            const link = document.getElementById(currentPageCSSId);
            if (link) {
                link.remove();
                loadedPageCSS.delete(currentPageCSSId);
                console.log(`[router] CSS unloaded: ${currentPageCSSId}`);
            }
            currentPageCSSId = null;
        }
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

        // Unload previous page-specific CSS
        unloadCurrentPageCSS();

        // Load page-specific CSS if specified
        if (route.css) {
            const cssId = `page-css-${route.path.replace(/\//g, '-')}`;
            try {
                await loadCSS(route.css, cssId);
                currentPageCSSId = cssId;
            } catch (err) {
                console.warn(`[router] CSS loading failed, continuing anyway:`, err);
            }
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
            // Wrap markdown content in .doc-page.md container for styling
            main.innerHTML = `<div class="doc-page md">${html}</div>`;
        } else {
            // HTML files may already have their own wrapper
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

// Self-initialization when loaded as standalone script
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const script = document.currentScript || document.querySelector('script[src*="router.js"]');

        // Only self-initialize if loaded as standalone script (has data attributes)
        if (script && script.hasAttribute('data-nav')) {
            const nav = script.getAttribute('data-nav');

            // Wait for window.spa to be initialized by spa.js
            const initRouter = () => {
                if (window.spa && window.spa.renderMarkdown) {
                    const options = {
                        nav: nav,
                        config: window.spa.config || {}
                    };
                    setup(window.spa, options).catch(err => {
                        console.error('[router.js] Standalone initialization failed:', err);
                    });
                } else {
                    // Retry after a short delay if spa not ready yet
                    setTimeout(initRouter, 50);
                }
            };

            initRouter();
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
