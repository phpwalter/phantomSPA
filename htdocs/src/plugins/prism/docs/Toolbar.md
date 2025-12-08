# PhantomSPA Prism Toolbar: Hybrid Approach Architecture

## 1. Architecture Overview

### The Hybrid Approach

PhantomSPA uses a **hybrid approach** that combines:
- **Prism's official `toolbar` plugin** (from CDN) as the container/framework
- **PhantomSPA's custom button implementations** registered via the official API

```javascript
/**
 * This dropin uses a HYBRID APPROACH that balances official Prism infrastructure
 * with PhantomSPA's custom UI/UX requirements:
 *
 * 1. USES Prism's official `toolbar` plugin as the container/framework
 * 2. REGISTERS custom buttons via `Prism.plugins.toolbar.registerButton()` API
 * 3. MAINTAINS full UI control over button appearance and behavior
 */
```

### Why Hybrid?
- **Automatic compatibility**: Toolbar container updates with Prism CDN version changes
- **Full UI control**: PhantomSPA maintains button implementations for Material Design consistency
- **No reimplementation**: Uses official Prism infrastructure instead of duplicating it

### Component Roles

| Component               | Role                                                                          |
|-------------------------|-------------------------------------------------------------------------------|
| **CDN Plugins**         | Official Prism plugins loaded from CDN (toolbar, line-numbers, etc.)          |
| **Activation Handlers** | Pre-processors that prepare DOM attributes BEFORE Prism runs                  |
| **Dropins**             | Post-processors that enhance/replace CDN plugin output AFTER Prism highlights |

### Modular Architecture

The toolbar functionality is split across dedicated modules for separation of concerns:

| Module                      | Responsibility                                                    |
|-----------------------------|-------------------------------------------------------------------|
| `custom-headers.js`         | Orchestrator: registers buttons, creates header structure, layout |
| `copy-to-clipboard.js`      | Copy button implementation with clipboard API and fallback        |
| `download.js`               | Download menu with multiple format options                        |
| `icon-sprites.js`           | Language icon handling and sprite management                      |

---

## 2. DOM Structure

### How Prism Creates the Toolbar

When Prism's `toolbar` plugin runs, it:
1. Wraps the `<pre>` element in a `<div class="code-toolbar">`
2. Creates a `<div class="toolbar">` container
3. **APPENDS** the toolbar AFTER the `<pre>` element

**DOM Structure (before CSS reordering):**
```html
<div class="code-toolbar">
    <pre class="language-javascript">...</pre>  <!-- First in DOM -->
    <div class="toolbar">                        <!-- Second in DOM (AFTER pre) -->
        <div class="toolbar-item">...</div>
        <div class="toolbar-item">...</div>
    </div>
</div>
```

### Visual Repositioning with CSS

Since the toolbar is appended AFTER the `<pre>` in the DOM, we use CSS `order` property to visually reposition it:

```css
div.code-toolbar {
    display: flex !important;
    flex-direction: column !important;
}

div.code-toolbar > .toolbar {
    order: -1 !important;  /* Toolbar appears FIRST visually */
}

div.code-toolbar > pre[class*="language-"] {
    order: 1 !important;   /* Code appears SECOND visually */
}
```

---

## 3. Button Registration

### The `registerToolbarButtons()` Function

PhantomSPA registers custom buttons during initialization using Prism's official API:

```javascript
function registerToolbarButtons() {
    if (!isToolbarAvailable()) {
        console.warn('[custom-headers] Prism toolbar plugin not available, will use fallback headers');
        return;
    }

    // Register language label with icon
    Prism.plugins.toolbar.registerButton('phantomspa-language', createLanguageLabelButton);

    // Register copy button
    Prism.plugins.toolbar.registerButton('phantomspa-copy', createCopyButtonForToolbar);

    // Register download menu
    Prism.plugins.toolbar.registerButton('phantomspa-download', createDownloadMenuForToolbar);
}
```

### Fallback Mechanism

If the toolbar plugin is not available, the dropin creates standalone headers:

```javascript
export function afterHighlight(context) {
    if (isToolbarAvailable() && buttonsRegistered) {
        enhanceToolbarStyling(container);  // Use Prism toolbar
    } else {
        addCustomHeaders(container);        // Fallback: create standalone headers
    }
}
```

---

## 4. CSS Styling Strategy

### Hiding Default Prism Buttons

All toolbar items are hidden by default, then only PhantomSPA buttons are shown:

```css
/* Hide ALL toolbar items by default */
div.code-toolbar > .toolbar > .toolbar-item {
    display: none !important;
}

/* Show ONLY PhantomSPA registered buttons */
div.code-toolbar > .toolbar > .toolbar-item:has(.prism-language-label),
div.code-toolbar > .toolbar > .toolbar-item:has(.prism-copy-btn),
div.code-toolbar > .toolbar > .toolbar-item:has(.prism-download-container) {
    display: inline-flex !important;
}
```

### Button Layout (Left/Right Positioning)

The language label uses `margin-right: auto` to push action buttons to the right:

```css
/* Language label - push action buttons to the right */
div.code-toolbar > .toolbar > .toolbar-item:has(.prism-language-label) {
    margin: 0 auto 0 0 !important;  /* margin-right: auto */
}

/* Copy button - small gap before download */
div.code-toolbar > .toolbar > .toolbar-item:has(.prism-copy-btn) {
    margin: 0 0.5rem 0 0 !important;
}
```

---

## 5. Configuration

The `toolbar` plugin must be enabled in `app-config.json`:

```json
"plugins": [
  {
    "name": "toolbar",
    "jsPath": "/plugins/toolbar/prism-toolbar.min.js",
    "cssPath": "/plugins/toolbar/prism-toolbar.min.css",
    "dependencies": []
  }
]
```

---

## Visual Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HYBRID APPROACH (Modular Architecture)           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────────────────────────┐   │
│  │  Prism CDN      │     │  PhantomSPA Dropins                 │   │
│  │  toolbar plugin │────▶│  ┌─────────────────────────────┐    │   │
│  │  (container)    │     │  │ custom-headers.js           │    │   │
│  └─────────────────┘     │  │ (orchestrator)              │    │   │
│                          │  └──────────┬──────────────────┘    │   │
│                          │             │ imports               │   │
│                          │  ┌──────────┴──────────────────┐    │   │
│                          │  │                             │    │   │
│                          │  ▼                             ▼    │   │
│                          │  ┌─────────────┐ ┌─────────────┐    │   │
│                          │  │ copy-to-    │ │ download.js │    │   │
│                          │  │ clipboard.js│ │             │    │   │
│                          │  └─────────────┘ └─────────────┘    │   │
│                          └─────────────────────────────────────┘   │
│                                         │                           │
│                                         ▼                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Prism.plugins.toolbar.registerButton() API                 │   │
│  │  - phantomspa-language (label + icon)                       │   │
│  │  - phantomspa-copy (copy + checkmark feedback)              │   │
│  │  - phantomspa-download (menu + formats)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                         │                           │
│                                         ▼                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CSS Styling (prism-syntax-highlighter.css)                 │   │
│  │  - order: -1 (toolbar above code)                           │   │
│  │  - Hide default buttons, show PhantomSPA buttons            │   │
│  │  - margin-right: auto (left/right layout)                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `dropins/custom-headers.js` | Toolbar orchestrator - registers buttons, creates header structure |
| `dropins/copy-to-clipboard.js` | Copy button with clipboard API and fallback |
| `dropins/download.js` | Download menu with multiple format options |
| `dropins/icon-sprites.js` | Language icon handling |
| `prism-syntax-highlighter.css` | Toolbar styling and positioning |
| `prism-config.json` | Plugin configuration |
