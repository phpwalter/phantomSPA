/**
 * Prism.js Configuration Manager
 *
 * This is a facade module that re-exports from focused sub-modules:
 * - prism-config-storage.js: Config loading, saving, localStorage
 * - prism-config-ui.js: Settings panel UI creation
 * - prism-directive-parser.js: Directive parsing and application
 *
 * This maintains backward compatibility while improving code organization.
 */

// Re-export storage functions
export {
    getDirectiveConfig,
    getStorageKey,
    getDefaultConfig,
    initPrismConfigFromJson,
    loadPrismConfig,
    savePrismConfig,
    resetPrismConfig,
    applyPrismConfig,
    highlightCode
} from './prism-config-storage.js';

// Re-export UI functions
export {
    createPrismSettingsPanel,
    createPrismSettingsButton
} from './prism-config-ui.js';

// Re-export directive parser functions
export {
    applyPerBlockPrismConfig
} from './prism-directive-parser.js';
