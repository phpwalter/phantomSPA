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
    applyPerBlockPrismConfig
} from './prism-config.js';

import { loadPrismPlugins } from './prism-plugin-loader.js';

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
        // Step 1: Initialize Prism.manual mode to prevent auto-highlighting
        initializePrismManualMode();

        // Step 2: Load Prism CDN resources (core, languages, plugins CSS)
        await loadPrismCDNResources(config);

        // Step 3: Load plugin CSS
        await loadPluginCSS();

        // Step 4: Load Prism plugins dynamically (only the ones in config)
        const cdnBase = config.cdnBase.replace('{version}', config.cdnVersion);
        await loadPrismPlugins(config.plugins, cdnBase);

        // Step 5: Inject critical CSS fixes
        injectCSSFixes();

        // Step 6: Load and apply Prism configuration
        let prismConfig = loadPrismConfig();
        applyPrismConfig(prismConfig);

        // Step 7: Hook into SPA routing to highlight code on page load
        if (spa.events) {
            spa.events.addEventListener('route:after', (event) => {
                const main = document.querySelector('#app-shell');
                if (main) {
                    // Apply per-block configuration from HTML comment directives
                    applyPerBlockPrismConfig(main);
                    // Highlight code with global configuration
                    highlightCode(main, prismConfig);
                    // Add custom headers to code blocks
                    addCustomHeaders(main);
                }
            });
        }

        // Step 8: Initialize settings UI
        initPrismSettingsUI(spa, prismConfig, (newConfig) => {
            prismConfig = newConfig;
            // Re-apply highlighting to current page
            const main = document.querySelector('#app-shell');
            if (main) {
                highlightCode(main, prismConfig);
                addCustomHeaders(main);
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
 * Load plugin CSS file
 */
async function loadPluginCSS() {
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
        const nav = document.querySelector('.site-nav');
        if (nav) {
            clearInterval(checkNav);

            // Create settings panel
            const panel = createPrismSettingsPanel(prismConfig, onConfigChange);

            // Create settings button
            const button = createPrismSettingsButton(panel);

            // Find or create nav controls container
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

/**
 * Add custom headers to code blocks
 * @param {HTMLElement} container - Container element
 */
function addCustomHeaders(container) {
    const codeBlocks = container.querySelectorAll('pre[class*="language-"]');

    codeBlocks.forEach(pre => {
        // Skip if header already exists
        if (pre.previousElementSibling?.classList.contains('prism-custom-header')) {
            return;
        }

        // Get language from class
        const languageMatch = pre.className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1].toUpperCase() : 'CODE';

        // Get code content for copy/download
        const code = pre.querySelector('code');
        const codeText = code ? code.textContent : '';

        // Create header element
        const header = document.createElement('div');
        header.className = 'prism-custom-header';

        // Left side: Language label
        const languageLabel = document.createElement('span');
        languageLabel.className = 'prism-language-label';
        languageLabel.textContent = language;

        // Right side: Actions container
        const actions = document.createElement('div');
        actions.className = 'prism-header-actions';

        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'prism-copy-btn';
        copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 1H3.5C2.67 1 2 1.67 2 2.5V11.5H3.5V2.5H10.5V1ZM12.5 4H6.5C5.67 4 5 4.67 5 5.5V13.5C5 14.33 5.67 15 6.5 15H12.5C13.33 15 14 14.33 14 13.5V5.5C14 4.67 13.33 4 12.5 4ZM12.5 13.5H6.5V5.5H12.5V13.5Z" fill="currentColor"/>
        </svg>`;
        copyBtn.title = 'Copy code';
        copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
        copyBtn.addEventListener('click', () => copyCodeToClipboard(codeText, copyBtn));

        // Three-dot menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'prism-menu-btn';
        menuBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
        </svg>`;
        menuBtn.title = 'More options';
        menuBtn.setAttribute('aria-label', 'More options');

        // Dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'prism-dropdown-menu';
        dropdown.innerHTML = `
            <button class="prism-dropdown-item" data-action="download">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor"/>
                </svg>
                Download
            </button>
        `;

        // Toggle dropdown on menu button click
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // Handle dropdown actions
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.prism-dropdown-item');
            if (!item) return;

            const action = item.getAttribute('data-action');
            if (action === 'download') {
                downloadCode(codeText, language.toLowerCase());
            }

            dropdown.classList.remove('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });

        // Assemble header
        actions.appendChild(copyBtn);
        actions.appendChild(menuBtn);
        actions.appendChild(dropdown);
        header.appendChild(languageLabel);
        header.appendChild(actions);

        // Insert header before code block
        pre.parentNode.insertBefore(header, pre);
    });
}

/**
 * Copy code to clipboard
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element for feedback
 */
function copyCodeToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 12L1.5 8L2.91 6.59L5.5 9.17L13.09 1.59L14.5 3L5.5 12Z" fill="currentColor"/>
        </svg>`;
        button.classList.add('success');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('success');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code:', err);
    });
}

/**
 * Download code as file
 * @param {string} text - Code text
 * @param {string} language - Programming language
 */
function downloadCode(text, language) {
    // Map language to file extension
    const extensions = {
        javascript: 'js',
        typescript: 'ts',
        jsx: 'jsx',
        python: 'py',
        bash: 'sh',
        json: 'json',
        css: 'css',
        markup: 'html',
        markdown: 'md'
    };

    const ext = extensions[language] || 'txt';
    const filename = `code.${ext}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
