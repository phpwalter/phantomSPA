/**
 * @file constants.js
 * @path htdocs/src/config/constants.js
 * @description Application-wide constants
 */

/**
 * Application name and version
 */
export const APP = {
    NAME: 'PhantomSPA',
    VERSION: '0.0.1',
    NAMESPACE: 'phantom'
};

/**
 * Error codes
 */
export const ERROR_CODES = {
    // Navigation errors
    NAV_CONTAINER_MISSING: 'NAV_CONTAINER_MISSING',
    NAV_FETCH_ERROR: 'NAV_FETCH_ERROR',
    NAV_TEMPLATE_ERROR: 'NAV_TEMPLATE_ERROR',
    NAV_INVALID_DATA: 'NAV_INVALID_DATA',

    // Fetch errors
    FETCH_HTTP_ERROR: 'FETCH_HTTP_ERROR',
    FETCH_PARSE_ERROR: 'FETCH_PARSE_ERROR',
    FETCH_NETWORK_ERROR: 'FETCH_NETWORK_ERROR',

    // Router errors
    ROUTER_INIT_ERROR: 'ROUTER_INIT_ERROR',
    ROUTER_ROUTE_ERROR: 'ROUTER_ROUTE_ERROR',

    // Plugin errors
    PLUGIN_LOAD_ERROR: 'PLUGIN_LOAD_ERROR',
    PLUGIN_INIT_ERROR: 'PLUGIN_INIT_ERROR',

    // Critical errors
    CRITICAL_APP_INIT: 'CRITICAL_APP_INIT',
    CRITICAL_CONFIG_LOAD: 'CRITICAL_CONFIG_LOAD'
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

/**
 * LocalStorage keys (with prefix)
 */
export const STORAGE_KEYS = {
    PREFIX: 'phantom.',
    DOCS_SPACE: 'docs.space',
    NAV_TREE_DETAILS: 'navTreeDetails',
    NAV_TREE_CONFIG: 'navTreeConfig',
    USER_PREFERENCES: 'userPreferences',
    THEME: 'theme'
};

/**
 * Default paths
 */
export const PATHS = {
    DOCS_BASE: '/docs',
    DEV_DOCS: '/docs/dev',
    NAV_CONFIG: '/docs/dev/conf/nav.json',
    APP_CONFIG: '/docs/dev/conf/app-config.json',
    NAV_TEMPLATE: '/docs/dev/pages/nav.html',
    CONTENT_ROOT: '/docs/dev/pages/'
};

/**
 * Event names
 */
export const EVENTS = {
    // App lifecycle
    APP_INIT: 'app:init',
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error',

    // Router events
    ROUTE_CHANGE: 'route:change',
    ROUTE_BEFORE: 'route:before',
    ROUTE_AFTER: 'route:after',
    ROUTE_ERROR: 'route:error',

    // Navigation events
    NAV_LOADED: 'nav:loaded',
    NAV_ERROR: 'nav:error',

    // Plugin events
    PLUGIN_LOADED: 'plugin:loaded',
    PLUGIN_ERROR: 'plugin:error'
};

/**
 * CSS class names
 */
export const CSS_CLASSES = {
    ACTIVE: 'active',
    LOADING: 'loading',
    ERROR: 'error',
    HIDDEN: 'hidden',
    NAV_LINK: 'nav-link',
    NAV_LIST: 'nav-list'
};

/**
 * Default timeouts (in milliseconds)
 */
export const TIMEOUTS = {
    FETCH: 10000,
    DEBOUNCE: 300,
    THROTTLE: 150,
    ANIMATION: 300
};

/**
 * Feature flags
 */
export const FEATURES = {
    AUTO_REDIRECT: false,
    CENTER_BADGES: true,
    LAZY_LOAD_PLUGINS: true,
    CACHE_ENABLED: true
};
