/**
 * Prism Plugin Loader
 * 
 * Loads Prism.js plugins in the correct order to ensure dependencies are satisfied.
 * This bypasses issues with defer/async script loading.
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
 * @param {Array} pluginsToLoad - Array of plugin names to load
 * @param {string} cdnVersion - Prism CDN version
 * @returns {Promise} - Resolves when all plugins are loaded
 */
export async function loadPrismPlugins(pluginsToLoad = [], cdnVersion = '1.29.0') {
    console.log('[prism-loader] Starting plugin load...');
    console.log('[prism-loader] Plugins to load:', pluginsToLoad);
    console.log('[prism-loader] Prism exists:', !!window.Prism);
    console.log('[prism-loader] Current plugins:', Object.keys(window.Prism?.plugins || {}));

    // Check if Prism is loaded
    if (!window.Prism) {
        console.error('[prism-loader] ERROR: Prism core not loaded!');
        return;
    }

    // If no plugins to load, exit early
    if (!pluginsToLoad || pluginsToLoad.length === 0) {
        console.log('[prism-loader] No plugins to load');
        return;
    }

    console.log('[prism-loader] Loading plugins...');

    const CDN_BASE = `https://cdn.jsdelivr.net/npm/prismjs@${cdnVersion}/plugins`;

    // Map of plugin names to their CDN paths and dependencies
    const pluginMap = {
        'toolbar': {
            path: `${CDN_BASE}/toolbar/prism-toolbar.min.js`,
            dependencies: []
        },
        'copy-to-clipboard': {
            path: `${CDN_BASE}/copy-to-clipboard/prism-copy-to-clipboard.min.js`,
            dependencies: ['toolbar']
        },
        'download-button': {
            path: `${CDN_BASE}/download-button/prism-download-button.min.js`,
            dependencies: ['toolbar']
        },
        'show-language': {
            path: `${CDN_BASE}/show-language/prism-show-language.min.js`,
            dependencies: ['toolbar']
        },
        'line-numbers': {
            path: `${CDN_BASE}/line-numbers/prism-line-numbers.min.js`,
            dependencies: []
        },
        'line-highlight': {
            path: `${CDN_BASE}/line-highlight/prism-line-highlight.min.js`,
            dependencies: []
        },
        'command-line': {
            path: `${CDN_BASE}/command-line/prism-command-line.min.js`,
            dependencies: []
        }
    };

    try {
        // Collect all plugins including dependencies
        const allPluginsToLoad = new Set();
        for (const plugin of pluginsToLoad) {
            const pluginInfo = pluginMap[plugin];
            if (pluginInfo) {
                // Add dependencies first
                for (const dep of pluginInfo.dependencies) {
                    allPluginsToLoad.add(dep);
                }
                // Add the plugin itself
                allPluginsToLoad.add(plugin);
            }
        }

        // Load plugins in dependency order
        const loadOrder = ['toolbar', 'copy-to-clipboard', 'download-button', 'show-language', 'line-numbers', 'line-highlight', 'command-line'];
        const pluginsToLoadInOrder = loadOrder.filter(p => allPluginsToLoad.has(p));

        console.log('[prism-loader] Load order:', pluginsToLoadInOrder);

        for (const plugin of pluginsToLoadInOrder) {
            const pluginInfo = pluginMap[plugin];
            if (pluginInfo) {
                try {
                    console.log(`[prism-loader] Loading ${plugin}...`);
                    await loadScript(pluginInfo.path);
                    console.log(`[prism-loader] ${plugin} loaded ✓`);
                } catch (err) {
                    console.error(`[prism-loader] Failed to load ${plugin}:`, err);
                }
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
