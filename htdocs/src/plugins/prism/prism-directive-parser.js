/**
 * Prism Directive Parser
 *
 * Handles parsing and applying per-block Prism configuration from HTML comment directives.
 * Parses comments like: <!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard -->
 *
 * @module prism-directive-parser
 */

import { getDirectiveConfig } from './prism-config-storage.js';

/**
 * Apply per-code-block Prism configuration from HTML comment directives
 * @param {HTMLElement} container - Container element (usually main)
 * @returns {Promise<void>}
 */
export async function applyPerBlockPrismConfig(container) {
    if (!container) return;

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

    const activationPromises = [];

    for (const comment of comments) {
        const text = comment.textContent.trim();
        const match = text.match(/^prism:\s*(.+)$/i);
        if (!match) continue;

        const directiveText = match[1].trim();
        let nextElement = comment.nextSibling;

        while (nextElement && nextElement.nodeType === Node.TEXT_NODE && !nextElement.textContent.trim()) {
            nextElement = nextElement.nextSibling;
        }

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

        const codeClass = code.className;
        const languageMatch = codeClass.match(/language-(\w+)/);
        if (languageMatch && !pre.classList.contains(languageMatch[0])) {
            pre.classList.add(languageMatch[0]);
        }

        const options = parseDirectiveOptions(directiveText);

        const activationPromise = applyDirectiveOptions(pre, options).then(() => {
            comment.remove();
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
    console.warn(`[prism-config] ⚠️ Directive '${directiveName}' is deprecated and has been ignored.`);
    console.warn(`[prism-config] Reason: ${deprecation.reason}`);
    console.warn(`[prism-config] ${deprecation.replacement}`);

    return true;
}

/**
 * Parse directive options from the directive text
 * @param {string} directiveText - The directive text (e.g., "line-numbers highlight=2,4-6")
 * @returns {Object} Parsed options
 */
function parseDirectiveOptions(directiveText) {
    const config = getDirectiveConfig();
    const directives = config.directives || {};
    const parameterized = config.parameterizedDirectives || {};
    const deprecatedDirectives = config.deprecatedDirectives || {};
    const flagMap = buildFlagMap(directives);

    const options = {
        _dynamicActivations: [],
        _flags: {},
        _filteredDeprecated: []
    };

    const parts = directiveText.split(/\s+/);
    const enabledDirectives = new Set();

    parts.forEach(part => {
        if (!part) return;
        const partLower = part.toLowerCase();

        if (isDeprecatedDirective(partLower, deprecatedDirectives)) {
            options._filteredDeprecated.push(partLower);
            return;
        }

        if (part.includes('=')) {
            const [key, value] = part.split('=', 2);
            const keyLower = key.toLowerCase();

            if (parameterized[keyLower]) {
                const paramConfig = parameterized[keyLower];
                if (paramConfig.pattern) {
                    const regex = new RegExp(paramConfig.pattern);
                    if (regex.test(value)) {
                        options._dynamicActivations.push({ ...paramConfig.activation, value });
                    } else {
                        console.warn(`[prism-config] Invalid ${keyLower} syntax:`, value);
                    }
                } else {
                    options._dynamicActivations.push({ ...paramConfig.activation, value });
                }
            } else {
                console.warn('[prism-config] Unknown parameterized option:', key);
            }
        } else if (directives[partLower]) {
            const directiveConfig = directives[partLower];
            enabledDirectives.add(partLower);

            if (directiveConfig.activation) {
                options._dynamicActivations.push({ directive: partLower, ...directiveConfig.activation });
            }

            if (directiveConfig.implies) {
                directiveConfig.implies.forEach(implied => {
                    if (enabledDirectives.has(implied)) return;
                    if (deprecatedDirectives[implied]) return;
                    if (directives[implied]) {
                        enabledDirectives.add(implied);
                        if (directives[implied].activation) {
                            options._dynamicActivations.push({ directive: implied, ...directives[implied].activation });
                        }
                    }
                });
            }
        } else if (flagMap[partLower]) {
            const { directive, flagConfig } = flagMap[partLower];
            if (!options._flags[directive]) {
                options._flags[directive] = [];
            }
            options._flags[directive].push({ flag: partLower, ...flagConfig });
        } else {
            console.warn('[prism-config] Unknown directive option:', part);
        }
    });

    return options;
}


/**
 * Apply directive options to a pre element
 * @param {HTMLElement} pre - The pre element
 * @param {Object} options - Parsed options from parseDirectiveOptions
 * @returns {Promise<void>}
 */
async function applyDirectiveOptions(pre, options) {
    const config = getDirectiveConfig();
    const activationHandlers = config.activationHandlers || {};

    // Process dynamic activations
    for (const activation of options._dynamicActivations) {
        console.log('[prism-directive] Processing activation:', activation);

        // Add CSS class if specified
        if (activation.addClass) {
            pre.classList.add(activation.addClass);
        }

        // Set data attribute if specified (legacy format)
        if (activation.dataAttr) {
            const value = activation.value !== undefined ? activation.value : '';
            pre.setAttribute(activation.dataAttr, value);
        }

        // Set attributes from setAttribute object (new format from config)
        if (activation.setAttribute) {
            console.log('[prism-directive] Setting attributes from setAttribute:', activation.setAttribute);
            for (const [attrName, attrValue] of Object.entries(activation.setAttribute)) {
                const value = attrValue === '{value}' && activation.value !== undefined
                    ? activation.value
                    : attrValue;
                console.log(`[prism-directive] Setting ${attrName}="${value}"`);
                pre.setAttribute(attrName, value);
            }
        }

        // Apply flags for this directive
        const directiveName = activation.directive;
        console.log('[prism-directive] Checking flags for directive:', directiveName, 'flags:', options._flags[directiveName]);
        if (directiveName && options._flags[directiveName]) {
            for (const flagInfo of options._flags[directiveName]) {
                console.log('[prism-directive] Applying flag:', flagInfo);
                if (flagInfo.addClass) {
                    pre.classList.add(flagInfo.addClass);
                }
                if (flagInfo.dataAttr) {
                    pre.setAttribute(flagInfo.dataAttr, flagInfo.value || '');
                }
                // Handle overrideAttribute from flags (overrides the base activation's setAttribute)
                if (flagInfo.overrideAttribute) {
                    console.log('[prism-directive] Applying overrideAttribute:', flagInfo.overrideAttribute);
                    for (const [attrName, attrValue] of Object.entries(flagInfo.overrideAttribute)) {
                        console.log(`[prism-directive] Overriding ${attrName}="${attrValue}"`);
                        pre.setAttribute(attrName, attrValue);
                    }
                }
            }
        }

        // Call custom activation handler if specified
        if (activation.handler && activationHandlers[activation.handler]) {
            const handlerConfig = activationHandlers[activation.handler];
            try {
                const module = await import(handlerConfig.module);
                if (module[handlerConfig.function]) {
                    await module[handlerConfig.function](pre, activation, options._flags[directiveName] || []);
                }
            } catch (err) {
                console.error(`[prism-config] Failed to call activation handler ${activation.handler}:`, err);
            }
        }
    }
}
