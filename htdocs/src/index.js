/**
 * @file index.js
 * @path htdocs/src/index.js
 * @description Main entry point for PhantomSPA
 */

export { createApp } from './core/spa.js';
export { Router } from './core/router.js';
export { eventBus, EventBus } from './core/event-bus.js';
export { pluginManager, PluginManager } from './core/plugin-manager.js';
export { AppError, ErrorHandler } from './core/error-handler.js';
export { AppConfig, createAppConfig, getDefaultConfig } from './config/app-config.js';
export { NavController, initNavigation } from './core/nav/nav-controller.js';

/**
 * Main initialization function
 * @param {Object} [config={}] - Application configuration
 * @returns {Promise<Object>} Initialized application instance
 */
export async function initPhantom(config = {}) {
    try {
        const appConfig = await createAppConfig(config);
        const app = await createApp(appConfig);

        return {
            app,
            config: appConfig,
            router: app.router,
            plugins: app.plugins
        };
    } catch (error) {
        console.error('[PhantomSPA] Initialization failed:', error);
        throw error;
    }
}
