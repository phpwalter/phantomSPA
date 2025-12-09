/**
 * Download Button Dropin
 *
 * PhantomSPA dropin for the Prism download-button plugin.
 * Provides download functionality for code blocks with PhantomSPA enhancements.
 *
 * PRISM PLUGIN: download-button
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/download-button/prism-download-button.min.js
 *
 * PHANTOMSPA STATUS: DEPRECATED (PhantomSPA provides custom implementation)
 * The CDN plugin is NOT used. PhantomSPA provides its own download menu with:
 * - Multiple format options (native extension + .txt)
 * - Three-dot menu icon for better UX
 * - Blob URL management for downloads
 *
 * Features:
 * - Download menu with multiple format options
 * - Native language extension download
 * - Plain text (.txt) download option
 * - Automatic file extension mapping
 * - Blob URL management for downloads
 *
 * @module dropins/download-button
 */

let dropinConfig = {};
let globalClickListenerAttached = false;

/**
 * Initialize the download-button drop-in
 * Sets up a single global click listener for all dropdown menus (event delegation)
 * @param {Object} context - Initialization context
 */
export async function init(context) {
    dropinConfig = context.config || {};

    // Attach global click listener once for all dropdowns (event delegation pattern)
    // This prevents memory leaks from adding listeners per code block
    if (!globalClickListenerAttached) {
        document.addEventListener('click', handleGlobalClick);
        globalClickListenerAttached = true;
        console.log('[download-button] Global click listener attached');
    }

    console.log('[download-button] Initialized');
    return {
        createDownloadMenu,
        createDownloadMenuForToolbar,
        downloadCode,
        getFileExtension
    };
}

/**
 * Global click handler for closing dropdowns (event delegation)
 * Closes all open dropdowns when clicking outside of them
 * @param {Event} event - Click event
 */
function handleGlobalClick(event) {
    // Check if click is inside a dropdown container
    const container = event.target.closest('.prism-download-container');

    // Close all dropdowns except the one being clicked (if any)
    const allDropdowns = document.querySelectorAll('.prism-dropdown-menu.show');
    allDropdowns.forEach(dropdown => {
        // If clicking outside any container, or inside a different container, close this dropdown
        if (!container || !container.contains(dropdown)) {
            dropdown.classList.remove('show');
        }
    });
}

/**
 * Create download menu for Prism toolbar
 * Called by Prism.plugins.toolbar.registerButton()
 * @param {Object} env - Prism environment object
 * @param {Function} sanitizeFilename - Function to sanitize filenames
 * @param {Function} extractTitleFromComment - Function to extract title from comments
 * @returns {HTMLElement} Download menu container
 */
export function createDownloadMenuForToolbar(env, sanitizeFilename, extractTitleFromComment) {
    const code = env.element;
    const codeText = code ? code.textContent : '';
    const language = env.language || 'text';

    const pre = env.element.parentElement;
    const rawTitle = pre?.dataset?.title ||
                     pre?.getAttribute('data-filename') ||
                     (extractTitleFromComment ? extractTitleFromComment(pre) : null) ||
                     'code';
    const title = sanitizeFilename ? sanitizeFilename(rawTitle) : rawTitle;

    // Create a container for the menu button and dropdown
    const container = document.createElement('span');
    container.className = 'prism-download-container';

    const { menuBtn, dropdown } = createDownloadMenu(codeText, title, language.toLowerCase());
    container.appendChild(menuBtn);
    container.appendChild(dropdown);

    return container;
}

/**
 * Create download menu elements
 * @param {string} codeText - The code text to download
 * @param {string} title - The filename (without extension)
 * @param {string} language - The programming language
 * @returns {Object} Object containing menuBtn and dropdown elements
 */
export function createDownloadMenu(codeText, title, language) {
    const menuBtn = document.createElement('button');
    menuBtn.className = 'prism-menu-btn';
    menuBtn.innerHTML = getMenuIconSVG();
    menuBtn.title = 'More options';
    menuBtn.setAttribute('aria-label', 'More options');

    const dropdown = document.createElement('div');
    dropdown.className = 'prism-dropdown-menu';

    const fileExtension = getFileExtension(language);

    dropdown.innerHTML = `
        <button class="prism-dropdown-item" data-action="download-native">
            ${getDownloadIconSVG()}
            Download as .${fileExtension}
        </button>
        <button class="prism-dropdown-item" data-action="download-txt">
            ${getDownloadIconSVG()}
            Download as .txt
        </button>
    `;

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.prism-dropdown-item');
        if (!item) return;

        const action = item.getAttribute('data-action');
        const ext = getFileExtension(language);

        if (action === 'download-native') {
            downloadCode(codeText, title, ext);
        } else if (action === 'download-txt') {
            downloadCode(codeText, title, 'txt');
        }

        dropdown.classList.remove('show');
    });

    // Note: Global click handler for closing dropdowns is attached once in init()
    // using event delegation pattern to prevent memory leaks

    return { menuBtn, dropdown };
}

/**
 * Get the menu icon SVG markup (three dots)
 * @returns {string} SVG markup for menu icon
 */
function getMenuIconSVG() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
    </svg>`;
}

/**
 * Get the download icon SVG markup
 * @returns {string} SVG markup for download icon
 */
function getDownloadIconSVG() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 11V14H2V11H0V14C0 15.1 0.9 16 2 16H14C15.1 16 16 15.1 16 14V11H14ZM13 7L11.59 5.59L9 8.17V0H7V8.17L4.41 5.59L3 7L8 12L13 7Z" fill="currentColor"/>
    </svg>`;
}

/**
 * Download code as file
 * @param {string} text - Code text to download
 * @param {string} filename - Filename (without extension)
 * @param {string} extension - File extension
 */
export function downloadCode(text, filename, extension) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Get file extension for language
 * @param {string} language - Programming language name
 * @returns {string} File extension
 */
export function getFileExtension(language) {
    const extensionMap = {
        javascript: 'js', typescript: 'ts', python: 'py', ruby: 'rb',
        csharp: 'cs', cpp: 'cpp', java: 'java', php: 'php', go: 'go',
        rust: 'rs', swift: 'swift', kotlin: 'kt', scala: 'scala',
        html: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less',
        json: 'json', yaml: 'yaml', yml: 'yml', xml: 'xml', toml: 'toml',
        markdown: 'md', sql: 'sql', bash: 'sh', shell: 'sh', powershell: 'ps1',
        dockerfile: 'dockerfile', makefile: 'makefile', markup: 'html',
        jsx: 'jsx', tsx: 'tsx'
    };
    return extensionMap[language] || language || 'txt';
}

// ============================================================================
// Activation Handler Functions
// ============================================================================

/**
 * Activate the download-button plugin for a code block
 * Sets up data attributes required by Prism's download-button plugin
 * @param {HTMLElement} pre - The <pre> element
 * @param {HTMLElement|null} code - The <code> element (may be null)
 * @param {Object} context - Activation context
 */
export function activate(pre, code, context) {
    if (!code) {
        console.warn('[download-button] No <code> element found, skipping activation');
        return;
    }

    // Extract language from class name for file extension
    const languageMatch = pre.className.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : 'txt';

    const extension = getFileExtension(language);
    const filename = `code.${extension}`;

    // Get the code content
    const codeContent = code.textContent;

    // Create a Blob URL with the code content
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const dataUrl = URL.createObjectURL(blob);

    // Set the required attributes for the download-button plugin
    pre.setAttribute('data-src', dataUrl);
    pre.setAttribute('data-download-link', filename);

    console.debug('[download-button] Activated with filename:', filename);
}

/**
 * Cleanup function called when the code block is removed from DOM
 * Revokes the Blob URL to free memory
 * @param {HTMLElement} pre - The <pre> element
 */
export function cleanup(pre) {
    const dataUrl = pre.getAttribute('data-src');
    if (dataUrl && dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(dataUrl);
        console.debug('[download-button] Revoked Blob URL');
    }
}
