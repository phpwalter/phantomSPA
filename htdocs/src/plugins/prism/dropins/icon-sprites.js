/**
 * Icon Sprites Drop-in
 *
 * Loads icon sprite CSS files defined in the iconSprites section of prism-config.json.
 * This drop-in runs during the init phase to ensure CSS is available before highlighting.
 *
 * @module dropins/icon-sprites
 */

import { loadStylesheet } from '../prism-utils.js';

/**
 * Initialize the icon sprites drop-in
 * Loads all icon sprite CSS files from config
 *
 * @param {Object} context - Initialization context
 * @param {Object} context.directiveConfig - The full prism-config.json
 * @returns {Promise<Object>} API object for this drop-in
 */
export async function init(context) {
    const { directiveConfig } = context;
    const iconSprites = directiveConfig.iconSprites || {};
    const loadedSprites = [];

    console.group('[icon-sprites] Loading icon sprite CSS files...');

    for (const [spriteName, spriteConfig] of Object.entries(iconSprites)) {
        // Skip $comment fields
        if (spriteName.startsWith('$')) continue;

        if (spriteConfig.cssPath && spriteConfig.linkId) {
            try {
                // Add cache-busting parameter
                const cssUrl = spriteConfig.cssPath + '?v=' + Date.now();
                await loadStylesheet(cssUrl, spriteConfig.linkId);
                loadedSprites.push(spriteName);
                console.log(`[icon-sprites] ✓ Loaded: ${spriteName}`);
            } catch (err) {
                console.error(`[icon-sprites] ✗ Failed to load ${spriteName}:`, err);
            }
        }
    }

    console.log(`[icon-sprites] Loaded ${loadedSprites.length} sprite(s)`);
    console.groupEnd();

    // Return API for other drop-ins to use
    return {
        getLoadedSprites: () => [...loadedSprites],
        getSpriteConfig: (name) => iconSprites[name] || null
    };
}

/**
 * Get icon class for a programming language
 * @param {string} language - Language name
 * @param {Object} directiveConfig - Config from prism-config.json
 * @returns {Object} Object with iconClass, baseClass, sizeClass
 */
export function getLanguageIconClass(language, directiveConfig) {
    const spriteConfig = directiveConfig.iconSprites?.['prog-lang-icons'] || {};

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
 * Get icon class for a file based on extension
 * @param {string} filename - Filename to analyze
 * @param {Object} directiveConfig - Config from prism-config.json
 * @returns {string} CSS class for the icon (without size suffix)
 */
export function getFileIconClass(filename, directiveConfig) {
    const spriteConfig = directiveConfig.iconSprites?.['file-type-icons'] || {};

    const prefix = spriteConfig.iconClassPrefix || 'lang-icon';
    const directoryNames = spriteConfig.directoryNames || [];
    const extensionMap = spriteConfig.extensionMap || {};

    const cleanName = filename.replace(/\/$/, '');

    // Check if it's a directory
    if (filename.endsWith('/') ||
        (!cleanName.includes('.') && directoryNames.includes(cleanName.toLowerCase()))) {
        return `${prefix}-folder`;
    }

    const extension = cleanName.split('.').pop()?.toLowerCase();
    const iconName = extensionMap[extension];

    if (iconName) {
        return `${prefix}-${iconName}`;
    }

    // Default to generic file icon
    return `${prefix}-generic`;
}
