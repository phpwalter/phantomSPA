/**
 * Treeview Dropin
 *
 * PhantomSPA dropin for the Prism treeview plugin.
 * This dropin manages the icon display modes for treeview code blocks.
 *
 * PRISM PLUGIN: treeview
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/treeview/prism-treeview.min.js
 *
 * PHANTOMSPA CUSTOMIZATION:
 * PhantomSPA extends the standard treeview plugin with three icon modes:
 * - "none" (default): No icons displayed, text-only tree structure
 * - "native" (-n flag): Use Prism's built-in file type icons
 * - "custom" (-c flag): Use PhantomSPA's custom icon sprite system
 *
 * The icon mode is controlled via the `data-treeview-icons` attribute on the <pre> element.
 *
 * RELATED FILES:
 * - dropins/tree-icons.js: Handles custom icon rendering after Prism highlights
 * - dropins/icon-sprites.js: Provides icon class mappings for custom icons
 *
 * @module dropins/treeview
 */

/**
 * Activate the treeview plugin with appropriate icon mode
 * Called by prism-config.js when processing customActivation
 *
 * @param {HTMLElement} pre - The <pre> element
 * @param {HTMLElement|null} code - The <code> element (may be null)
 * @param {Object} context - Activation context
 * @param {Object} context.options - Parsed directive options
 * @param {Object} context.options._flags - Flags keyed by directive name
 * @param {Set} context.appliedDirectives - Set of directive names that have been applied
 * @param {Object} context.directiveConfig - The directive configuration from prism-config.json
 */
export function activate(pre, code, context) {
    const { options } = context;

    // Get flags for treeview directive
    const treeviewFlags = options._flags?.treeview || [];

    // Determine which icon mode to use based on flags
    // Priority: -c (custom) > -n (native) > none (default)
    let iconMode = 'none';

    // Check for flags - last one wins if multiple specified
    for (const flagInfo of treeviewFlags) {
        if (flagInfo.overrideAttribute) {
            // Use the overrideAttribute from the flag config
            const attrValue = flagInfo.overrideAttribute['data-treeview-icons'];
            if (attrValue) {
                iconMode = attrValue;
            }
        }
    }

    // Set the icon mode attribute
    // Note: The base activation from prism-config.json sets this to 'none' by default
    // This handler overrides it if a flag was specified
    pre.setAttribute('data-treeview-icons', iconMode);

    console.debug('[treeview] Activated with icon mode:', iconMode);
}

/**
 * Get the current icon mode for a treeview block
 * @param {HTMLElement} pre - The <pre> element
 * @returns {string} The icon mode: 'none', 'native', or 'custom'
 */
export function getIconMode(pre) {
    return pre.getAttribute('data-treeview-icons') || 'none';
}

