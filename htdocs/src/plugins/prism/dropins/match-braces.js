/**
 * Match Braces Dropin (Documentation Only)
 *
 * PhantomSPA dropin for the Prism match-braces plugin.
 * This file exists for documentation and discoverability purposes only.
 *
 * PRISM PLUGIN: match-braces
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/match-braces/prism-match-braces.min.js
 * CSS: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/match-braces/prism-match-braces.min.css
 *
 * PHANTOMSPA STATUS: CDN PASSTHROUGH (no custom implementation)
 * The CDN plugin works automatically without any PhantomSPA customization.
 * This dropin is NOT loaded by the controller - it exists only for reference.
 *
 * ACTIVATION:
 * The match-braces plugin is activated by adding the `match-braces` class to the <pre> element.
 * PhantomSPA handles this via the `match-braces` directive in prism-config.json:
 *
 * ```json
 * "match-braces": {
 *     "description": "Highlight matching braces on hover/click",
 *     "activation": {
 *         "target": "pre",
 *         "addClass": "match-braces"
 *     }
 * }
 * ```
 *
 * USAGE IN MARKDOWN:
 * ```markdown
 * <!-- prism: match-braces -->
 * ```javascript
 * function example() {
 *     if (true) {
 *         console.log("nested braces");
 *     }
 * }
 * ```
 * ```
 *
 * BEHAVIOR:
 * - Hover over a brace to highlight its matching pair
 * - Click a brace to keep the highlight active
 * - Works with (), [], and {}
 *
 * @module dropins/match-braces
 * @see https://prismjs.com/plugins/match-braces/
 */

// This file contains no executable code.
// It exists solely for documentation and 1-to-1 mapping with Prism plugins.

