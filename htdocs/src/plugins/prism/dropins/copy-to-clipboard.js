/**
 * Copy to Clipboard Drop-in
 *
 * Provides copy-to-clipboard functionality for code blocks.
 * This module handles both toolbar-based and standalone copy button implementations.
 *
 * Features:
 * - Copy button with clipboard icon
 * - Checkmark feedback animation on successful copy
 * - Fallback for non-secure contexts (uses execCommand)
 * - Error state handling
 *
 * @module dropins/copy-to-clipboard
 */

let dropinConfig = {};

/**
 * Initialize the copy-to-clipboard drop-in
 * @param {Object} context - Initialization context
 */
export async function init(context) {
    dropinConfig = context.config || {};
    console.log('[copy-to-clipboard] Initialized');
    return {
        createCopyButton,
        createCopyButtonForToolbar
    };
}

/**
 * Create copy button for Prism toolbar
 * Called by Prism.plugins.toolbar.registerButton()
 * @param {Object} env - Prism environment object
 * @returns {HTMLElement} Copy button element
 */
export function createCopyButtonForToolbar(env) {
    const code = env.element;
    const codeText = code ? code.textContent : '';
    return createCopyButton(codeText);
}

/**
 * Create copy button element
 * @param {string} codeText - The code text to copy
 * @returns {HTMLButtonElement} Copy button element
 */
export function createCopyButton(codeText) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'prism-copy-btn';
    copyBtn.innerHTML = getCopyIconSVG();
    copyBtn.title = 'Copy code';
    copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
    copyBtn.addEventListener('click', () => copyCodeToClipboard(codeText, copyBtn));
    return copyBtn;
}

/**
 * Get the copy icon SVG markup
 * @returns {string} SVG markup for copy icon
 */
function getCopyIconSVG() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 1H3.5C2.67 1 2 1.67 2 2.5V11.5H3.5V2.5H10.5V1ZM12.5 4H6.5C5.67 4 5 4.67 5 5.5V13.5C5 14.33 5.67 15 6.5 15H12.5C13.33 15 14 14.33 14 13.5V5.5C14 4.67 13.33 4 12.5 4ZM12.5 13.5H6.5V5.5H12.5V13.5Z" fill="currentColor"/>
    </svg>`;
}

/**
 * Get the checkmark icon SVG markup
 * @returns {string} SVG markup for checkmark icon
 */
function getCheckmarkIconSVG() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 10.78L3.22 8L2.28 8.94L6 12.66L14 4.66L13.06 3.72L6 10.78Z" fill="currentColor"/>
    </svg>`;
}

/**
 * Copy code to clipboard with fallback for non-secure contexts
 * @param {string} text - Text to copy
 * @param {HTMLButtonElement} button - Button element for feedback
 */
async function copyCodeToClipboard(text, button) {
    const originalHTML = button.innerHTML;

    const showSuccess = () => {
        button.innerHTML = getCheckmarkIconSVG();
        button.classList.add('copied');
        button.title = 'Copied!';
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
            button.title = 'Copy code';
        }, 2000);
    };

    const showError = () => {
        button.classList.add('error');
        button.title = 'Copy failed';
        setTimeout(() => {
            button.classList.remove('error');
            button.title = 'Copy code';
        }, 2000);
    };

    // Try modern Clipboard API first (requires secure context)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            showSuccess();
            return;
        } catch (err) {
            console.warn('[copy-to-clipboard] Clipboard API failed, trying fallback:', err);
        }
    }

    // Fallback for older browsers or non-secure contexts
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (successful) {
            showSuccess();
        } else {
            showError();
            console.error('[copy-to-clipboard] Fallback copy failed');
        }
    } catch (err) {
        showError();
        console.error('[copy-to-clipboard] Failed to copy:', err);
    }
}

