/**
 * Line Highlight Dropin (Documentation Only)
 *
 * PhantomSPA dropin for the Prism line-highlight plugin.
 * This file exists for documentation and discoverability purposes only.
 *
 * PRISM PLUGIN: line-highlight
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/line-highlight/prism-line-highlight.min.js
 * CSS: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/line-highlight/prism-line-highlight.min.css
 *
 * PHANTOMSPA STATUS: CDN PASSTHROUGH (no custom implementation)
 * The CDN plugin works automatically without any PhantomSPA customization.
 * This dropin is NOT loaded by the controller - it exists only for reference.
 *
 * ACTIVATION:
 * The line-highlight plugin is activated by adding `data-line` attribute to the <pre> element.
 * PhantomSPA handles this via the `highlight` directive in prism-config.json:
 *
 * ```json
 * "highlight": {
 *     "description": "Highlight specific lines",
 *     "activation": {
 *         "target": "pre",
 *         "setAttribute": { "data-line": "{value}" }
 *     },
 *     "requiresValue": true
 * }
 * ```
 *
 * USAGE IN MARKDOWN:
 * ```markdown
 * <!-- prism: highlight=1,3-5 -->
 * ```javascript
 * const a = 1;  // Line 1 highlighted
 * const b = 2;
 * const c = 3;  // Lines 3-5 highlighted
 * const d = 4;
 * const e = 5;
 * ```
 * ```
 *
 * LINE SPECIFICATION:
 * - Single line: `highlight=5`
 * - Multiple lines: `highlight=1,3,5`
 * - Range: `highlight=1-5`
 * - Combined: `highlight=1,3-5,10`
 *
 * @module dropins/highlight
 * @see https://prismjs.com/plugins/line-highlight/
 */

// This file contains no executable code.
// It exists solely for documentation and 1-to-1 mapping with Prism plugins.

