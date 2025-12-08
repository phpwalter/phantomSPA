/**
 * Tree Icons Drop-in
 *
 * Adds file type icons to treeview code blocks.
 * This dropin handles UI enhancement only - adding file type icons to tree
 * structures after Prism highlights.
 *
 * Note: Treeview activation logic (managing icon display modes via
 * data-treeview-icons attribute) is handled separately by
 * dropins/treeview.js (customActivation handler)
 *
 * @module dropins/tree-icons
 */

import { getFileIconClass } from './icon-sprites.js';

let dropinConfig = {};
let directiveConfig = {};

/**
 * Initialize the tree icons drop-in
 * @param {Object} context - Initialization context
 */
export async function init(context) {
    dropinConfig = context.config || {};
    directiveConfig = context.directiveConfig;

    console.log('[tree-icons] Initialized with config:', dropinConfig);

    return {
        addIcons: (container) => addTreeFileIcons(container)
    };
}

/**
 * afterHighlight hook - called after Prism highlights code
 * @param {Object} context - Hook context
 * @param {HTMLElement} context.container - Container that was highlighted
 */
export function afterHighlight(context) {
    const { container } = context;
    if (container) {
        addTreeFileIcons(container);
    }
}

/**
 * Add file type icons to tree code blocks
 * @param {HTMLElement} container - Container element
 */
function addTreeFileIcons(container) {
    // Find all tree code blocks with custom icon mode
    // Only process blocks with data-treeview-icons="custom"
    const treeBlocks = container.querySelectorAll(
        'pre[data-treeview-icons="custom"][class*="language-treeview"], ' +
        'pre[data-treeview-icons="custom"].language-tree, ' +
        'pre[data-treeview-icons="custom"][class*="language-tree"]'
    );

    console.log(`[tree-icons] Found ${treeBlocks.length} tree blocks with custom icons`);

    treeBlocks.forEach((pre, blockIndex) => {
        const code = pre.querySelector('code');
        if (!code) return;

        // Skip if already processed
        if (code.dataset.treeIconsProcessed) return;
        code.dataset.treeIconsProcessed = 'true';

        console.log(`[tree-icons] Processing tree block ${blockIndex} (custom icons)...`);

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

            // Determine file type and icon class
            const iconClass = getFileIconClass(cleanText, directiveConfig);

            // Create icon HTML
            const iconHtml = `<span class="tree-file-icon ${iconClass}" aria-hidden="true"></span>`;

            // Insert icon after tree characters but before filename
            const newLine = treeChars + iconHtml + restOfLine + closingTags;

            console.debug(`[tree-icons] Line ${index}: "${cleanText}" -> ${iconClass}`);
            return newLine;
        });

        // Update the code block with processed content
        code.innerHTML = processedLines.join('\n');

        console.log(`[tree-icons] Completed processing tree block ${blockIndex}`);
    });
}
