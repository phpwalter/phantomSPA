/**
 * Show Language Dropin
 *
 * PhantomSPA dropin for the Prism show-language plugin.
 * Provides language label display with PhantomSPA enhancements.
 *
 * PRISM PLUGIN: show-language
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/show-language/prism-show-language.min.js
 *
 * PHANTOMSPA STATUS: DEPRECATED (PhantomSPA provides custom implementation)
 * The CDN plugin is NOT used. PhantomSPA provides its own language label with:
 * - Language icon from icon-sprites.js
 * - Optional filename/title display
 * - Material Design styling
 *
 * IMPLEMENTATION:
 * The language label is created by toolbar.js and registered with Prism's
 * toolbar plugin as 'phantomspa-language'. This dropin exists for documentation
 * and to provide the createLanguageLabel function for standalone use.
 *
 * USAGE IN MARKDOWN:
 * ```markdown
 * <!-- prism: show-language -->
 * ```javascript
 * const x = 1;
 * ```
 * ```
 *
 * With custom title:
 * ```markdown
 * <!-- prism: show-language, title=myfile.js -->
 * ```javascript
 * const x = 1;
 * ```
 * ```
 *
 * @module dropins/show-language
 * @see https://prismjs.com/plugins/show-language/
 */

import { getLanguageIconClass } from './icon-sprites.js';

let directiveConfig = {};

/**
 * Initialize the show-language drop-in
 * @param {Object} context - Initialization context
 */
export async function init(context) {
    directiveConfig = context.directiveConfig;
    console.log('[show-language] Initialized');
    return {
        createLanguageLabel
    };
}

/**
 * Create a language label element
 * @param {string} language - The programming language
 * @param {string} [title] - Optional title/filename to display
 * @returns {HTMLElement} Language label element
 */
export function createLanguageLabel(language, title = '') {
    const displayLanguage = language.toUpperCase();

    const label = document.createElement('span');
    label.className = 'prism-language-label';

    // Add language icon
    const { iconClass, baseClass, sizeClass } = getLanguageIconClass(language.toLowerCase(), directiveConfig);
    const icon = document.createElement('span');
    icon.className = `${baseClass} ${sizeClass} ${iconClass}`;
    label.appendChild(icon);

    // Add label text
    const labelText = title ? `${displayLanguage} • ${title}` : displayLanguage;
    label.appendChild(document.createTextNode(' ' + labelText));

    return label;
}

/**
 * Get display name for a language
 * Some languages have special display names
 * @param {string} language - Language identifier
 * @returns {string} Display name
 */
export function getLanguageDisplayName(language) {
    const displayNames = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'py': 'Python',
        'rb': 'Ruby',
        'cs': 'C#',
        'cpp': 'C++',
        'jsx': 'JSX',
        'tsx': 'TSX',
        'yml': 'YAML',
        'md': 'Markdown',
        'sh': 'Shell',
        'ps1': 'PowerShell'
    };
    return displayNames[language] || language.toUpperCase();
}

