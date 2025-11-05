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
 * Load Prism plugins in the correct order
 * @returns {Promise} - Resolves when all plugins are loaded
 */
export async function loadPrismPlugins() {
    console.log('[prism-loader] Starting plugin load...');
    console.log('[prism-loader] Prism exists:', !!window.Prism);
    console.log('[prism-loader] Current plugins:', Object.keys(window.Prism?.plugins || {}));

    // Check if Prism is loaded
    if (!window.Prism) {
        console.error('[prism-loader] ERROR: Prism core not loaded!');
        return;
    }

    // Check if our plugins are already loaded (ignore fileHighlight which is built into Prism core)
    const currentPlugins = Object.keys(window.Prism.plugins || {}).filter(p => p !== 'fileHighlight');
    const requiredPlugins = ['toolbar', 'copyToClipboard', 'downloadButton', 'showLanguage', 'lineNumbers', 'lineHighlight', 'commandLine'];
    const hasAllPlugins = requiredPlugins.every(p => currentPlugins.includes(p));

    if (hasAllPlugins) {
        console.log('[prism-loader] All required plugins already loaded:', currentPlugins);
        return;
    }

    console.log('[prism-loader] Loading plugins...');

    const CDN_BASE = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins';

    try {
        // Load toolbar first (required by other plugins)
        console.log('[prism-loader] Loading toolbar plugin...');
        await loadScript(`${CDN_BASE}/toolbar/prism-toolbar.min.js`);
        console.log('[prism-loader] Toolbar loaded:', !!window.Prism.plugins.toolbar);

        // Load plugins that depend on toolbar
        // Note: These plugins register toolbar buttons but don't create Prism.plugins.X objects
        console.log('[prism-loader] Loading toolbar-dependent plugins...');
        try {
            await loadScript(`${CDN_BASE}/copy-to-clipboard/prism-copy-to-clipboard.min.js`);
            console.log('[prism-loader] Copy-to-clipboard loaded ✓');
        } catch (err) {
            console.error('[prism-loader] Failed to load copy-to-clipboard:', err);
        }

        try {
            await loadScript(`${CDN_BASE}/download-button/prism-download-button.min.js`);
            console.log('[prism-loader] Download-button loaded ✓');
        } catch (err) {
            console.error('[prism-loader] Failed to load download-button:', err);
        }

        try {
            await loadScript(`${CDN_BASE}/show-language/prism-show-language.min.js`);
            console.log('[prism-loader] Show-language loaded ✓');
        } catch (err) {
            console.error('[prism-loader] Failed to load show-language:', err);
        }

        // Load independent plugins
        console.log('[prism-loader] Loading independent plugins...');
        try {
            await loadScript(`${CDN_BASE}/line-numbers/prism-line-numbers.min.js`);
            console.log('[prism-loader] Line-numbers loaded:', !!window.Prism.plugins.lineNumbers);
        } catch (err) {
            console.error('[prism-loader] Failed to load line-numbers:', err);
        }

        try {
            await loadScript(`${CDN_BASE}/line-highlight/prism-line-highlight.min.js`);
            console.log('[prism-loader] Line-highlight loaded:', !!window.Prism.plugins.lineHighlight);
        } catch (err) {
            console.error('[prism-loader] Failed to load line-highlight:', err);
        }

        try {
            await loadScript(`${CDN_BASE}/command-line/prism-command-line.min.js`);
            console.log('[prism-loader] Command-line loaded ✓');
        } catch (err) {
            console.error('[prism-loader] Failed to load command-line:', err);
        }

        console.log('[prism-loader] ✅ All 7 plugins loaded successfully!');
        console.log('[prism-loader] Plugins with Prism.plugins.X objects:', Object.keys(window.Prism.plugins));
        console.log('[prism-loader] Note: copy-to-clipboard, download-button, and show-language register as toolbar buttons, not plugin objects');

    } catch (error) {
        console.error('[prism-loader] Failed to load plugins:', error);
    }
}

// Note: Auto-load removed - plugins are loaded explicitly by router.js
// This ensures proper timing after Prism core is ready
