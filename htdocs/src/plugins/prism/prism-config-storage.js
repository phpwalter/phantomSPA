/**
 * Prism Configuration Storage
 *
 * Handles loading, saving, and managing Prism configuration.
 * Configuration is loaded from prism-config.json for directive definitions
 * and user preferences are persisted to localStorage.
 *
 * @module prism-config-storage
 */

// Configuration loaded from prism-config.json
let directiveConfig = null;

/**
 * Load the directive configuration from prism-config.json
 * @returns {Promise<Object>} The directive configuration
 */
async function loadDirectiveConfig() {
    if (directiveConfig) {
        return directiveConfig;
    }

    try {
        // Determine the base path for the config file
        const scriptUrl = import.meta.url;
        const basePath = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
        const configUrl = `${basePath}/prism-config.json`;

        const response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error(`Failed to load prism-config.json: ${response.status}`);
        }
        directiveConfig = await response.json();
        console.info('[prism-config] Loaded directive configuration:', Object.keys(directiveConfig.directives || {}));
        return directiveConfig;
    } catch (err) {
        console.error('[prism-config] Failed to load directive config, using fallback:', err);
        // Return minimal fallback config
        directiveConfig = { directives: {}, parameterizedDirectives: {}, defaults: {} };
        return directiveConfig;
    }
}

/**
 * Get the directive configuration synchronously (must be loaded first)
 * @returns {Object} The directive configuration or empty fallback
 */
export function getDirectiveConfig() {
    return directiveConfig || { directives: {}, parameterizedDirectives: {}, defaults: {}, storageKey: 'prismConfig', iconSprites: {} };
}

/**
 * Get the storage key from loaded config
 * @returns {string} The localStorage key for user preferences
 */
export function getStorageKey() {
    return getDirectiveConfig().storageKey || 'prismConfig';
}

/**
 * Get the default configuration from loaded config
 * @returns {Object} Default configuration values
 */
export function getDefaultConfig() {
    return { ...getDirectiveConfig().defaults } || {};
}

/**
 * Initialize configuration from prism-config.json
 * Call this before using other config functions
 * @returns {Promise<Object>} The loaded configuration
 */
export async function initPrismConfigFromJson() {
    return await loadDirectiveConfig();
}

/**
 * Load Prism configuration from localStorage
 * @returns {Object} Configuration object
 */
export function loadPrismConfig() {
    const defaults = getDefaultConfig();
    const storageKey = getStorageKey();

    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const config = JSON.parse(saved);
            return { ...defaults, ...config };
        }
    } catch (err) {
        console.warn('[prism-config] Failed to load config:', err);
    }
    return { ...defaults };
}

/**
 * Save Prism configuration to localStorage
 * @param {Object} config - Configuration object
 */
export function savePrismConfig(config) {
    const storageKey = getStorageKey();

    try {
        localStorage.setItem(storageKey, JSON.stringify(config));
        console.info('[prism-config] Configuration saved:', config);
    } catch (err) {
        console.error('[prism-config] Failed to save config:', err);
    }
}

/**
 * Reset configuration to defaults
 * @returns {Object} Default configuration
 */
export function resetPrismConfig() {
    const config = getDefaultConfig();
    savePrismConfig(config);
    return config;
}

/**
 * Apply Prism configuration to the document
 * Uses globalToggles from prism-config.json for CSS class mappings
 * @param {Object} config - Configuration object
 */
export function applyPrismConfig(config) {
    const body = document.body;
    const directiveConfig = getDirectiveConfig();
    const globalToggles = directiveConfig.globalToggles || {};

    // Apply body classes for CSS-based feature toggling (from config)
    Object.entries(globalToggles).forEach(([key, toggleConfig]) => {
        if (key.startsWith('$')) return; // Skip $comment fields

        const configValue = config[key];
        const { bodyClass, invert } = toggleConfig;

        if (bodyClass) {
            // If invert is true, add class when config value is false
            const shouldAddClass = invert ? !configValue : configValue;
            body.classList.toggle(bodyClass, shouldAddClass);
        }
    });

    console.info('[prism-config] Configuration applied:', config);
}

/**
 * Apply Prism highlighting to code blocks based on configuration
 * @param {HTMLElement} container - Container element (usually main)
 * @param {Object} config - Configuration object
 */
export function highlightCode(container, config) {
    if (!window.Prism || !config.enableHighlighting) {
        if (!config.enableHighlighting) {
            removeHighlighting(container);
        }
        return;
    }

    const directiveConfig = getDirectiveConfig();
    const globalHighlighting = directiveConfig.globalHighlighting || {};

    const preElements = container.querySelectorAll('pre');
    const codeBlocks = [];

    preElements.forEach(pre => {
        if (pre.className.includes('language-') || pre.querySelector('code[class*="language-"]')) {
            codeBlocks.push(pre);

            const code = pre.querySelector('code[class*="language-"]');
            if (code) {
                const languageMatch = code.className.match(/language-(\w+)/);
                if (languageMatch && !pre.classList.contains(languageMatch[0])) {
                    pre.classList.add(languageMatch[0]);
                }
            }
        }
    });

    codeBlocks.forEach(pre => {
        const hasPerBlockConfig = pre.hasAttribute('data-prism-configured');

        if (!hasPerBlockConfig) {
            Object.entries(globalHighlighting).forEach(([ruleName, rule]) => {
                if (ruleName.startsWith('$')) return;

                const configValue = config[rule.configKey];

                if (rule.addClass) {
                    const hasConflict = rule.conflictsWith?.some(cls => pre.classList.contains(cls));
                    if (configValue && !hasConflict) {
                        pre.classList.add(rule.addClass);
                    } else {
                        pre.classList.remove(rule.addClass);
                    }
                }

                if (rule.removeClass && rule.onlyWhenDisabled) {
                    if (!configValue && pre.classList.contains(rule.removeClass)) {
                        pre.classList.remove(rule.removeClass);
                    }
                }
            });
        }
    });

    console.log('[prism-config] Highlighting', codeBlocks.length, 'code blocks');

    codeBlocks.forEach((pre, index) => {
        const code = pre.querySelector('code');
        if (code) {
            console.log(`[prism-config] Block ${index + 1}:`, {
                preClasses: pre.className,
                codeClasses: code.className,
                hasDataLine: pre.hasAttribute('data-line'),
                dataLine: pre.getAttribute('data-line'),
                configured: pre.getAttribute('data-prism-configured')
            });

            code.removeAttribute('data-highlighted');
            code.classList.remove('highlighted');
            window.Prism.highlightElement(code, false);
            console.log(`[prism-config] Block ${index + 1} highlighted`);
        }
    });

    setTimeout(() => {
        codeBlocks.forEach(pre => {
            if (pre.hasAttribute('data-prism-configured')) {
                const wrapper = pre.parentElement;
                if (wrapper && wrapper.classList.contains('code-toolbar')) {
                    wrapper.classList.add('prism-block-configured');
                    console.log('[prism-config] Marked wrapper as configured:', wrapper);
                }
            }
        });
    }, 100);
}

/**
 * Remove all Prism highlighting from code blocks
 * @param {HTMLElement} container - Container element
 */
function removeHighlighting(container) {
    const directiveConfig = getDirectiveConfig();
    const cleanupPatterns = directiveConfig.cleanupPatterns || {};
    const classPatterns = cleanupPatterns.classPatterns || [];
    const exactClasses = cleanupPatterns.exactClasses || [];

    const codeBlocks = container.querySelectorAll('pre[class*="language-"]');

    codeBlocks.forEach(pre => {
        const code = pre.querySelector('code');
        if (code) {
            const text = code.textContent;
            code.innerHTML = '';
            code.textContent = text;

            const classes = Array.from(pre.classList);
            const languageClass = 'language-' + (pre.className.match(/language-(\w+)/)?.[1] || '');

            classes.forEach(cls => {
                if (cls === languageClass) return;

                const matchesPattern = classPatterns.some(pattern => {
                    const regex = new RegExp(pattern);
                    return regex.test(cls);
                });

                const matchesExact = exactClasses.includes(cls);

                if (matchesPattern || matchesExact) {
                    pre.classList.remove(cls);
                }
            });
        }
    });
}
