/**
 * Command Line Dropin (Documentation Only)
 *
 * PhantomSPA dropin for the Prism command-line plugin.
 * This file exists for documentation and discoverability purposes only.
 *
 * PRISM PLUGIN: command-line
 * CDN: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/command-line/prism-command-line.min.js
 * CSS: https://cdnjs.cloudflare.com/ajax/libs/prism/{version}/plugins/command-line/prism-command-line.min.css
 *
 * PHANTOMSPA STATUS: CDN PASSTHROUGH (no custom implementation)
 * The CDN plugin works automatically without any PhantomSPA customization.
 * This dropin is NOT loaded by the controller - it exists only for reference.
 *
 * ACTIVATION:
 * The command-line plugin is activated by adding the `command-line` class to the <pre> element.
 * PhantomSPA handles this via the `command-line` directive in prism-config.json:
 *
 * ```json
 * "command-line": {
 *     "description": "Display as terminal/command prompt",
 *     "activation": {
 *         "target": "pre",
 *         "addClass": "command-line",
 *         "setAttribute": {
 *             "data-user": "user",
 *             "data-host": "localhost"
 *         }
 *     }
 * }
 * ```
 *
 * USAGE IN MARKDOWN:
 * ```markdown
 * <!-- prism: command-line -->
 * ```bash
 * npm install prismjs
 * npm run build
 * ```
 * ```
 *
 * CUSTOMIZATION:
 * The command-line plugin supports several data attributes:
 * - `data-user`: Username shown in prompt (default: "user")
 * - `data-host`: Hostname shown in prompt (default: "localhost")
 * - `data-prompt`: Custom prompt string (overrides user@host)
 * - `data-output`: Lines that are output (not commands), e.g., "2-4,6"
 * - `data-filter-output`: Prefix for output lines to filter
 *
 * @module dropins/command-line
 * @see https://prismjs.com/plugins/command-line/
 */

// This file contains no executable code.
// It exists solely for documentation and 1-to-1 mapping with Prism plugins.

