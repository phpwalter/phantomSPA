/**
 * Prism Plugin Loader
 *
 * Loads Prism.js plugins in the correct order to ensure dependencies are satisfied.
 * All configuration is driven by app-config.json - no hardcoded paths or dependencies.
 */

import { loadScript } from './prism-utils.js';

/**
 * Load Prism plugins in the correct order based on config
 * @param {Array} pluginConfigs - Array of plugin configuration objects from app-config.json
 * @param {string} cdnBase - CDN base URL with {version} placeholder
 * @returns {Promise} - Resolves when all plugins are loaded
 */
export async function loadPrismPlugins(pluginConfigs = [], cdnBase = '') {
    console.log('[prism-loader] Starting plugin load...');
    console.log('[prism-loader] Plugin configs:', pluginConfigs);
    console.log('[prism-loader] window.Prism exists:', !!window.Prism);
    console.log('[prism-loader] typeof Prism (global):', typeof Prism);
    console.log('[prism-loader] Prism === window.Prism:', typeof Prism !== 'undefined' && Prism === window.Prism);
    console.log('[prism-loader] Current plugins:', Object.keys(window.Prism?.plugins || {}));
    console.log('[prism-loader] Prism.hooks exists:', !!window.Prism?.hooks);
    console.log('[prism-loader] Prism.highlightElement:', typeof window.Prism?.highlightElement);

    // Check if Prism is loaded
    if (!window.Prism) {
        console.error('[prism-loader] ERROR: Prism core not loaded!');
        return;
    }

    // Test: Verify dynamic script execution works
    console.log('[prism-loader] Testing dynamic script execution...');
    const testScript = document.createElement('script');
    testScript.textContent = `
        console.log('[prism-loader] TEST: Inline script executed!');
        console.log('[prism-loader] TEST: window.Prism exists:', !!window.Prism);
        console.log('[prism-loader] TEST: Prism.plugins before:', Object.keys(window.Prism?.plugins || {}));
        // Try to add a test plugin
        if (window.Prism && window.Prism.plugins) {
            window.Prism.plugins.testPlugin = { test: true };
            console.log('[prism-loader] TEST: Added testPlugin, plugins now:', Object.keys(window.Prism.plugins));
        }
    `;
    document.head.appendChild(testScript);
    console.log('[prism-loader] After test script, plugins:', Object.keys(window.Prism?.plugins || {}));

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
                // Use different ID pattern than CSS to avoid collision
                // CSS uses: prism-plugin-{name}
                // JS uses: prism-plugin-{name}-js
                const scriptId = `prism-plugin-${plugin.name}-js`;
                console.log(`[prism-loader] Loading ${plugin.name} from ${url}...`);
                console.log(`[prism-loader]    Script ID: ${scriptId}`);
                console.log(`[prism-loader]    Element with this ID exists: ${!!document.getElementById(scriptId)}`);

                const pluginsBefore = Object.keys(window.Prism?.plugins || {});
                await loadScript(url, scriptId);

                // Small delay to ensure script execution completes
                await new Promise(resolve => setTimeout(resolve, 50));

                const pluginsAfter = Object.keys(window.Prism?.plugins || {});

                // Check if plugin registered
                const newPlugins = pluginsAfter.filter(p => !pluginsBefore.includes(p));
                if (newPlugins.length > 0) {
                    console.log(`[prism-loader] ${plugin.name} loaded ✓ (registered: ${newPlugins.join(', ')})`);
                } else {
                    console.warn(`[prism-loader] ${plugin.name} loaded but did NOT register with Prism.plugins!`);
                    console.log(`[prism-loader]    Plugins before: ${pluginsBefore.join(', ')}`);
                    console.log(`[prism-loader]    Plugins after: ${pluginsAfter.join(', ')}`);
                    // Check if script element exists
                    const scriptEl = document.getElementById(scriptId);
                    console.log(`[prism-loader]    Script element exists: ${!!scriptEl}`);
                    if (scriptEl) {
                        console.log(`[prism-loader]    Script src: ${scriptEl.src}`);
                    }
                }
            } catch (err) {
                console.error(`[prism-loader] Failed to load ${plugin.name}:`, err);
            }
        }

        console.log('[prism-loader] ✅ Plugin loading complete!');
        console.log('[prism-loader] Loaded plugins:', Object.keys(window.Prism.plugins));

        // Verify toolbar plugin specifically
        if (window.Prism.plugins.toolbar) {
            console.log('[prism-loader] Toolbar plugin details:');
            console.log('   - registerButton:', typeof window.Prism.plugins.toolbar.registerButton);
            console.log('   - hook:', typeof window.Prism.plugins.toolbar.hook);
        } else {
            console.warn('[prism-loader] ⚠️ Toolbar plugin NOT loaded!');
        }

    } catch (error) {
        console.error('[prism-loader] Failed to load plugins:', error);
    }
}

// Note: Auto-load removed - plugins are loaded explicitly by router.js
// This ensures proper timing after Prism core is ready
