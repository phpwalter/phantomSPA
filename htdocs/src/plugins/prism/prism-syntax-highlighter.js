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
    initPrismConfigFromJson,
    getDirectiveConfig
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
 * @deprecated This function is now handled by the custom-headers drop-in.
 * Kept for backwards compatibility but no longer called by core.
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

        // Extract title for filename
        const rawTitle = pre.dataset.title ||
                         pre.getAttribute('data-filename') ||
                         extractTitleFromComment(pre) ||
                         'code';
        const title = sanitizeFilename(rawTitle);

        // Create header element
        const header = document.createElement('div');
        header.className = 'prism-custom-header';

        // Left side: Language label with icon and optional title
        const languageLabel = document.createElement('span');
        languageLabel.className = 'prism-language-label';

        // Create language icon using CSS custom properties system
        const languageIcon = document.createElement('span');
        const { iconClass, baseClass, sizeClass } = getLanguageIconClass(language.toLowerCase());
        languageIcon.className = `${baseClass} ${sizeClass} ${iconClass}`;

        // Create text content with conditional title
        const shouldShowTitle = title && title !== 'code';
        const labelText = shouldShowTitle ? `${language} • ${title}` : language;

        // Assemble language label
        languageLabel.appendChild(languageIcon);
        languageLabel.appendChild(document.createTextNode(' ' + labelText));

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

        // Get file extension for display (e.g., "js", "css", "bash")
        const fileExtension = getFileExtension(language.toLowerCase());

        dropdown.innerHTML = `
            <button class="prism-dropdown-item" data-action="download-native">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor"/>
                </svg>
                Download as .${fileExtension}
            </button>
            <button class="prism-dropdown-item" data-action="download-txt">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor"/>
                </svg>
                Download as .txt
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
            const fileExtension = getFileExtension(language.toLowerCase());

            if (action === 'download-native') {
                downloadCode(codeText, title, fileExtension);
            } else if (action === 'download-txt') {
                downloadCode(codeText, title, 'txt');
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
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.warn('Clipboard API failed, trying fallback:', err);
            fallbackCopyToClipboard(text, button);
        });
    } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopyToClipboard(text, button);
    }
}

/**
 * Fallback copy method using document.execCommand
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element for feedback
 */
function fallbackCopyToClipboard(text, button) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);

    try {
        // Select and copy the text
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');

        if (successful) {
            showCopySuccess(button);
        } else {
            showCopyError(button);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showCopyError(button);
    } finally {
        // Clean up
        document.body.removeChild(textarea);
    }
}

/**
 * Show copy success feedback
 * @param {HTMLElement} button - Button element
 */
function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 12L1.5 8L2.91 6.59L5.5 9.17L13.09 1.59L14.5 3L5.5 12Z" fill="currentColor"/>
    </svg>`;
    button.classList.add('success');
    button.title = 'Copied!';

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('success');
        button.title = 'Copy code';
    }, 2000);
}

/**
 * Show copy error feedback
 * @param {HTMLElement} button - Button element
 */
function showCopyError(button) {
    const originalHTML = button.innerHTML;
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zM7 5h2v6H7V5zM7 13h2v2H7v-2z" fill="currentColor"/>
    </svg>`;
    button.classList.add('error');
    button.title = 'Copy failed - try selecting and copying manually';

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('error');
        button.title = 'Copy code';
    }, 3000);
}

/**
 * Map programming language to sprite icon class
 * @deprecated This function is now provided by the icon-sprites drop-in.
 * Kept for backwards compatibility.
 * @param {string} language - Programming language name (lowercase)
 * @returns {Object} - Object with iconClass, baseClass, and sizeClass
 */
function getLanguageIconClass(language) {
    const config = getDirectiveConfig();
    const spriteConfig = config.iconSprites?.['prog-lang-icons'] || {};

    const prefix = spriteConfig.iconClassPrefix || 'lang-icon';
    const sizeVariant = spriteConfig.sizeVariant || '-sm';
    const languageMap = spriteConfig.languageMap || {};

    const langLower = language.toLowerCase();
    const iconName = languageMap[langLower];

    // Build the language-specific icon class WITHOUT the size suffix
    // The size suffix is only for the size class (e.g., lang-icon-sm)
    // The language class should be just lang-icon-{language} (e.g., lang-icon-javascript)
    let iconClass;
    if (iconName) {
        iconClass = `${prefix}-${iconName}`;
    } else {
        // Default to json icon if no mapping found
        iconClass = `${prefix}-json`;
    }

    return {
        iconClass,
        baseClass: prefix,
        sizeClass: `${prefix}${sizeVariant}`
    };
}

/**
 * Get file extension for a given language
 * @param {string} language - Programming language name (lowercase)
 * @returns {string} - File extension without dot
 */
function getFileExtension(language) {
    const extensionMap = {
        'javascript': 'js',
        'typescript': 'ts',
        'jsx': 'jsx',
        'tsx': 'tsx',
        'python': 'py',
        'bash': 'bash',
        'shell': 'sh',
        'css': 'css',
        'html': 'html',
        'markup': 'html',
        'json': 'json',
        'yaml': 'yml',
        'yml': 'yml',
        'markdown': 'md',
        'md': 'md',
        'sql': 'sql',
        'php': 'php',
        'ruby': 'rb',
        'java': 'java',
        'csharp': 'cs',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rust': 'rs',
        'swift': 'swift',
        'kotlin': 'kt',
        'xml': 'xml',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'stylus': 'styl'
    };

    return extensionMap[language] || language;
}

/**
 * Sanitize filename by removing invalid characters
 * @param {string} filename - Raw filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace invalid chars with underscore
        .replace(/_{2,}/g, '_')            // Replace multiple underscores with single
        .replace(/^_|_$/g, '')             // Remove leading/trailing underscores
        || 'code';                         // Fallback if empty after sanitization
}

/**
 * Extract title from HTML comment directive before code block
 * @param {HTMLElement} pre - The pre element
 * @returns {string|null} - Extracted title or null
 */
function extractTitleFromComment(pre) {
    // Look for HTML comment before the pre element
    let node = pre.previousSibling;
    while (node && node.nodeType !== Node.COMMENT_NODE) {
        if (node.nodeType === Node.ELEMENT_NODE) break; // Stop if we hit another element
        node = node.previousSibling;
    }

    if (node && node.nodeType === Node.COMMENT_NODE) {
        const comment = node.textContent.trim();
        // Look for patterns like: prism-title: "filename" or title: "filename"
        const titleMatch = comment.match(/(?:prism-)?title:\s*["']([^"']+)["']/i);
        if (titleMatch) {
            return titleMatch[1];
        }
    }

    return null;
}

/**
 * Download code as file
 * @param {string} text - Code text content
 * @param {string} filename - Base filename without extension (e.g., "example" or "code")
 * @param {string} extension - File extension without dot (e.g., "js", "txt")
 */
function downloadCode(text, filename, extension) {
    // Create blob with code content
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Add file type icons to tree code blocks (fallback for treeview plugin)
 * @deprecated This function is now handled by the tree-icons drop-in.
 * Kept for backwards compatibility but no longer called by core.
 * @param {HTMLElement} container - Container element
 */
function addTreeFileIcons(container) {
    // Find all tree code blocks (treeview or tree language)
    const treeBlocks = container.querySelectorAll('pre[class*="language-treeview"], pre.language-tree, pre[class*="language-tree"]');

    console.log(`[tree-icons] Searching for tree blocks in container:`, container);
    console.log(`[tree-icons] Found ${treeBlocks.length} tree blocks`);

    // Debug: log all pre elements to see what classes they have
    const allPres = container.querySelectorAll('pre');
    console.log(`[tree-icons] All pre elements (${allPres.length}):`, Array.from(allPres).map(pre => pre.className));

    treeBlocks.forEach((pre, blockIndex) => {
        const code = pre.querySelector('code');
        if (!code) return;

        // Skip if already processed
        if (code.dataset.treeIconsProcessed) return;
        code.dataset.treeIconsProcessed = 'true';

        console.log(`[tree-icons] Processing tree block ${blockIndex}...`);

        // Get the HTML content and process it line by line
        const htmlContent = code.innerHTML;
        const lines = htmlContent.split('\n');

        // Process each line to add icons
        const processedLines = lines.map((line, index) => {
            // Skip empty lines
            if (!line.trim()) return line;

            // Extract filename from the line (after tree structure characters)
            // Look for patterns like: ├─ filename.ext or └─ filename.ext
            const filenameMatch = line.match(/([├└│\s─]*)(.*?)(<\/[^>]*>)*$/);
            if (!filenameMatch) return line;

            const treeChars = filenameMatch[1] || '';
            const restOfLine = filenameMatch[2] || '';
            const closingTags = filenameMatch[3] || '';

            // Extract just the filename (remove any HTML tags)
            const cleanText = restOfLine.replace(/<[^>]*>/g, '').trim();
            if (!cleanText) return line;

            console.log(`[tree-icons] Line ${index}: "${cleanText}"`);

            // Determine file type and icon class
            const iconClass = getFileIconClass(cleanText);

            // Create icon HTML
            const iconHtml = `<span class="tree-file-icon ${iconClass}" aria-hidden="true"></span>`;

            // Insert icon after tree characters but before filename
            const newLine = treeChars + iconHtml + restOfLine + closingTags;

            console.log(`[tree-icons] Added ${iconClass} icon for "${cleanText}"`);
            return newLine;
        });

        // Update the code block with processed content
        code.innerHTML = processedLines.join('\n');

        console.log(`[tree-icons] Completed processing tree block ${blockIndex}`);
    });
}

/**
 * Get file icon class based on filename
 * @deprecated This function is now provided by the icon-sprites drop-in.
 * Kept for backwards compatibility.
 * @param {string} filename - The filename to analyze
 * @returns {string} - CSS class for the appropriate icon
 */
function getFileIconClass(filename) {
    const config = getDirectiveConfig();
    const spriteConfig = config.iconSprites?.['file-type-icons'] || {};

    const prefix = spriteConfig.iconClassPrefix || 'lang-icon';
    const directoryNames = spriteConfig.directoryNames || [];
    const extensionMap = spriteConfig.extensionMap || {};

    // Remove trailing slash for directories
    const cleanName = filename.replace(/\/$/, '');

    // Check if it's a directory (ends with / or has no extension and is a known directory name)
    if (filename.endsWith('/') ||
        (!cleanName.includes('.') && directoryNames.includes(cleanName.toLowerCase()))) {
        return `${prefix}-folder`;
    }

    // Get file extension
    const extension = cleanName.split('.').pop()?.toLowerCase();

    // Look up icon name in extension map
    const iconName = extensionMap[extension];

    if (iconName) {
        return `${prefix}-${iconName}`;
    }

    // Default to generic file icon
    return `${prefix}-generic`;
}
