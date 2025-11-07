/**
 * @file plugin-manager.js
 * @path htdocs/src/core/plugin-manager.js
 * @description Plugin system for extensible functionality
 */

import { eventBus } from './event-bus.js';
import { AppError } from './error-handler.js';
import { EVENTS } from '../config/constants.js';

/**
 * Plugin manager for registering and managing plugins
 */
export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
        this.loading = new Set();
    }

    /**
     * Registers a plugin
     * @param {string} name - Plugin name
     * @param {Object} plugin - Plugin object with init method
     * @param {Object} [options={}] - Plugin options
     * @returns {Promise<void>}
     * @throws {AppError} If plugin already registered or init fails
     */
    async register(name, plugin, options = {}) {
        if (this.plugins.has(name)) {
            throw new AppError(
                `Plugin "${name}" is already registered`,
                'PLUGIN_ALREADY_REGISTERED',
                { pluginName: name }
            );
        }

        if (this.loading.has(name)) {
            throw new AppError(
                `Plugin "${name}" is currently loading`,
                'PLUGIN_LOADING',
                { pluginName: name }
            );
        }

        try {
            this.loading.add(name);
            console.info(`[PluginManager] Registering plugin: ${name}`);

            // Check dependencies
            if (options.dependencies && Array.isArray(options.dependencies)) {
                for (const dep of options.dependencies) {
                    if (!this.plugins.has(dep)) {
                        throw new AppError(
                            `Plugin "${name}" requires dependency "${dep}" which is not loaded`,
                            'PLUGIN_DEPENDENCY_MISSING',
                            { pluginName: name, dependency: dep }
                        );
                    }
                }
            }

            // Initialize plugin
            if (typeof plugin.init === 'function') {
                await plugin.init(this, options);
            }

            this.plugins.set(name, {
                plugin,
                options,
                enabled: true
            });

            this.loading.delete(name);

            eventBus.emit(EVENTS.PLUGIN_LOADED, { name, plugin });
            console.info(`[PluginManager] Plugin registered: ${name}`);

        } catch (error) {
            this.loading.delete(name);

            const pluginError = error instanceof AppError ? error : new AppError(
                `Failed to register plugin "${name}": ${error.message}`,
                'PLUGIN_INIT_ERROR',
                { pluginName: name, originalError: error }
            );

            eventBus.emit(EVENTS.PLUGIN_ERROR, { name, error: pluginError });
            throw pluginError;
        }
    }

    /**
     * Gets a registered plugin
     * @param {string} name - Plugin name
     * @returns {Object|null} Plugin object or null if not found
     */
    get(name) {
        const entry = this.plugins.get(name);
        return entry ? entry.plugin : null;
    }

    /**
     * Checks if a plugin is registered
     * @param {string} name - Plugin name
     * @returns {boolean} True if registered
     */
    has(name) {
        return this.plugins.has(name);
    }

    /**
     * Enables a plugin
     * @param {string} name - Plugin name
     */
    enable(name) {
        const entry = this.plugins.get(name);
        if (entry) {
            entry.enabled = true;
            console.info(`[PluginManager] Plugin enabled: ${name}`);
        }
    }

    /**
     * Disables a plugin
     * @param {string} name - Plugin name
     */
    disable(name) {
        const entry = this.plugins.get(name);
        if (entry) {
            entry.enabled = false;
            console.info(`[PluginManager] Plugin disabled: ${name}`);
        }
    }

    /**
     * Checks if a plugin is enabled
     * @param {string} name - Plugin name
     * @returns {boolean} True if enabled
     */
    isEnabled(name) {
        const entry = this.plugins.get(name);
        return entry ? entry.enabled : false;
    }

    /**
     * Registers a hook callback
     * @param {string} hookName - Hook name
     * @param {Function} callback - Hook callback function
     * @param {number} [priority=10] - Execution priority (lower runs first)
     * @returns {Function} Function to unregister the hook
     */
    hook(hookName, callback, priority = 10) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }

        const hookEntry = { callback, priority };
        const hooks = this.hooks.get(hookName);
        hooks.push(hookEntry);

        // Sort by priority
        hooks.sort((a, b) => a.priority - b.priority);

        // Return unhook function
        return () => {
            const index = hooks.indexOf(hookEntry);
            if (index !== -1) {
                hooks.splice(index, 1);
            }
        };
    }

    /**
     * Triggers a hook
     * @param {string} hookName - Hook name
     * @param {any} data - Data to pass to hooks
     * @returns {Promise<any>} Modified data after all hooks
     */
    async trigger(hookName, data) {
        const hooks = this.hooks.get(hookName);
        if (!hooks || hooks.length === 0) {
            return data;
        }

        let result = data;

        for (const { callback } of hooks) {
            try {
                const returned = await callback(result);
                if (returned !== undefined) {
                    result = returned;
                }
            } catch (error) {
                console.error(`[PluginManager] Error in hook "${hookName}":`, error);
            }
        }

        return result;
    }

    /**
     * Gets all registered plugin names
     * @returns {Array<string>} Array of plugin names
     */
    getPluginNames() {
        return Array.from(this.plugins.keys());
    }

    /**
     * Gets count of registered plugins
     * @returns {number} Number of plugins
     */
    count() {
        return this.plugins.size;
    }

    /**
     * Unregisters a plugin
     * @param {string} name - Plugin name
     */
    unregister(name) {
        const entry = this.plugins.get(name);
        if (entry && typeof entry.plugin.destroy === 'function') {
            entry.plugin.destroy();
        }
        this.plugins.delete(name);
        console.info(`[PluginManager] Plugin unregistered: ${name}`);
    }

    /**
     * Clears all plugins
     */
    clear() {
        this.plugins.forEach((entry, name) => {
            this.unregister(name);
        });
    }
}

/**
 * Global plugin manager instance (singleton)
 */
export const pluginManager = new PluginManager();
