/**
 * Prism.js Configuration Manager
 * Handles user preferences for syntax highlighting features
 *
 * Configuration is loaded from prism-config.json for directive definitions
 * and activation rules. This allows adding new plugins without modifying code.
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
function getStorageKey() {
    return getDirectiveConfig().storageKey || 'prismConfig';
}

/**
 * Get the default configuration from loaded config
 * @returns {Object} Default configuration values
 */
function getDefaultConfig() {
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
 * Uses globalHighlighting rules from prism-config.json
 * @param {HTMLElement} container - Container element (usually main)
 * @param {Object} config - Configuration object
 */
export function highlightCode(container, config) {
    if (!window.Prism || !config.enableHighlighting) {
        // If highlighting is disabled, remove all Prism classes
        if (!config.enableHighlighting) {
            removeHighlighting(container);
        }
        return;
    }

    const directiveConfig = getDirectiveConfig();
    const globalHighlighting = directiveConfig.globalHighlighting || {};

    // Find all code blocks
    // Snarkdown generates: <pre class="code <lang>"><code class="language-<lang>">
    // We need to find both patterns: pre[class*="language-"] and pre > code[class*="language-"]
    const preElements = container.querySelectorAll('pre');
    const codeBlocks = [];

    preElements.forEach(pre => {
        // Check if pre has language class OR if it contains code with language class
        if (pre.className.includes('language-') || pre.querySelector('code[class*="language-"]')) {
            codeBlocks.push(pre);

            // Ensure language class is on <pre> element (marked.js puts it on <code>)
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
        // Skip blocks with per-block configuration (they've already been configured)
        const hasPerBlockConfig = pre.hasAttribute('data-prism-configured');

        if (!hasPerBlockConfig) {
            // Apply global configuration only to blocks without per-block config
            // Use rules from globalHighlighting config
            Object.entries(globalHighlighting).forEach(([ruleName, rule]) => {
                if (ruleName.startsWith('$')) return; // Skip $comment fields

                const configValue = config[rule.configKey];

                if (rule.addClass) {
                    // Check for conflicts
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

    // Re-run Prism highlighting
    // Prism plugins will automatically detect classes and data attributes
    // We need to manually highlight each code block to ensure plugins run
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

            // Clear any existing highlighting to force re-highlight
            code.removeAttribute('data-highlighted');
            code.classList.remove('highlighted');

            // Manually trigger Prism highlighting for this element
            window.Prism.highlightElement(code, false);

            console.log(`[prism-config] Block ${index + 1} highlighted`);
        }
    });

    // After Prism runs, mark wrapper divs for per-block configured blocks
    // This allows CSS to exclude them from global hiding rules
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
    }, 100); // Small delay to ensure Prism plugins have finished
}

/**
 * Remove all Prism highlighting from code blocks
 * Uses cleanupPatterns from prism-config.json
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
            // Get original text content
            const text = code.textContent;

            // Remove all Prism-generated elements
            code.innerHTML = '';
            code.textContent = text;

            // Remove Prism classes except language class (using config patterns)
            const classes = Array.from(pre.classList);
            const languageClass = 'language-' + (pre.className.match(/language-(\w+)/)?.[1] || '');

            classes.forEach(cls => {
                if (cls === languageClass) return; // Keep language class

                // Check against patterns from config
                const matchesPattern = classPatterns.some(pattern => {
                    const regex = new RegExp(pattern);
                    return regex.test(cls);
                });

                // Check against exact class names from config
                const matchesExact = exactClasses.includes(cls);

                if (matchesPattern || matchesExact) {
                    pre.classList.remove(cls);
                }
            });
        }
    });
}

/**
 * Create Prism settings UI panel
 * Uses settingsPanel config from prism-config.json for options
 * @param {Object} config - Current configuration
 * @param {Function} onUpdate - Callback when settings change
 * @returns {HTMLElement} Settings panel element
 */
export function createPrismSettingsPanel(config, onUpdate) {
    const directiveConfig = getDirectiveConfig();
    const settingsConfig = directiveConfig.settingsPanel || {};

    const panel = document.createElement('div');
    panel.classList.add('prism-settings-panel');

    const title = document.createElement('h4');
    title.textContent = settingsConfig.title || 'Code Block Settings';
    panel.appendChild(title);

    // Get toggle options from config
    const options = settingsConfig.options || [];

    options.forEach(option => {
        const optionEl = createToggleOption(
            option.key,
            option.label,
            config[option.key],
            (value) => {
                config[option.key] = value;
                savePrismConfig(config);
                applyPrismConfig(config);
                if (onUpdate) onUpdate(config);
            }
        );
        panel.appendChild(optionEl);
    });

    // Action buttons container
    const actions = document.createElement('div');
    actions.classList.add('prism-settings-actions');

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.classList.add('prism-reset-btn');
    resetBtn.textContent = 'Reset to Defaults';
    resetBtn.addEventListener('click', () => {
        const defaultConfig = resetPrismConfig();

        // Update all checkboxes
        options.forEach(option => {
            const checkbox = panel.querySelector(`#prism-setting-${option.key}`);
            if (checkbox) {
                checkbox.checked = defaultConfig[option.key];
            }
        });

        applyPrismConfig(defaultConfig);
        if (onUpdate) onUpdate(defaultConfig);

        // Visual feedback
        resetBtn.classList.add('clicked');
        setTimeout(() => resetBtn.classList.remove('clicked'), 300);
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('prism-close-btn');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    actions.appendChild(resetBtn);
    actions.appendChild(closeBtn);
    panel.appendChild(actions);

    return panel;
}

/**
 * Create a toggle option element
 * @param {string} id - Option ID
 * @param {string} label - Option label
 * @param {boolean} checked - Initial checked state
 * @param {Function} onChange - Change callback
 * @returns {HTMLElement} Option element
 */
function createToggleOption(id, label, checked, onChange) {
    const option = document.createElement('div');
    option.classList.add('prism-setting-option');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `prism-setting-${id}`;
    checkbox.checked = checked;
    checkbox.addEventListener('change', (e) => {
        onChange(e.target.checked);
    });

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', `prism-setting-${id}`);
    labelEl.textContent = label;

    option.appendChild(checkbox);
    option.appendChild(labelEl);

    return option;
}

/**
 * Create Prism settings button
 * @param {HTMLElement} panel - Settings panel element
 * @returns {HTMLElement} Settings button
 */
export function createPrismSettingsButton(panel) {
    const btn = document.createElement('button');
    btn.classList.add('prism-settings-btn');
    btn.innerHTML = '<span class="icon">&lt;/&gt;</span>';
    btn.setAttribute('aria-label', 'Code block settings');
    btn.setAttribute('title', 'Code block settings');

    btn.addEventListener('click', () => {
        panel.classList.toggle('open');
    });

    return btn;
}

/**
 * Apply per-code-block Prism configuration from HTML comment directives
 * Parses comments like: <!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard -->
 * @param {HTMLElement} container - Container element (usually main)
 * @returns {Promise<void>}
 */
export async function applyPerBlockPrismConfig(container) {
    if (!container) return;

    // Find all HTML comments in the container
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_COMMENT,
        null,
        false
    );

    const comments = [];
    let node;
    while (node = walker.nextNode()) {
        comments.push(node);
    }

    // Process each comment (collect promises for parallel execution)
    const activationPromises = [];

    for (const comment of comments) {
        const text = comment.textContent.trim();

        // Check if this is a prism directive comment
        const match = text.match(/^prism:\s*(.+)$/i);
        if (!match) continue;

        const directiveText = match[1].trim();

        // Find the next code block element
        let nextElement = comment.nextSibling;

        // Skip whitespace text nodes
        while (nextElement && nextElement.nodeType === Node.TEXT_NODE && !nextElement.textContent.trim()) {
            nextElement = nextElement.nextSibling;
        }

        // Check if next element is a code block
        if (!nextElement || nextElement.nodeName !== 'PRE') {
            console.warn('[prism-config] Prism directive found but no code block follows:', text);
            continue;
        }

        const pre = nextElement;
        const code = pre.querySelector('code');

        if (!code) {
            console.warn('[prism-config] Prism directive found but next <pre> has no <code>:', text);
            continue;
        }

        // Snarkdown generates: <pre class="code <lang>"><code class="language-<lang>">
        // We need to ensure the language class is on the <pre> element for Prism plugins
        const codeClass = code.className;
        const languageMatch = codeClass.match(/language-(\w+)/);
        if (languageMatch && !pre.classList.contains(languageMatch[0])) {
            pre.classList.add(languageMatch[0]);
        }

        // Parse the directive options
        const options = parseDirectiveOptions(directiveText);

        // Apply options to the <pre> element (async for custom activation handlers)
        const activationPromise = applyDirectiveOptions(pre, options).then(() => {
            // Remove the comment from the DOM after activation
            comment.remove();

            // Log applied configuration (dynamically capture all data-* attributes)
            const dataAttrs = {};
            for (const attr of pre.attributes) {
                if (attr.name.startsWith('data-')) {
                    dataAttrs[attr.name] = attr.value;
                }
            }
            console.info('[prism-config] Applied per-block directive:', options, 'to', pre);
            console.log('[prism-config] Pre element classes:', pre.className);
            console.log('[prism-config] Pre element attributes:', dataAttrs);
        });

        activationPromises.push(activationPromise);
    }

    // Wait for all activations to complete
    await Promise.all(activationPromises);
}

/**
 * Build a map of all flags defined in directives
 * @param {Object} directives - Directive definitions from config
 * @returns {Object} Map of flag -> { directive, flagConfig }
 */
function buildFlagMap(directives) {
    const flagMap = {};
    Object.entries(directives).forEach(([directiveName, directiveConfig]) => {
        if (directiveConfig.flags) {
            Object.entries(directiveConfig.flags).forEach(([flag, flagConfig]) => {
                flagMap[flag.toLowerCase()] = {
                    directive: directiveName,
                    flagConfig
                };
            });
        }
    });
    return flagMap;
}

/**
 * Check if a directive is deprecated and log a warning if so
 * @param {string} directiveName - The directive name to check
 * @param {Object} deprecatedDirectives - The deprecated directives config
 * @returns {boolean} True if the directive is deprecated and should be skipped
 */
function isDeprecatedDirective(directiveName, deprecatedDirectives) {
    if (!deprecatedDirectives || !deprecatedDirectives[directiveName]) {
        return false;
    }

    const deprecation = deprecatedDirectives[directiveName];
    const severity = deprecation.severity || 'warning';

    // Log the warning with helpful information
    console.warn(
        `[prism-config] ⚠️ Directive '${directiveName}' is deprecated and has been ignored.`
    );
    console.warn(`[prism-config] Reason: ${deprecation.reason}`);
    console.warn(`[prism-config] ${deprecation.replacement}`);

    return true;
}

/**
 * Parse directive options from the directive text
 * Uses configuration from prism-config.json for dynamic directive handling
 * Filters out deprecated directives that conflict with PhantomSPA's custom-headers
 * @param {string} directiveText - The directive text (e.g., "line-numbers highlight=2,4-6 copy-to-clipboard")
 * @returns {Object} Parsed options
 */
function parseDirectiveOptions(directiveText) {
    const config = getDirectiveConfig();
    const directives = config.directives || {};
    const parameterized = config.parameterizedDirectives || {};
    const deprecatedDirectives = config.deprecatedDirectives || {};

    // Build flag map from all directives
    const flagMap = buildFlagMap(directives);

    // Build options object
    const options = {
        // Dynamic activations from config (will be processed by applyDirectiveOptions)
        _dynamicActivations: [],
        // Flags that were specified (keyed by directive name)
        _flags: {},
        // Track deprecated directives that were filtered out
        _filteredDeprecated: []
    };

    // Split by whitespace
    const parts = directiveText.split(/\s+/);

    // Track which directives are enabled for "implies" processing
    const enabledDirectives = new Set();

    parts.forEach(part => {
        if (!part) return;

        const partLower = part.toLowerCase();

        // Check if this directive is deprecated BEFORE processing
        if (isDeprecatedDirective(partLower, deprecatedDirectives)) {
            options._filteredDeprecated.push(partLower);
            return; // Skip this directive entirely
        }

        // Check for parameterized options (e.g., highlight=2,4-6)
        if (part.includes('=')) {
            const [key, value] = part.split('=', 2);
            const keyLower = key.toLowerCase();

            // Check if this is a known parameterized directive
            if (parameterized[keyLower]) {
                const paramConfig = parameterized[keyLower];
                // Validate using pattern from config
                if (paramConfig.pattern) {
                    const regex = new RegExp(paramConfig.pattern);
                    if (regex.test(value)) {
                        // Store the value and activation info
                        options._dynamicActivations.push({
                            ...paramConfig.activation,
                            value: value
                        });
                    } else {
                        console.warn(`[prism-config] Invalid ${keyLower} syntax:`, value);
                    }
                } else {
                    // No pattern validation, just store
                    options._dynamicActivations.push({
                        ...paramConfig.activation,
                        value: value
                    });
                }
            } else {
                console.warn('[prism-config] Unknown parameterized option:', key);
            }
        } else if (directives[partLower]) {
            // Known directive from config
            const directiveConfig = directives[partLower];
            enabledDirectives.add(partLower);

            // Add activation to the list
            if (directiveConfig.activation) {
                options._dynamicActivations.push({
                    directive: partLower,
                    ...directiveConfig.activation
                });
            }

            // Process "implies" - other directives that should be enabled
            // But skip any implied directives that are deprecated
            if (directiveConfig.implies) {
                directiveConfig.implies.forEach(implied => {
                    // Skip if already enabled or if deprecated
                    if (enabledDirectives.has(implied)) return;
                    if (deprecatedDirectives[implied]) {
                        // Silently skip deprecated implied directives (don't spam console)
                        return;
                    }
                    if (directives[implied]) {
                        enabledDirectives.add(implied);
                        if (directives[implied].activation) {
                            options._dynamicActivations.push({
                                directive: implied,
                                ...directives[implied].activation
                            });
                        }
                    }
                });
            }
        } else if (flagMap[partLower]) {
            // This is a flag defined in a directive's flags config
            const { directive, flagConfig } = flagMap[partLower];

            // Store the flag for the directive
            if (!options._flags[directive]) {
                options._flags[directive] = [];
            }
            options._flags[directive].push({
                flag: partLower,
                ...flagConfig
            });
        } else {
            console.warn('[prism-config] Unknown directive option:', part);
        }
    });

    return options;
}

/**
 * Apply directive options to a <pre> element
 * Uses dynamic activations from prism-config.json and custom activation handlers
 * @param {HTMLElement} pre - The <pre> element
 * @param {Object} options - Parsed options with _dynamicActivations array
 * @returns {Promise<void>}
 */
async function applyDirectiveOptions(pre, options) {
    const config = getDirectiveConfig();
    const directives = config.directives || {};
    const code = pre.querySelector('code');

    // Track which directives are applied for conflict resolution and custom activation
    const appliedDirectives = new Set();

    // Process dynamic activations from config
    if (options._dynamicActivations && options._dynamicActivations.length > 0) {
        options._dynamicActivations.forEach(activation => {
            const target = activation.target === 'code' ? code : pre;
            if (!target) return;

            // Track the directive for conflict resolution
            if (activation.directive) {
                appliedDirectives.add(activation.directive);
            }

            // Add class(es)
            if (activation.addClass) {
                const classes = Array.isArray(activation.addClass)
                    ? activation.addClass
                    : [activation.addClass];
                classes.forEach(cls => target.classList.add(cls));
            }

            // Set attribute(s)
            if (activation.setAttribute) {
                Object.entries(activation.setAttribute).forEach(([attr, value]) => {
                    // Replace {value} placeholder with actual value (for parameterized directives)
                    const finalValue = activation.value
                        ? value.replace('{value}', activation.value)
                        : value;
                    target.setAttribute(attr, finalValue);
                });
            }
        });
    }

    // Process flags that have addClass or setAttribute properties
    // This handles simple flags without needing a custom activation handler
    if (options._flags) {
        Object.entries(options._flags).forEach(([directive, flags]) => {
            flags.forEach(flagInfo => {
                // Determine target element (default to same as parent directive)
                const directiveConfig = directives[directive];
                const defaultTarget = directiveConfig?.activation?.target || 'pre';
                const flagTarget = flagInfo.target || defaultTarget;
                const target = flagTarget === 'code' ? code : pre;

                if (!target) return;

                // Add class(es) from flag
                if (flagInfo.addClass) {
                    const classes = Array.isArray(flagInfo.addClass)
                        ? flagInfo.addClass
                        : [flagInfo.addClass];
                    classes.forEach(cls => target.classList.add(cls));
                    console.debug(`[prism-config] Flag ${flagInfo.flag} added class(es):`, classes);
                }

                // Set attribute(s) from flag (for compatibility with overrideAttribute pattern)
                if (flagInfo.setAttribute) {
                    Object.entries(flagInfo.setAttribute).forEach(([attr, value]) => {
                        target.setAttribute(attr, value);
                    });
                }
            });
        });
    }

    // Handle conflicts defined in config
    appliedDirectives.forEach(directive => {
        const directiveConfig = directives[directive];
        if (directiveConfig?.conflicts) {
            directiveConfig.conflicts.forEach(conflicting => {
                if (appliedDirectives.has(conflicting)) {
                    // Remove conflicting classes/attributes
                    const conflictConfig = directives[conflicting];
                    if (conflictConfig?.activation) {
                        const target = conflictConfig.activation.target === 'code' ? code : pre;
                        if (target && conflictConfig.activation.addClass) {
                            const classes = Array.isArray(conflictConfig.activation.addClass)
                                ? conflictConfig.activation.addClass
                                : [conflictConfig.activation.addClass];
                            classes.forEach(cls => target.classList.remove(cls));
                        }
                    }
                }
            });
        }
    });

    // Execute custom activation handlers for directives that require special logic
    // All activation handlers are located in dropins/ directory
    for (const directive of appliedDirectives) {
        const directiveConfig = directives[directive];
        if (directiveConfig?.customActivation) {
            const handlerName = directiveConfig.customActivation;

            // Build context object for the handler
            const context = {
                options,
                appliedDirectives,
                directiveConfig
            };

            try {
                // Load activation handler from dropins/ directory
                const dropinPath = `./dropins/${handlerName}.js`;
                const handler = await import(dropinPath);

                // Execute the activation function
                if (handler && typeof handler.activate === 'function') {
                    handler.activate(pre, code, context);
                    console.debug(`[prism-config] Activated ${handlerName}`);
                } else {
                    console.warn(`[prism-config] Handler ${handlerName} has no activate function`);
                }
            } catch (err) {
                console.error(`[prism-config] Failed to load activation handler: ${handlerName}`, err);
            }
        }
    }

    // Mark that this block has per-block configuration
    pre.setAttribute('data-prism-configured', 'true');
}
