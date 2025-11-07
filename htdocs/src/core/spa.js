/**
 * @file spa.js
 * @path htdocs/src/core/spa.js
 * @description Core SPA application class
 */

import { eventBus } from './event-bus.js';
import { pluginManager } from './plugin-manager.js';
import { AppError, ErrorHandler } from './error-handler.js';
import { EVENTS } from '../config/constants.js';

/**
 * Core SPA application class
 */
export class SPA {
    /**
     * Creates a new SPA instance
     * @param {Object} config - Application configuration
     */
    constructor(config) {
        this.config = config;
        this.router = null;
        this.plugins = pluginManager;
        this.events = eventBus;
        this.initialized = false;
    }

    /**
     * Initializes the SPA application
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initialized) {
            console.warn('[SPA] Already initialized');
            return;
        }

        try {
            console.info('[SPA] Initializing...');
            eventBus.emit(EVENTS.APP_INIT);

            // Initialize plugins if configured
            if (this.config.get('plugins')) {
                await this.loadPlugins();
            }

            this.initialized = true;
            eventBus.emit(EVENTS.APP_READY);
            console.info('[SPA] Initialization complete');

        } catch (error) {
            const appError = new AppError(
                `SPA initialization failed: ${error.message}`,
                'CRITICAL_APP_INIT',
                { originalError: error }
            );

            await ErrorHandler.handle(appError);
            throw appError;
        }
    }

    /**
     * Loads configured plugins
     * @returns {Promise<void>}
     */
    async loadPlugins() {
        const pluginsConfig = this.config.get('plugins');

        if (!pluginsConfig || typeof pluginsConfig !== 'object') {
            return;
        }

        const pluginEntries = Object.entries(pluginsConfig);

        for (const [name, pluginConfig] of pluginEntries) {
            try {
                if (pluginConfig.enabled === false) {
                    console.info(`[SPA] Skipping disabled plugin: ${name}`);
                    continue;
                }

                console.info(`[SPA] Loading plugin: ${name}`);

                // Dynamic import of plugin
                const pluginPath = pluginConfig.path || `/src/plugins/${name}.js`;
                const pluginModule = await import(pluginPath);

                await this.plugins.register(
                    name,
                    pluginModule,
                    pluginConfig.options || {}
                );

            } catch (error) {
                console.error(`[SPA] Failed to load plugin "${name}":`, error);
                // Don't throw - continue loading other plugins
            }
        }
    }

    /**
     * Sets the router instance
     * @param {Object} router - Router instance
     */
    setRouter(router) {
        this.router = router;
    }

    /**
     * Gets the application configuration
     * @returns {Object} Configuration instance
     */
    getConfig() {
        return this.config;
    }

    /**
     * Destroys the SPA instance
     */
    destroy() {
        this.plugins.clear();
        this.events.clearAll();
        this.initialized = false;
        console.info('[SPA] Destroyed');
    }
}

/**
 * Creates and initializes a SPA instance
 * @param {Object} config - Application configuration
 * @returns {Promise<SPA>} Initialized SPA instance
 */
export async function createApp(config) {
    const app = new SPA(config);
    await app.init();
    return app;
}

/**
 * Auto-initialization when loaded as a module script
 * Loads app-config.json and initializes the SPA
 */
async function autoInitializeSPA() {
    try {
        // Find the main element with data-config attribute
        const mainElement = document.querySelector('[data-config]');
        if (!mainElement) {
            console.warn('[SPA] No element with data-config attribute found');
            return;
        }

        const configUrl = mainElement.dataset.config;
        if (!configUrl) {
            console.warn('[SPA] data-config attribute is empty');
            return;
        }

        console.info('[SPA] Auto-initializing with config:', configUrl);

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // Fetch and parse the app configuration
        const response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error(`Failed to load config: ${configUrl} (${response.status})`);
        }

        const configData = await response.json();

        // Create AppConfig instance
        const { AppConfig } = await import('../config/app-config.js');
        const config = new AppConfig(configData);

        // Create and initialize the SPA
        const app = await createApp(config);

        // Store app globally for access
        window.app = app;

        console.info('[SPA] Auto-initialization complete');

    } catch (error) {
        console.error('[SPA] Auto-initialization failed:', error);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitializeSPA);
} else {
    autoInitializeSPA();
}
