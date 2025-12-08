# Prism Custom Activation System

This document describes how PhantomSPA handles custom activation logic for PrismJS directives.

## Overview

Most PrismJS plugins can be activated through the declarative configuration in `prism-config.json`. However, some plugins require custom JavaScript logic (e.g., generating Blob URLs, computing values, or complex attribute manipulation).

All activation handlers are located in the **`dropins/`** directory. Each Prism plugin has a corresponding dropin file that may contain:
- **Activation logic** (`activate()` function) - Pre-processing before Prism runs
- **UI enhancement** (`afterHighlight()` hook) - Post-processing after Prism highlights
- **Documentation only** - For plugins that work automatically via CDN

## Activation API Contract

Dropins that provide activation logic must export an `activate` function:

```javascript
/**
 * @param {HTMLElement} pre - The <pre> element containing the code block
 * @param {HTMLElement|null} code - The <code> element (may be null)
 * @param {Object} context - Activation context
 * @param {Object} context.options - Parsed directive options from the HTML comment
 * @param {Set} context.appliedDirectives - Set of directive names applied to this block
 * @param {Object} context.directiveConfig - The directive's config from prism-config.json
 */
export function activate(pre, code, context) {
    // Your activation logic here
}
```

### Optional Exports

- `cleanup(pre)` - Called when the code block is removed from DOM (for resource cleanup)
- `getState(pre)` - Returns the current state for a given element

## Adding Activation to a Dropin

### Step 1: Add Activation Functions to Your Dropin

Add the `activate` (and optionally `cleanup`) functions to your existing dropin:

```javascript
/**
 * My Feature Drop-in
 * @module dropins/my-feature
 */

// ============================================================================
// DROPIN LIFECYCLE HOOKS (UI Enhancement)
// ============================================================================

export async function init(context) {
    // Initialization logic
}

export function afterHighlight(context) {
    // Post-processing after Prism highlights
}

// ============================================================================
// ACTIVATION HANDLER FUNCTIONS
// ============================================================================

export function activate(pre, code, context) {
    // Pre-processing before Prism runs
    // Set attributes, generate URLs, etc.
}

export function cleanup(pre) {
    // Resource cleanup when element is removed
}
```

### Step 2: Register in prism-config.json

Add the `customActivation` field pointing to your dropin name (without `.js`):

```json
{
    "directives": {
        "my-feature": {
            "description": "My custom feature",
            "activation": {
                "target": "pre",
                "setAttribute": { "data-my-feature": "true" }
            },
            "customActivation": "my-feature"
        }
    }
}
```

## Existing Activation Handlers

| Dropin File              | Directive       | Purpose                                           |
|--------------------------|-----------------|---------------------------------------------------|
| `download-button.js`     | download-button | Generates Blob URL and filename for code download |
| `treeview.js`            | treeview        | Manages icon display modes (none/native/custom)   |

> **Note:** The treeview activation handler (`treeview.js`) is separate from `tree-icons.js` because they serve different purposes:
> - `treeview.js` (activation): Sets the `data-treeview-icons` attribute based on flags (-n, -c)
> - `tree-icons.js` (UI enhancement): Renders custom file type icons after Prism highlights

## Best Practices

1. **Keep activation focused** - Activation should only set up attributes/state needed before Prism runs
2. **Use context.options** - Access parsed directive options (e.g., flags like `-n`, `-c`)
3. **Implement cleanup** - If you create resources (Blob URLs, event listeners), clean them up
4. **Log with debug level** - Use `console.debug()` for activation messages
5. **Handle missing elements** - Always check if `code` is null before using it
6. **One dropin per Prism plugin** - Maintain 1-to-1 mapping for discoverability

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    prism-config.json                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ "download-button": { "customActivation": "download-button" } ││
│  │ "treeview": { "customActivation": "treeview" }              ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────│───────────────────────────────────┐
│                    prism-config.js                              │
│  ┌──────────────────────────│──────────────────────────────────┐│
│  │ applyDirectiveOptions() {│                                  ││
│  │     // Load from dropins/ directory                         ││
│  │     handler = await import(`./dropins/${name}.js`);         ││
│  │     // Execute activation                                   ││
│  │     handler.activate(pre, code, context);                   ││
│  │ }                                                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        dropins/                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐         │
│  │  download-button.js    │  │  treeview.js           │         │
│  │  ├─ init()             │  │  ├─ activate()         │         │
│  │  ├─ afterHighlight()   │  │  └─ getIconMode()      │         │
│  │  ├─ activate()         │  └────────────────────────┘         │
│  │  └─ cleanup()          │                                     │
│  └────────────────────────┘  ┌────────────────────────┐         │
│  ┌────────────────────────┐  │  tree-icons.js         │         │
│  │  toolbar.js            │  │  ├─ init()             │         │
│  │  ├─ init()             │  │  └─ afterHighlight()   │         │
│  │  └─ afterHighlight()   │  └────────────────────────┘         │
│  └────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Dropin Types

| Type | Has activate() | Has afterHighlight() | Example |
|------|----------------|---------------------|---------|
| Activation + UI | ✓ | ✓ | `download-button.js` |
| Activation only | ✓ | ✗ | `treeview.js` |
| UI enhancement only | ✗ | ✓ | `tree-icons.js`, `toolbar.js` |
| Documentation only | ✗ | ✗ | `line-numbers.js`, `highlight.js` |
