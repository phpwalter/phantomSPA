/**
 * @file router.js
 * @path htdocs/src/router.js
 * @description Client-side routing system
 */

import { eventBus } from './event-bus.js';
import { AppError, ErrorHandler } from './error-handler.js';
import { EVENTS } from '../config/constants.js';

/**
 * Client-side router
 */
export class Router {
    /**
     * Creates a new Router instance
     * @param {Array} [routes=[]] - Route configuration array
     * @param {Object} [options={}] - Router options
     */
    constructor(routes = [], options = {}) {
        this.routes = new Map();
        this.currentRoute = null;
        this.options = {
            base: '',
            mode: 'history',
            ...options
        };

        this.registerRoutes(routes);
    }

    /**
     * Initializes the router
     */
    init() {
        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            if (!link || !link.href) {
                return;
            }

            console.debug(`[Router] Link clicked: href="${link.href}", pathname="${link.pathname}", origin="${link.origin}", location.origin="${location.origin}"`);

            // Only handle internal links
            if (link.origin !== location.origin) {
                console.debug(`[Router] Skipping external link`);
                return;
            }

            // Allow default if modifier keys are pressed
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
                console.debug(`[Router] Skipping link with modifier keys`);
                return;
            }

            // Check for external link indicators
            if (link.hasAttribute('target') || link.hasAttribute('download')) {
                console.debug(`[Router] Skipping link with target or download attribute`);
                return;
            }

            console.debug(`[Router] Intercepting link click, calling navigate()`);
            e.preventDefault();
            this.navigate(link.pathname);
        });

        // Handle initial route
        this.handleRouteChange();
    }

    /**
     * Registers multiple routes
     * @param {Array} routes - Route configuration array
     */
    registerRoutes(routes) {
        routes.forEach(route => {
            this.register(route.path, route);
        });
    }

    /**
     * Registers a single route
     * @param {string} path - Route path
     * @param {Object} routeConfig - Route configuration (may include handler function)
     */
    register(path, routeConfig) {
        const pattern = this.pathToRegex(path);

        // Extract handler function if it exists
        const handler = typeof routeConfig.handler === 'function'
            ? routeConfig.handler
            : null;

        // Store route with handler function and other route metadata
        this.routes.set(path, {
            pattern,
            handler,
            path,
            // Store other route metadata for plugins
            ...routeConfig
        });

        console.debug(`[Router] Registered route: "${path}" (has handler: ${!!handler})`);
    }

    /**
     * Converts path string to regex pattern
     * @param {string} path - Path string
     * @returns {RegExp} Regular expression pattern
     */
    pathToRegex(path) {
        if (path === '*') {
            return /.*/;
        }

        // Convert :param to regex group
        const regexPath = path
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '(?<$1>[^/]+)');

        const pattern = new RegExp(`^${regexPath}$`);
        console.debug(`[Router] pathToRegex: "${path}" -> "${pattern.source}"`);
        return pattern;
    }

    /**
     * Matches current path against routes
     * @param {string} path - Path to match
     * @returns {Object|null} Matched route or null
     */
    match(path) {
        console.debug(`[Router] Matching path: "${path}"`);
        console.debug(`[Router] Available routes: ${Array.from(this.routes.keys()).join(', ')}`);

        for (const [routePath, route] of this.routes) {
            const match = path.match(route.pattern);
            console.debug(`[Router] Testing "${path}" against route "${routePath}" (pattern: ${route.pattern.source}): ${match ? 'MATCH' : 'no match'}`);

            if (match) {
                console.info(`[Router] Route matched: "${routePath}"`);
                return {
                    route,
                    params: match.groups || {}
                };
            }
        }

        // Try to match wildcard route
        const wildcardRoute = this.routes.get('*');
        if (wildcardRoute) {
            console.info(`[Router] Matched wildcard route`);
            return {
                route: wildcardRoute,
                params: {}
            };
        }

        console.warn(`[Router] No route matched for path: "${path}"`);
        return null;
    }

    /**
     * Navigates to a path
     * @param {string} path - Path to navigate to (can be full pathname or relative path)
     * @param {Object} [state={}] - History state
     */
    navigate(path, state = {}) {
        console.debug(`[Router] navigate() called with path: "${path}"`);
        if (this.options.mode === 'history') {
            // If path already includes the base path, use it as-is
            // Otherwise, prepend the base path
            const fullPath = path.startsWith(this.options.base)
                ? path
                : this.options.base + path;
            console.debug(`[Router] navigate() setting URL to: "${fullPath}"`);
            window.history.pushState(state, '', fullPath);
        }

        console.debug(`[Router] navigate() calling handleRouteChange()`);
        this.handleRouteChange();
    }

    /**
     * Replaces current history entry
     * @param {string} path - Path to navigate to (can be full pathname or relative path)
     * @param {Object} [state={}] - History state
     */
    replace(path, state = {}) {
        if (this.options.mode === 'history') {
            // If path already includes the base path, use it as-is
            // Otherwise, prepend the base path
            const fullPath = path.startsWith(this.options.base)
                ? path
                : this.options.base + path;
            window.history.replaceState(state, '', fullPath);
        }

        this.handleRouteChange();
    }

    /**
     * Goes back in history
     */
    back() {
        window.history.back();
    }

    /**
     * Goes forward in history
     */
    forward() {
        window.history.forward();
    }

    /**
     * Handles route changes
     */
    async handleRouteChange() {
        // Get the current pathname and remove the base path
        let pathname = location.pathname;
        console.debug(`[Router] handleRouteChange: location.pathname = "${pathname}"`);
        console.debug(`[Router] handleRouteChange: base = "${this.options.base}"`);

        // If the pathname ends with a filename (e.g., index.html), use the directory
        if (pathname.includes('.html') || pathname.includes('.htm')) {
            pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
            console.debug(`[Router] handleRouteChange: stripped filename, pathname = "${pathname}"`);
        }

        // Remove base path to get the route path
        let path = pathname.replace(this.options.base, '');
        // Ensure path starts with / for route matching
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        path = path || '/';
        console.debug(`[Router] handleRouteChange: extracted path = "${path}"`);

        const matched = this.match(path);

        if (!matched) {
            console.warn(`[Router] No route matched for path: ${path}`);
            eventBus.emit(EVENTS.ROUTE_ERROR, { path });
            return;
        }

        try {
            eventBus.emit(EVENTS.ROUTE_BEFORE, {
                from: this.currentRoute,
                to: matched.route,
                params: matched.params
            });

            this.currentRoute = matched.route;

            // Execute route handler if it's a function
            if (typeof matched.route.handler === 'function') {
                await matched.route.handler(matched.params);
            }

            eventBus.emit(EVENTS.ROUTE_AFTER, {
                route: matched.route,
                params: matched.params
            });

            eventBus.emit(EVENTS.ROUTE_CHANGE, {
                route: matched.route,
                params: matched.params,
                path
            });

        } catch (error) {
            const routeError = new AppError(
                `Route handler error: ${error.message}`,
                'ROUTER_ROUTE_ERROR',
                { path, error }
            );

            await ErrorHandler.handle(routeError);
            eventBus.emit(EVENTS.ROUTE_ERROR, { path, error: routeError });
        }
    }

    /**
     * Gets current route
     * @returns {Object|null} Current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Gets current path
     * @returns {string} Current path
     */
    getCurrentPath() {
        return location.pathname.replace(this.options.base, '') || '/';
    }
}

/**
 * Auto-initialization when loaded as a module script
 * Reads data attributes from the script tag and initializes the router
 */
async function autoInitializeRouter() {
    try {
        // Find the router script tag
        // For module scripts, document.currentScript may not work, so we search for it
        let script = document.currentScript;
        if (!script || !script.src.includes('router.js')) {
            script = Array.from(document.scripts).find(s => s.src && s.src.includes('router.js'));
        }

        if (!script) {
            console.warn('[Router] Could not find router script tag');
            return;
        }

        // Read configuration from data attributes
        const navUrl = script.dataset.nav || '/docs/dev/conf/nav.json';
        const mainSelector = script.dataset.main || '#app-shell';
        const asideSelector = script.dataset.aside || '#site-nav';
        const activeClass = script.dataset.activeClass || 'active';

        // Extract base path from nav URL (e.g., /docs/dev/conf/nav.json -> /docs/dev/)
        let basePath = script.dataset.basePath;
        if (!basePath) {
            // Extract from nav URL: /docs/dev/conf/nav.json -> /docs/dev/
            basePath = navUrl.replace(/\/conf\/.*$/, '').replace(/\/$/, '') + '/';
        }

        console.info('[Router] Auto-initializing with config:', {
            navUrl,
            mainSelector,
            asideSelector,
            activeClass,
            basePath
        });

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // Fetch navigation configuration
        const navResponse = await fetch(navUrl);
        if (!navResponse.ok) {
            throw new Error(`Failed to load nav config: ${navResponse.status}`);
        }

        const navConfig = await navResponse.json();
        const routes = navConfig.routes || [];
        const contentRoot = navConfig.contentRoot || '/docs/dev/pages/';

        console.info(`[Router] Loaded nav config from ${navUrl}`);
        console.info(`[Router] Found ${routes.length} top-level routes`);
        console.debug(`[Router] Routes:`, routes.map(r => ({ path: r.path, hasChildren: !!r.children, hasFile: !!r.file })));

        // Find main content element
        const mainElement = document.querySelector(mainSelector);
        if (!mainElement) {
            throw new Error(`Main element not found: ${mainSelector}`);
        }

        // Create route handlers that load and render markdown
        const routesWithHandlers = routes.map(route => {
            // Skip routes without a file property
            if (!route.file) {
                console.warn(`[Router] Route "${route.path}" has no file property, skipping handler`);
                return route;
            }

            return {
                ...route,
                handler: async (params) => {
                    try {
                        const filePath = `${contentRoot}${route.file}`;

                        console.info(`[Router] Loading: ${filePath}`);

                    const response = await fetch(filePath);
                    if (!response.ok) {
                        throw new Error(`Failed to load: ${filePath} (${response.status})`);
                    }

                    let content = await response.text();

                    // Render markdown or HTML
                    if (route.file.endsWith('.md')) {
                        // Import markdown renderer
                        const { markdownToHtml } = await import('../utilities/markdown.js');
                        content = await markdownToHtml(content);

                        // Wrap in doc-page container for styling
                        content = `<div class="doc-page md">${content}</div>`;
                    }

                    // Inject content into main element
                    mainElement.innerHTML = content;

                    // Load page-specific CSS if configured
                    if (route.css) {
                        const existingLink = document.querySelector(`link[href="${route.css}"]`);
                        if (!existingLink) {
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = route.css;
                            document.head.appendChild(link);
                        }
                    }

                    // Emit custom event for plugins (Prism, etc.)
                    document.dispatchEvent(new CustomEvent('route:after', {
                        detail: { route, params }
                    }));

                    console.info(`[Router] Rendered: ${route.path}`);

                } catch (error) {
                    console.error(`[Router] Failed to load route ${route.path}:`, error);
                    mainElement.innerHTML = `<div class="error"><h1>Error</h1><p>${error.message}</p></div>`;
                }
            }
            };
        });

        // Create and initialize router
        const router = new Router(routesWithHandlers, {
            base: basePath,
            mode: 'history'
        });

        console.info(`[Router] Created router with ${router.routes.size} routes`);
        console.debug(`[Router] Registered routes:`, Array.from(router.routes.keys()));

        // Initialize the router (sets up event listeners and handles initial route)
        router.init();

        // Store router globally for access
        window.router = router;

        console.info('[Router] Initialization complete');

    } catch (error) {
        console.error('[Router] Auto-initialization failed:', error);
    }
}

// Auto-initialize when DOM is ready and SPA is initialized
async function waitForAutoInitialization() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }

    // Wait for SPA to be ready (plugins loaded)
    // Listen for the APP_READY event from the eventBus
    const { eventBus } = await import('./event-bus.js');
    const { EVENTS } = await import('../config/constants.js');

    // If app is already ready, initialize immediately
    if (window.app) {
        await autoInitializeRouter();
    } else {
        // Wait for APP_READY event
        eventBus.once(EVENTS.APP_READY, autoInitializeRouter);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForAutoInitialization);
} else {
    waitForAutoInitialization();
}
