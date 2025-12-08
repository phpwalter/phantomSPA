/**
 * @file prism-syntax-highlighter.js
 * @version 1.0.0
 * @description PhantomSPA Prism.js syntax highlighting plugin
 * A standalone, self-contained plugin for code syntax highlighting with zero modifications to core PhantomSPA files.
 *
 * Features:
 * - Syntax highlighting for multiple languages
 * - Line numbers, line highlighting, toolbar with copy/download/language buttons
 * - Per-block configuration via HTML comment directives
 * - Global configuration UI with localStorage persistence
 * - Completely removable by deleting plugin entry from app-config.json
 */

import {
    loadPrismConfig,
    applyPrismConfig,
    highlightCode,
    createPrismSettingsPanel,
    createPrismSettingsButton,
    applyPerBlockPrismConfig,
    initPrismConfigFromJson
} from './prism-config.js';

import { loadPrismPlugins } from './prism-plugin-loader.js';
import { loadDropins, executeHook } from './dropins/prism-dropin-loader.js';

/**
 * Plugin initialization function called by the plugin manager
 * @param {PluginManager} pluginManager - The plugin manager instance
 * @param {Object} options - Plugin options from app-config.json
 */
export async function init(pluginManager, options = {}) {
    // For compatibility with the plugin manager, we need to access the eventBus
    // The pluginManager is passed as the first argument, but we need the eventBus
    // We'll create a wrapper object that has the events property
    const spa = {
        events: pluginManager.events || window.eventBus || {
            addEventListener: (event, handler) => {
                document.addEventListener(event, handler);
            }
        }
    };
    await setup(spa, options);
}

export async function setup(spa, options = {}) {
    console.group('[prism-syntax-highlighter] init');

    // All configuration comes from app-config.json via options parameter
    // No hardcoded defaults - config must be provided
    if (!options.theme || !options.cdnVersion || !options.cdnBase) {
        console.error('[prism-syntax-highlighter] ERROR: Missing required configuration (theme, cdnVersion, cdnBase)');
        console.groupEnd();
        return;
    }

    const config = options;

    try {
        // Step 0: Load directive configuration from prism-config.json
        await initPrismConfigFromJson();

        // Step 1: Initialize Prism.manual mode to prevent auto-highlighting
        initializePrismManualMode();

        // Step 2: Load Prism CDN resources (core, languages, plugins CSS)
        await loadPrismCDNResources(config);

        // Step 3: Load plugin CSS (core only - icon sprites loaded by drop-in)
        await loadPluginCSS();

        // Step 4: Load Prism plugins dynamically (only the ones in config)
        const cdnBase = config.cdnBase.replace('{version}', config.cdnVersion);
        await loadPrismPlugins(config.plugins, cdnBase);

        // Step 5: Inject critical CSS fixes
        injectCSSFixes();

        // Step 6: Load and apply Prism configuration
        let prismConfig = loadPrismConfig();
        applyPrismConfig(prismConfig);

        // Step 7: Load drop-ins from prism-config.json
        await loadDropins();

        // Step 8: Hook into SPA routing to highlight code on page load
        if (spa.events) {
            spa.events.addEventListener('route:after', async (event) => {
                // TODO: Make container selector configurable via options.containerSelector for portability outside PhantomSPA
                const main = document.querySelector('#app-shell');
                if (main) {
                    // Execute beforeHighlight hook for drop-ins
                    await executeHook('beforeHighlight', { container: main, config: prismConfig });

                    // Apply per-block configuration from HTML comment directives
                    await applyPerBlockPrismConfig(main);

                    // Highlight code with global configuration
                    highlightCode(main, prismConfig);

                    // Execute afterHighlight hook for drop-ins
                    // (custom headers, tree icons, etc. are now handled by drop-ins)
                    await executeHook('afterHighlight', { container: main, config: prismConfig });
                }
            });
        }

        // Step 9: Initialize settings UI
        initPrismSettingsUI(spa, prismConfig, async (newConfig) => {
            prismConfig = newConfig;
            // Re-apply highlighting to current page
            // TODO: Make container selector configurable via options.containerSelector for portability outside PhantomSPA
            const main = document.querySelector('#app-shell');
            if (main) {
                highlightCode(main, prismConfig);
                // Execute onConfigChange hook for drop-ins
                await executeHook('onConfigChange', { container: main, config: prismConfig });
            }
        });

        console.info('[prism-syntax-highlighter] initialized successfully');
    } catch (err) {
        console.error('[prism-syntax-highlighter] initialization failed:', err);
    }

    console.groupEnd();
}

/**
 * Initialize Prism.manual mode to prevent automatic highlighting
 */
function initializePrismManualMode() {
    window.Prism = window.Prism || {};
    window.Prism.manual = true;
    window.Prism.plugins = window.Prism.plugins || {};
}

/**
 * Load Prism CDN resources (core, languages, plugin CSS)
 * All paths come from config - no hardcoded values
 */
async function loadPrismCDNResources(config) {
    const cdnBase = config.cdnBase.replace('{version}', config.cdnVersion);

    // Load theme CSS
    await loadStylesheet(`${cdnBase}/themes/prism-${config.theme}.min.css`, 'prism-theme');

    // Load plugin CSS (only for plugins that have CSS files)
    // CSS paths come from plugin config objects
    if (config.plugins && Array.isArray(config.plugins)) {
        for (const plugin of config.plugins) {
            // Plugin can be either a string (legacy) or an object (new format)
            if (typeof plugin === 'object' && plugin.cssPath) {
                const cssUrl = cdnBase + plugin.cssPath;
                await loadStylesheet(cssUrl, `prism-plugin-${plugin.name}`);
            }
        }
    }

    // Load Prism core
    await loadScript(`${cdnBase}/prism.min.js`, 'prism-core');

    // Load languages
    if (config.languages && Array.isArray(config.languages)) {
        for (const lang of config.languages) {
            await loadScript(`${cdnBase}/components/prism-${lang}.min.js`, `prism-lang-${lang}`);
        }
    }
}

/**
 * Load plugin CSS files
 * Note: Icon sprite CSS is now loaded by the icon-sprites drop-in
 */
async function loadPluginCSS() {
    // Load main plugin CSS only
    // Icon sprite CSS files are loaded by the icon-sprites drop-in
    await loadStylesheet('/src/plugins/prism/prism-syntax-highlighter.css', 'prism-plugin-css');
}

/**
 * Inject critical CSS fixes that override CDN CSS
 */
function injectCSSFixes() {
    const style = document.createElement('style');
    style.id = 'prism-css-fix';
    style.textContent = `
        /* Reposition line numbers inside padding area (Prism resets overflow) */
        .line-numbers .line-numbers-rows {
            left: 0 !important;
            margin-left: 0px !important;
        }
        
        /* Ensure line highlight is visible */
        .line-highlight {
            z-index: 1 !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize Prism settings UI
 */
function initPrismSettingsUI(spa, prismConfig, onConfigChange) {
    // Wait for navigation to be rendered
    const checkNav = setInterval(() => {
        // TODO: Make nav selector configurable via options.settingsUI.navSelector for portability outside PhantomSPA
        const nav = document.querySelector('.site-nav');
        if (nav) {
            clearInterval(checkNav);

            // Create settings panel
            const panel = createPrismSettingsPanel(prismConfig, onConfigChange);

            // Create settings button
            const button = createPrismSettingsButton(panel);

            // Find or create nav controls container
            // TODO: Make controls selector configurable via options.settingsUI.controlsSelector for portability outside PhantomSPA
            let controlsContainer = nav.querySelector('.nav-controls');
            if (!controlsContainer) {
                controlsContainer = document.createElement('div');
                controlsContainer.className = 'nav-controls';
                nav.insertBefore(controlsContainer, nav.firstChild);
            }

            // Add settings button to nav controls
            controlsContainer.appendChild(button);
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkNav), 5000);
}

/**
 * Load a stylesheet dynamically
 */
function loadStylesheet(href, id) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
        document.head.appendChild(link);
    });
}

/**
 * Load a script dynamically
 */
function loadScript(src, id) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}
