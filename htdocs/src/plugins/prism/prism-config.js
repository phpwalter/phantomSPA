/**
 * Prism.js Configuration Manager
 * Handles user preferences for syntax highlighting features
 */

const STORAGE_KEY = 'prismConfig';

const DEFAULT_CONFIG = {
    enableHighlighting: true,
    showLineNumbers: true,
    showCopyButton: true,
    showDownloadButton: true,
    showLanguageLabel: true,
    enableLineHighlight: true,
    enableCommandLine: true
};

/**
 * Load Prism configuration from localStorage
 * @returns {Object} Configuration object
 */
export function loadPrismConfig() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const config = JSON.parse(saved);
            return { ...DEFAULT_CONFIG, ...config };
        }
    } catch (err) {
        console.warn('[prism-config] Failed to load config:', err);
    }
    return { ...DEFAULT_CONFIG };
}

/**
 * Save Prism configuration to localStorage
 * @param {Object} config - Configuration object
 */
export function savePrismConfig(config) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
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
    const config = { ...DEFAULT_CONFIG };
    savePrismConfig(config);
    return config;
}

/**
 * Apply Prism configuration to the document
 * @param {Object} config - Configuration object
 */
export function applyPrismConfig(config) {
    const body = document.body;
    
    // Apply body classes for CSS-based feature toggling
    body.classList.toggle('prism-no-highlighting', !config.enableHighlighting);
    body.classList.toggle('prism-no-line-numbers', !config.showLineNumbers);
    body.classList.toggle('prism-no-copy', !config.showCopyButton);
    body.classList.toggle('prism-no-download', !config.showDownloadButton);
    body.classList.toggle('prism-no-language', !config.showLanguageLabel);
    body.classList.toggle('prism-no-line-highlight', !config.enableLineHighlight);
    body.classList.toggle('prism-no-command-line', !config.enableCommandLine);
    
    console.info('[prism-config] Configuration applied:', config);
}

/**
 * Apply Prism highlighting to code blocks based on configuration
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

            // Handle line numbers
            if (config.showLineNumbers && !pre.classList.contains('command-line')) {
                pre.classList.add('line-numbers');
            } else {
                pre.classList.remove('line-numbers');
            }

            // Handle command-line
            if (!config.enableCommandLine && pre.classList.contains('command-line')) {
                pre.classList.remove('command-line');
            }
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
 * @param {HTMLElement} container - Container element
 */
function removeHighlighting(container) {
    const codeBlocks = container.querySelectorAll('pre[class*="language-"]');
    
    codeBlocks.forEach(pre => {
        const code = pre.querySelector('code');
        if (code) {
            // Get original text content
            const text = code.textContent;
            
            // Remove all Prism-generated elements
            code.innerHTML = '';
            code.textContent = text;
            
            // Remove Prism classes except language class
            const classes = Array.from(pre.classList);
            classes.forEach(cls => {
                if (cls !== 'language-' + pre.className.match(/language-(\w+)/)?.[1]) {
                    if (cls.startsWith('line-') || cls === 'command-line') {
                        pre.classList.remove(cls);
                    }
                }
            });
        }
    });
}

/**
 * Create Prism settings UI panel
 * @param {Object} config - Current configuration
 * @param {Function} onUpdate - Callback when settings change
 * @returns {HTMLElement} Settings panel element
 */
export function createPrismSettingsPanel(config, onUpdate) {
    const panel = document.createElement('div');
    panel.classList.add('prism-settings-panel');
    
    const title = document.createElement('h4');
    title.textContent = 'Code Block Settings';
    panel.appendChild(title);
    
    // Create toggle options
    const options = [
        { key: 'enableHighlighting', label: 'Enable syntax highlighting' },
        { key: 'showLineNumbers', label: 'Show line numbers' },
        { key: 'showCopyButton', label: 'Show copy button' },
        { key: 'showDownloadButton', label: 'Show download button' },
        { key: 'showLanguageLabel', label: 'Show language label' },
        { key: 'enableLineHighlight', label: 'Enable line highlighting' },
        { key: 'enableCommandLine', label: 'Enable command-line prompts' }
    ];
    
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
 */
export function applyPerBlockPrismConfig(container) {
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

    // Process each comment
    comments.forEach(comment => {
        const text = comment.textContent.trim();

        // Check if this is a prism directive comment
        const match = text.match(/^prism:\s*(.+)$/i);
        if (!match) return;

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
            return;
        }

        const pre = nextElement;
        const code = pre.querySelector('code');

        if (!code) {
            console.warn('[prism-config] Prism directive found but next <pre> has no <code>:', text);
            return;
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

        // Apply options to the <pre> element
        applyDirectiveOptions(pre, options);

        // Remove the comment from the DOM
        comment.remove();

        console.info('[prism-config] Applied per-block directive:', options, 'to', pre);
        console.log('[prism-config] Pre element classes:', pre.className);
        console.log('[prism-config] Pre element attributes:', {
            'data-line': pre.getAttribute('data-line'),
            'data-prism-configured': pre.getAttribute('data-prism-configured'),
            'data-prism-copy': pre.getAttribute('data-prism-copy'),
            'data-prism-download': pre.getAttribute('data-prism-download'),
            'data-prism-language': pre.getAttribute('data-prism-language')
        });
    });
}

/**
 * Parse directive options from the directive text
 * @param {string} directiveText - The directive text (e.g., "line-numbers highlight=2,4-6 copy-to-clipboard")
 * @returns {Object} Parsed options
 */
function parseDirectiveOptions(directiveText) {
    const options = {
        lineNumbers: false,
        highlight: null,
        copyToClipboard: false,
        downloadButton: false,
        showLanguage: false,
        toolbar: false,
        commandLine: false
    };

    // Split by whitespace
    const parts = directiveText.split(/\s+/);

    parts.forEach(part => {
        if (!part) return;

        // Check for parameterized options (e.g., highlight=2,4-6)
        if (part.includes('=')) {
            const [key, value] = part.split('=', 2);

            if (key === 'highlight') {
                // Validate highlight syntax
                if (validateHighlightSyntax(value)) {
                    options.highlight = value;
                } else {
                    console.warn('[prism-config] Invalid highlight syntax:', value);
                }
            } else {
                console.warn('[prism-config] Unknown parameterized option:', key);
            }
        } else {
            // Simple flag options
            switch (part.toLowerCase()) {
                case 'line-numbers':
                    options.lineNumbers = true;
                    break;
                case 'copy-to-clipboard':
                    options.copyToClipboard = true;
                    options.toolbar = true; // Toolbar required for copy button
                    break;
                case 'download-button':
                    options.downloadButton = true;
                    options.toolbar = true; // Toolbar required for download button
                    break;
                case 'show-language':
                    options.showLanguage = true;
                    options.toolbar = true; // Toolbar required for language label
                    break;
                case 'toolbar':
                    options.toolbar = true;
                    break;
                case 'command-line':
                    options.commandLine = true;
                    break;
                default:
                    console.warn('[prism-config] Unknown directive option:', part);
            }
        }
    });

    return options;
}

/**
 * Validate highlight syntax (e.g., "2,4-6", "1,3,5", "1-3")
 * @param {string} value - The highlight value
 * @returns {boolean} True if valid
 */
function validateHighlightSyntax(value) {
    // Valid patterns: single numbers, comma-separated numbers, ranges (e.g., "2", "1,3,5", "2-6", "1,3-5,7")
    return /^[\d,\-]+$/.test(value);
}

/**
 * Apply directive options to a <pre> element
 * @param {HTMLElement} pre - The <pre> element
 * @param {Object} options - Parsed options
 */
function applyDirectiveOptions(pre, options) {
    // Add line-numbers class
    if (options.lineNumbers) {
        pre.classList.add('line-numbers');
    }

    // Add highlight data attribute
    if (options.highlight) {
        pre.setAttribute('data-line', options.highlight);
    }

    // Add command-line class
    if (options.commandLine) {
        pre.classList.add('command-line');
        // Remove line-numbers if command-line is enabled (they're mutually exclusive)
        pre.classList.remove('line-numbers');
    }

    // Mark that this block has per-block configuration
    // This can be used to prevent global config from overriding
    pre.setAttribute('data-prism-configured', 'true');

    // Store which features are enabled for this block
    // This allows CSS to show/hide toolbar buttons per-block
    if (options.copyToClipboard) {
        pre.setAttribute('data-prism-copy', 'true');
    }
    if (options.downloadButton) {
        pre.setAttribute('data-prism-download', 'true');
        // Prism download-button plugin requires BOTH data-src AND data-download-link attributes
        // data-src: URL to download from (we'll use a data URL with the code content)
        // data-download-link: filename for the download
        const code = pre.querySelector('code');
        if (code) {
            const language = pre.className.match(/language-(\w+)/)?.[1] || 'txt';
            const filename = `code.${language}`;
            const codeContent = code.textContent;

            // Create a data URL with the code content
            const blob = new Blob([codeContent], { type: 'text/plain' });
            const dataUrl = URL.createObjectURL(blob);

            pre.setAttribute('data-src', dataUrl);
            pre.setAttribute('data-download-link', filename);
        }
    }
    if (options.showLanguage) {
        pre.setAttribute('data-prism-language', 'true');
    }
}
