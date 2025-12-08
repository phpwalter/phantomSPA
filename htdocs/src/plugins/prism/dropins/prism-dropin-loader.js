/**
 * Prism Drop-in Loader
 *
 * A plugin architecture for extending Prism functionality without modifying core files.
 * Drop-ins are discovered from prism-config.json and loaded dynamically.
 *
 * Lifecycle Hooks:
 * - init: Called once when the drop-in is first loaded
 * - beforeHighlight: Called before Prism highlights code in a container
 * - afterHighlight: Called after Prism highlights code in a container
 * - onConfigChange: Called when user changes Prism settings
 * - destroy: Called when the drop-in is unloaded (if supported)
 *
 * @module dropins/prism-dropin-loader
 */

import { getDirectiveConfig } from '../prism-config.js';

// Registry of loaded drop-ins
const loadedDropins = new Map();

// Event subscribers by hook name
const hookSubscribers = {
    init: [],
    beforeHighlight: [],
    afterHighlight: [],
    onConfigChange: [],
    destroy: []
};

/**
 * Load all drop-ins defined in prism-config.json
 * @returns {Promise<void>}
 */
export async function loadDropins() {
    const config = getDirectiveConfig();
    const dropins = config.dropins || {};

    console.group('[prism-dropins] Loading drop-ins...');

    for (const [dropinName, dropinConfig] of Object.entries(dropins)) {
        // Skip $comment fields
        if (dropinName.startsWith('$')) continue;

        // Skip disabled drop-ins
        if (dropinConfig.enabled === false) {
            console.log(`[prism-dropins] Skipping disabled drop-in: ${dropinName}`);
            continue;
        }

        try {
            await loadDropin(dropinName, dropinConfig);
        } catch (err) {
            console.error(`[prism-dropins] Failed to load drop-in "${dropinName}":`, err);
        }
    }

    console.log(`[prism-dropins] Loaded ${loadedDropins.size} drop-ins`);
    console.groupEnd();
}

/**
 * Load a single drop-in module
 * @param {string} name - Drop-in name
 * @param {Object} config - Drop-in configuration
 */
async function loadDropin(name, config) {
    if (loadedDropins.has(name)) {
        console.warn(`[prism-dropins] Drop-in "${name}" already loaded`);
        return;
    }

    // Resolve module path relative to this file (now in dropins/ directory)
    const scriptUrl = import.meta.url;
    const basePath = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));

    // Module paths in config are relative to prism plugin root (e.g., "./dropins/foo.js")
    // Since we're now IN the dropins directory, we need to handle this
    let modulePath;
    if (config.module.startsWith('./dropins/')) {
        // Strip "./dropins/" prefix since we're already in dropins/
        modulePath = `${basePath}/${config.module.substring(10)}`;
    } else if (config.module.startsWith('./')) {
        // Relative to prism root, go up one level
        modulePath = `${basePath}/../${config.module.substring(2)}`;
    } else {
        modulePath = config.module;
    }

    console.log(`[prism-dropins] Loading "${name}" from ${modulePath}`);

    // Dynamically import the drop-in module
    const module = await import(modulePath);

    // Create drop-in instance with context
    const dropinInstance = {
        name,
        config,
        module,
        api: null
    };

    // Call init hook if present
    if (typeof module.init === 'function') {
        const api = await module.init({
            name,
            config: config.options || {},
            directiveConfig: getDirectiveConfig(),
            registerHook: (hookName, handler) => registerHook(name, hookName, handler)
        });
        dropinInstance.api = api;
    }

    // Auto-register lifecycle hooks from module exports
    for (const hookName of Object.keys(hookSubscribers)) {
        if (hookName !== 'init' && typeof module[hookName] === 'function') {
            registerHook(name, hookName, module[hookName]);
        }
    }

    loadedDropins.set(name, dropinInstance);
    console.log(`[prism-dropins] ✓ Loaded "${name}"`);
}

/**
 * Register a hook handler for a drop-in
 * @param {string} dropinName - Name of the drop-in
 * @param {string} hookName - Name of the lifecycle hook
 * @param {Function} handler - Handler function
 */
function registerHook(dropinName, hookName, handler) {
    if (!hookSubscribers[hookName]) {
        console.warn(`[prism-dropins] Unknown hook: ${hookName}`);
        return;
    }
    hookSubscribers[hookName].push({ dropinName, handler });
}

/**
 * Execute a lifecycle hook for all registered drop-ins
 * @param {string} hookName - Name of the hook to execute
 * @param {Object} context - Context object passed to handlers
 * @returns {Promise<void>}
 */
export async function executeHook(hookName, context = {}) {
    const subscribers = hookSubscribers[hookName] || [];

    for (const { dropinName, handler } of subscribers) {
        try {
            await handler(context);
        } catch (err) {
            console.error(`[prism-dropins] Error in ${dropinName}.${hookName}:`, err);
        }
    }
}

/**
 * Get a loaded drop-in by name
 * @param {string} name - Drop-in name
 * @returns {Object|null} Drop-in instance or null
 */
export function getDropin(name) {
    return loadedDropins.get(name) || null;
}

/**
 * Check if a drop-in is loaded
 * @param {string} name - Drop-in name
 * @returns {boolean}
 */
export function isDropinLoaded(name) {
    return loadedDropins.has(name);
}

/**
 * Get all loaded drop-in names
 * @returns {string[]}
 */
export function getLoadedDropins() {
    return Array.from(loadedDropins.keys());
}
