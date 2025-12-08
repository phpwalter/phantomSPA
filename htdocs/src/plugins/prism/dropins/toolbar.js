/**
 * Toolbar Dropin
 *
 * PhantomSPA dropin for the Prism toolbar plugin.
 * Provides toolbar orchestration and button registration for code blocks.
 *
 * PRISM PLUGIN: toolbar
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/toolbar/prism-toolbar.min.js
 * CSS: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/toolbar/prism-toolbar.min.css
 *
 * PHANTOMSPA STATUS: DEPRECATED (PhantomSPA provides custom implementation)
 * The CDN plugin IS used for its container/framework, but PhantomSPA registers
 * custom button implementations via Prism.plugins.toolbar.registerButton() API.
 *
 * HYBRID APPROACH:
 * 1. USES Prism's official `toolbar` plugin as the container/framework
 * 2. REGISTERS custom buttons via `Prism.plugins.toolbar.registerButton()` API
 * 3. MAINTAINS full UI control over button appearance and behavior
 *
 * WHY HYBRID?
 * - Prism's toolbar plugin handles the container lifecycle (creation, positioning, cleanup)
 * - PhantomSPA registers custom button implementations for better UI/UX control
 * - This provides automatic compatibility with Prism toolbar updates
 * - Button logic is maintained by PhantomSPA for Material Design consistency
 *
 * REGISTERED BUTTONS:
 * - phantomspa-language: Language label with icon (from show-language.js)
 * - phantomspa-copy: Copy button with checkmark feedback (from copy-to-clipboard.js)
 * - phantomspa-download: Download menu with format options (from download-button.js)
 *
 * @module dropins/toolbar
 * @see https://prismjs.com/plugins/toolbar/
 */

import { getLanguageIconClass } from './icon-sprites.js';
import { createCopyButton } from './copy-to-clipboard.js';
import { createDownloadMenu } from './download-button.js';

let dropinConfig = {};
let directiveConfig = {};
let buttonsRegistered = false;

/**
 * Initialize the toolbar drop-in
 * Registers buttons with Prism's toolbar plugin if available
 * @param {Object} context - Initialization context
 */
export async function init(context) {
    dropinConfig = context.config || {};
    directiveConfig = context.directiveConfig;

    console.log('[toolbar] Initialized with config:', dropinConfig);

    // Register buttons with Prism toolbar if available
    // This must happen during init, before any highlighting occurs
    registerToolbarButtons();

    return {
        registerToolbarButtons,
        isToolbarAvailable,
        enhanceToolbarStyling
    };
}

/**
 * Check if Prism toolbar plugin is available and functional
 * @returns {boolean} True if toolbar plugin is available
 */
export function isToolbarAvailable() {
    return typeof Prism !== 'undefined' &&
           Prism.plugins?.toolbar &&
           typeof Prism.plugins.toolbar.registerButton === 'function';
}

/**
 * Register PhantomSPA buttons with Prism's toolbar plugin
 * Uses the official Prism.plugins.toolbar.registerButton() API
 */
function registerToolbarButtons() {
    if (buttonsRegistered) {
        console.log('[toolbar] Buttons already registered, skipping');
        return;
    }

    if (!isToolbarAvailable()) {
        console.warn('[toolbar] Prism toolbar plugin not available');
        return;
    }

    console.log('[toolbar] Registering buttons with Prism toolbar...');

    // Register language label with icon (replaces show-language)
    if (dropinConfig.showLanguageLabel !== false) {
        Prism.plugins.toolbar.registerButton('phantomspa-language', createLanguageLabelButton);
        console.log('[toolbar] Registered: phantomspa-language');
    }

    // Register copy button (replaces copy-to-clipboard)
    if (dropinConfig.showCopyButton !== false) {
        Prism.plugins.toolbar.registerButton('phantomspa-copy', createCopyButtonForToolbar);
        console.log('[toolbar] Registered: phantomspa-copy');
    }

    // Register download menu (replaces download-button)
    if (dropinConfig.showDownloadMenu !== false) {
        Prism.plugins.toolbar.registerButton('phantomspa-download', createDownloadMenuForToolbar);
        console.log('[toolbar] Registered: phantomspa-download');
    }

    buttonsRegistered = true;
    console.log('[toolbar] Button registration complete');
}

/**
 * Create language label button for Prism toolbar
 * @param {Object} env - Prism environment object
 * @returns {HTMLElement} Language label element
 */
function createLanguageLabelButton(env) {
    const language = env.language || 'text';
    const displayLanguage = language.toUpperCase();

    const pre = env.element.parentElement;
    const rawTitle = pre?.dataset?.title ||
                     pre?.getAttribute('data-filename') ||
                     extractTitleFromComment(pre) ||
                     '';
    const title = rawTitle ? sanitizeFilename(rawTitle) : '';

    const label = document.createElement('span');
    label.className = 'prism-language-label';

    const { iconClass, baseClass, sizeClass } = getLanguageIconClass(language.toLowerCase(), directiveConfig);
    const icon = document.createElement('span');
    icon.className = `${baseClass} ${sizeClass} ${iconClass}`;
    label.appendChild(icon);

    const labelText = title ? `${displayLanguage} • ${title}` : displayLanguage;
    label.appendChild(document.createTextNode(' ' + labelText));

    return label;
}



/**
 * Create download menu for Prism toolbar
 * @param {Object} env - Prism environment object
 * @returns {HTMLElement} Download menu container
 */
function createDownloadMenuForToolbar(env) {
    const code = env.element;
    const codeText = code ? code.textContent : '';
    const language = env.language || 'text';

    const pre = env.element.parentElement;
    const rawTitle = pre?.dataset?.title ||
                     pre?.getAttribute('data-filename') ||
                     extractTitleFromComment(pre) ||
                     'code';
    const title = sanitizeFilename(rawTitle);

    const container = document.createElement('span');
    container.className = 'prism-download-container';

    const { menuBtn, dropdown } = createDownloadMenu(codeText, title, language.toLowerCase());
    container.appendChild(menuBtn);
    container.appendChild(dropdown);

    return container;
}

/**
 * afterHighlight hook - called after Prism highlights code
 * Enhances Prism toolbar output with PhantomSPA styling
 * @param {Object} context - Hook context
 * @param {HTMLElement} context.container - Container that was highlighted
 */
export function afterHighlight(context) {
    const { container } = context;
    if (!container) return;

    if (isToolbarAvailable() && buttonsRegistered) {
        enhanceToolbarStyling(container);
    }
}

/**
 * Enhance Prism toolbar styling with PhantomSPA classes
 * @param {HTMLElement} container - Container element
 */
export function enhanceToolbarStyling(container) {
    const toolbars = container.querySelectorAll('.toolbar');

    toolbars.forEach(toolbar => {
        if (!toolbar.classList.contains('prism-custom-header')) {
            toolbar.classList.add('prism-custom-header');
        }

        const toolbarItems = toolbar.querySelectorAll('.toolbar-item');
        toolbarItems.forEach(item => {
            if (item.querySelector('.prism-language-label')) {
                item.classList.add('phantomspa-language-item');
            } else if (item.querySelector('.prism-copy-btn')) {
                item.classList.add('phantomspa-copy-item');
            } else if (item.querySelector('.prism-download-container')) {
                item.classList.add('phantomspa-download-item');
            }
        });
    });
}

/**
 * onConfigChange hook - called when user changes settings
 * @param {Object} context - Hook context
 */
export function onConfigChange(context) {
    const { container } = context;
    if (container && isToolbarAvailable() && buttonsRegistered) {
        enhanceToolbarStyling(container);
    }
}

/**
 * Extract title from HTML comment before code block
 * @param {HTMLElement} pre - The pre element
 * @returns {string|null} Extracted title or null
 */
function extractTitleFromComment(pre) {
    let node = pre.previousSibling;
    while (node) {
        if (node.nodeType === Node.COMMENT_NODE) {
            const match = node.textContent.match(/title:\s*(.+)/i);
            if (match) return match[1].trim();
        }
        if (node.nodeType === Node.ELEMENT_NODE) break;
        node = node.previousSibling;
    }
    return null;
}

/**
 * Create copy button for Prism toolbar
 * @param {Object} env - Prism environment object
 * @returns {HTMLElement} Copy button element
 */
function createCopyButtonForToolbar(env) {
    const code = env.element;
    const codeText = code ? code.textContent : '';
    return createCopyButton(codeText);
}

/**
 * Sanitize filename for download
 * @param {string} filename - Raw filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
    return filename.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
}
