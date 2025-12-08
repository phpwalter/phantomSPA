/**
 * Line Numbers Dropin (Documentation Only)
 *
 * PhantomSPA dropin for the Prism line-numbers plugin.
 * This file exists for documentation and discoverability purposes only.
 *
 * PRISM PLUGIN: line-numbers
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/line-numbers/prism-line-numbers.min.js
 * CSS: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/line-numbers/prism-line-numbers.min.css
 *
 * PHANTOMSPA STATUS: CDN PASSTHROUGH (no custom implementation)
 * The CDN plugin works automatically without any PhantomSPA customization.
 * This dropin is NOT loaded by the controller - it exists only for reference.
 *
 * ACTIVATION:
 * The line-numbers plugin is activated by adding the `line-numbers` class to the <pre> element.
 * PhantomSPA handles this via the `line-numbers` directive in prism-config.json:
 *
 * ```json
 * "line-numbers": {
 *     "description": "Show line numbers",
 *     "activation": {
 *         "target": "pre",
 *         "addClass": "line-numbers"
 *     }
 * }
 * ```
 *
 * USAGE IN MARKDOWN:
 * ```markdown
 * <!-- prism: line-numbers -->
 * ```javascript
 * const x = 1;
 * const y = 2;
 * ```
 * ```
 *
 * GLOBAL TOGGLE:
 * Line numbers can be enabled globally via body class:
 * - Add `line-numbers` class to <body> to enable for all code blocks
 * - Controlled via PhantomSPA settings panel
 *
 * @module dropins/line-numbers
 * @see https://prismjs.com/plugins/line-numbers/
 */

// This file contains no executable code.
// It exists solely for documentation and 1-to-1 mapping with Prism plugins.

