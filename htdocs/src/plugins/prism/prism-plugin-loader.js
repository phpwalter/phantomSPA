/**
 * Prism Plugin Loader
 *
 * Loads Prism.js plugins in the correct order to ensure dependencies are satisfied.
 * All configuration is driven by app-config.json - no hardcoded paths or dependencies.
 */

/**
 * Load a script dynamically
 * @param {string} url - Script URL
 * @returns {Promise} - Resolves when script loads
 */
function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve(url);
        script.onerror = () => reject(new Error(`Failed to load: ${url}`));
        document.head.appendChild(script);
    });
}

/**
 * Load Prism plugins in the correct order based on config
 * @param {Array} pluginConfigs - Array of plugin configuration objects from app-config.json
 * @param {string} cdnBase - CDN base URL with {version} placeholder
 * @returns {Promise} - Resolves when all plugins are loaded
 */
export async function loadPrismPlugins(pluginConfigs = [], cdnBase = '') {
    console.log('[prism-loader] Starting plugin load...');
    console.log('[prism-loader] Plugin configs:', pluginConfigs);
    console.log('[prism-loader] Prism exists:', !!window.Prism);
    console.log('[prism-loader] Current plugins:', Object.keys(window.Prism?.plugins || {}));

    // Check if Prism is loaded
    if (!window.Prism) {
        console.error('[prism-loader] ERROR: Prism core not loaded!');
        return;
    }

    // If no plugins to load, exit early
    if (!pluginConfigs || pluginConfigs.length === 0) {
        console.log('[prism-loader] No plugins to load');
        return;
    }

    console.log('[prism-loader] Loading plugins...');

    try {
        // Build a map of plugin name -> config for easy lookup
        const pluginMap = {};
        for (const plugin of pluginConfigs) {
            pluginMap[plugin.name] = plugin;
        }

        // Collect all plugins including dependencies
        const allPluginsToLoad = new Map(); // name -> config

        function addPluginWithDeps(pluginName) {
            if (allPluginsToLoad.has(pluginName)) {
                return; // Already added
            }

            const pluginConfig = pluginMap[pluginName];
            if (!pluginConfig) {
                console.warn(`[prism-loader] Plugin "${pluginName}" not found in config`);
                return;
            }

            // Add dependencies first (recursive)
            if (pluginConfig.dependencies && pluginConfig.dependencies.length > 0) {
                for (const dep of pluginConfig.dependencies) {
                    addPluginWithDeps(dep);
                }
            }

            // Add the plugin itself
            allPluginsToLoad.set(pluginName, pluginConfig);
        }

        // Add all requested plugins with their dependencies
        for (const plugin of pluginConfigs) {
            addPluginWithDeps(plugin.name);
        }

        // Load plugins in the order they were added (dependencies first)
        const pluginsToLoadInOrder = Array.from(allPluginsToLoad.values());

        console.log('[prism-loader] Load order:', pluginsToLoadInOrder.map(p => p.name));

        for (const plugin of pluginsToLoadInOrder) {
            try {
                const url = cdnBase + plugin.jsPath;
                console.log(`[prism-loader] Loading ${plugin.name} from ${url}...`);
                await loadScript(url);
                console.log(`[prism-loader] ${plugin.name} loaded ✓`);
            } catch (err) {
                console.error(`[prism-loader] Failed to load ${plugin.name}:`, err);
            }
        }

        console.log('[prism-loader] ✅ Plugin loading complete!');
        console.log('[prism-loader] Loaded plugins:', Object.keys(window.Prism.plugins));

    } catch (error) {
        console.error('[prism-loader] Failed to load plugins:', error);
    }
}

// Note: Auto-load removed - plugins are loaded explicitly by router.js
// This ensures proper timing after Prism core is ready
