/**
 * @file app-config.js
 * @path htdocs/src/config/app-config.js
 * @description Centralized application configuration management
 */

import { fetchJSON } from '../utilities/fetch-helper.js';
import { AppError } from '../core/error-handler.js';
import { validatePluginConfig } from '../utilities/schema-validator.js';

/**
 * Application configuration manager
 */
export class AppConfig {
    /**
     * Creates a new AppConfig instance
     * @param {Object} [userConfig={}] - User-provided configuration overrides
     */
    constructor(userConfig = {}) {
        this.config = {
            paths: {
                docsBase: '/docs',
                devDocs: '/docs/dev',
                navConfig: '/docs/dev/conf/nav.json',
                appConfig: '/docs/dev/conf/app-config.json',
                navTemplate: '/docs/dev/pages/nav.html',
                contentRoot: '/docs/dev/pages/',
                schemasDir: '/src/config/schemas',
                ...userConfig.paths
            },
            storage: {
                prefix: 'phantom.',
                keys: {
                    docsSpace: 'docs.space',
                    navTreeDetails: 'navTreeDetails',
                    navTreeConfig: 'navTreeConfig'
                },
                ...userConfig.storage
            },
            nav: {
                maxDepth: 10,
                autoExpand: false,
                collapseByDefault: true,
                activeClass: 'active',
                ...userConfig.nav
            },
            features: {
                autoRedirect: false,
                centerBadges: true,
                validateSchemas: true,
                ...userConfig.features
            },
            plugins: {
                ...userConfig.plugins
            }
        };
    }

    /**
     * Gets a configuration value by dot-notation path
     * @param {string} path - Configuration path (e.g., 'paths.docsBase')
     * @param {any} [defaultValue] - Default value if path not found
     * @returns {any} Configuration value
     */
    get(path, defaultValue = undefined) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], this.config);
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Sets a configuration value by dot-notation path
     * @param {string} path - Configuration path
     * @param {any} value - Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) {
                obj[key] = {};
            }
            return obj[key];
        }, this.config);
        target[last] = value;
    }

    /**
     * Merges additional configuration
     * @param {Object} additionalConfig - Configuration to merge
     */
    merge(additionalConfig) {
        this.config = this.deepMerge(this.config, additionalConfig);
    }

    /**
     * Deep merges two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const output = { ...target };

        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }

        return output;
    }

    /**
     * Checks if value is a plain object
     * @param {any} item - Item to check
     * @returns {boolean} True if plain object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    /**
     * Loads configuration from external JSON file
     * @param {string} [url] - URL to configuration file
     * @returns {Promise<void>}
     */
    async loadFromFile(url) {
        const configUrl = url || this.get('paths.appConfig');

        try {
            const externalConfig = await fetchJSON(configUrl);

            // Validate plugin configuration if enabled
            if (this.get('features.validateSchemas') && externalConfig.plugins) {
                const validation = validatePluginConfig(externalConfig);

                if (!validation.isValid) {
                    console.warn('[AppConfig] Configuration validation warnings:', validation.errors);
                    // Don't throw - just warn about issues
                }
            }

            this.merge(externalConfig);
            console.info('[AppConfig] External configuration loaded:', configUrl);
        } catch (error) {
            console.warn('[AppConfig] Failed to load external config:', error.message);
            // Don't throw - external config is optional
        }
    }

    /**
     * Gets a storage key with prefix
     * @param {string} key - Storage key name
     * @returns {string} Prefixed storage key
     */
    getStorageKey(key) {
        const prefix = this.get('storage.prefix');
        const configKey = this.get(`storage.keys.${key}`, key);
        return prefix + configKey;
    }

    /**
     * Saves value to localStorage with proper prefix
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    saveToStorage(key, value) {
        const storageKey = this.getStorageKey(key);
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(storageKey, serialized);
        } catch (error) {
            console.error('[AppConfig] Failed to save to storage:', error);
        }
    }

    /**
     * Loads value from localStorage with proper prefix
     * @param {string} key - Storage key
     * @param {any} [defaultValue] - Default value if not found
     * @returns {any} Stored value or default
     */
    loadFromStorage(key, defaultValue = null) {
        const storageKey = this.getStorageKey(key);
        try {
            const item = localStorage.getItem(storageKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('[AppConfig] Failed to load from storage:', error);
            return defaultValue;
        }
    }

    /**
     * Gets full configuration object
     * @returns {Object} Configuration object
     */
    getAll() {
        return { ...this.config };
    }
}

/**
 * Creates and initializes application configuration
 * @param {Object} [userConfig={}] - User configuration overrides
 * @param {boolean} [loadExternal=true] - Whether to load external config file
 * @returns {Promise<AppConfig>} Initialized configuration instance
 */
export async function createAppConfig(userConfig = {}, loadExternal = true) {
    const config = new AppConfig(userConfig);

    if (loadExternal) {
        await config.loadFromFile();
    }

    return config;
}

/**
 * Default configuration instance (singleton pattern)
 */
let defaultConfigInstance = null;

/**
 * Gets the default configuration instance
 * @returns {Promise<AppConfig>} Default configuration instance
 */
export async function getDefaultConfig() {
    if (!defaultConfigInstance) {
        defaultConfigInstance = await createAppConfig();
    }
    return defaultConfigInstance;
}
