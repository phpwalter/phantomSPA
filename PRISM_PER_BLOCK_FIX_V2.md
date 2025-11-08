# Prism.js Per-Block Configuration - Complete Fix (V2)

**Date**: 2025-11-03  
**Status**: ✅ Fixed (All Issues Resolved)  
**Issue**: Per-block Prism.js directives not rendering visual features

---

## Problem Summary

After implementing the per-block Prism.js configuration system, the classes and data attributes were correctly applied to `<pre>` elements, but the visual features (line numbers, line highlighting, toolbar buttons) were still not displaying.

---

## Root Causes Identified

### **1. Marked.js HTML Structure Mismatch**

**Problem**: Marked.js puts the `language-*` class on `<code>` instead of `<pre>`:

```html
<!-- Marked.js Output -->
<pre class="code json"><code class="language-json">...</code></pre>

<!-- Prism Expectation -->
<pre class="language-json"><code class="language-json">...</code></pre>
```

**Impact**: Prism.js plugins look for `language-*` class on `<pre>` to determine which blocks to enhance.

**Fix**: Copy `language-*` class from `<code>` to `<pre>` before highlighting.

---

### **2. Global CSS Selectors Targeting Wrong Elements**

**Problem**: CSS rules for hiding toolbar buttons were targeting elements inside `<pre>`:

```css
/* WRONG - Toolbar is NOT inside <pre> */
body.prism-no-copy pre[class*="language-"] .toolbar-item button {
    display: none !important;
}
```

**Actual Prism Structure**:
```html
<div class="code-toolbar">
    <pre class="language-json">...</pre>
    <div class="toolbar">
        <div class="toolbar-item">
            <button data-copy-state>Copy</button>
        </div>
    </div>
</div>
```

**Impact**: CSS rules couldn't find toolbar elements, so they had no effect.

**Fix**: Target `div.code-toolbar` wrapper and use class markers to exclude configured blocks.

---

### **3. Prism Skipping Already-Highlighted Code**

**Problem**: Prism.js marks code as highlighted and won't re-highlight it. When we added classes after initial rendering, Prism skipped those blocks.

**Fix**: Clear highlighting markers and manually call `Prism.highlightElement()` for each block.

---

### **4. Wrapper Classes Not Set for Per-Block Config**

**Problem**: The `div.code-toolbar` wrapper is created by Prism AFTER highlighting. We couldn't add classes to it before it existed.

**Fix**: Use `setTimeout()` to add `.prism-block-configured` class to wrappers after Prism finishes.

---

## Complete Fixes Implemented

### **Fix 1: Copy Language Class from Code to Pre**

**File**: `htdocs/src/utilities/prism-config.js` (lines 321-341)

**Function**: `applyPerBlockPrismConfig()`

```javascript
// Marked.js generates: <pre class="code <lang>"><code class="language-<lang>">
// We need to ensure the language class is on the <pre> element for Prism plugins
const codeClass = code.className;
const languageMatch = codeClass.match(/language-(\w+)/);
if (languageMatch && !pre.classList.contains(languageMatch[0])) {
    pre.classList.add(languageMatch[0]);
}
```

---

### **Fix 2: Update Code Block Detection**

**File**: `htdocs/src/utilities/prism-config.js` (lines 91-115)

**Function**: `highlightCode()`

```javascript
// Find all pre elements and check both pre and code for language class
const preElements = container.querySelectorAll('pre');
const codeBlocks = [];

preElements.forEach(pre => {
    // Check if pre has language class OR if it contains code with language class
    if (pre.className.includes('language-') || pre.querySelector('code[class*="language-"]')) {
        codeBlocks.push(pre);
        
        // Ensure language class is on <pre> element (marked.js puts it on <code>)
        const code = pre.querySelector('code[class*="language-"]');
        if (code) {
            const languageMatch = code.className.match(/language-(\w+)/);
            if (languageMatch && !pre.classList.contains(languageMatch[0])) {
                pre.classList.add(languageMatch[0]);
            }
        }
    }
});
```

---

### **Fix 3: Force Re-Highlighting**

**File**: `htdocs/src/utilities/prism-config.js` (lines 134-174)

**Function**: `highlightCode()`

```javascript
codeBlocks.forEach((pre, index) => {
    const code = pre.querySelector('code');
    if (code) {
        // Clear any existing highlighting to force re-highlight
        code.removeAttribute('data-highlighted');
        code.classList.remove('highlighted');
        
        // Manually trigger Prism highlighting for this element
        window.Prism.highlightElement(code, false);
    }
});

// After Prism runs, mark wrapper divs for per-block configured blocks
setTimeout(() => {
    codeBlocks.forEach(pre => {
        if (pre.hasAttribute('data-prism-configured')) {
            const wrapper = pre.parentElement;
            if (wrapper && wrapper.classList.contains('code-toolbar')) {
                wrapper.classList.add('prism-block-configured');
            }
        }
    });
}, 100); // Small delay to ensure Prism plugins have finished
```

---

### **Fix 4: Update CSS to Target Wrapper Divs**

**File**: `htdocs/docs/dev/css/styles.css` (lines 972-986)

**Before**:
```css
/* WRONG - Toolbar is not inside <pre> */
body.prism-no-copy pre[class*="language-"]:not([data-prism-configured]) .toolbar-item button[data-copy-state] {
    display: none !important;
}
```

**After**:
```css
/* CORRECT - Target wrapper div, exclude configured blocks */
body.prism-no-copy div.code-toolbar:not(.prism-block-configured) .toolbar-item button[data-copy-state] {
    display: none !important;
}

body.prism-no-download div.code-toolbar:not(.prism-block-configured) .toolbar-item a[download] {
    display: none !important;
}

body.prism-no-language div.code-toolbar:not(.prism-block-configured) .toolbar-item .language-label {
    display: none !important;
}
```

---

## How It Works Now

### **Step 1: Markdown Rendering**

Marked.js converts markdown to HTML:

```markdown
<!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard -->
```json
{
  "name": "test"
}
```
```

**Output**:
```html
<!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard -->
<pre class="code json"><code class="language-json">{
  "name": "test"
}</code></pre>
```

---

### **Step 2: Apply Per-Block Config**

`applyPerBlockPrismConfig()` runs:

1. Finds HTML comment with `<!-- prism: ... -->`
2. Parses directive options
3. Finds next `<pre>` element
4. Copies `language-json` class from `<code>` to `<pre>`
5. Adds `line-numbers` class to `<pre>`
6. Adds `data-line="2,4-6"` attribute to `<pre>`
7. Adds `data-prism-configured="true"` to `<pre>`
8. Removes HTML comment from DOM

**Result**:
```html
<pre class="code json line-numbers language-json" data-line="2,4-6" data-prism-configured="true">
  <code class="language-json">{
  "name": "test"
}</code></pre>
```

---

### **Step 3: Highlight Code**

`highlightCode()` runs:

1. Finds all `<pre>` elements with code
2. Ensures `language-*` class is on `<pre>`
3. Applies global config to non-configured blocks
4. Clears highlighting markers
5. Calls `Prism.highlightElement()` for each block

**Prism Plugins Run**:
- **Line Numbers Plugin**: Sees `line-numbers` class, adds `.line-numbers-rows` inside `<pre>`
- **Line Highlight Plugin**: Sees `data-line="2,4-6"`, creates `.line-highlight` elements
- **Toolbar Plugin**: Creates `div.code-toolbar` wrapper around `<pre>`
- **Copy/Download/Language Plugins**: Add buttons to toolbar

**Result**:
```html
<div class="code-toolbar">
  <pre class="code json line-numbers language-json" data-line="2,4-6" data-prism-configured="true">
    <code class="language-json">...</code>
    <span class="line-numbers-rows">
      <span></span>
      <span></span>
      <span></span>
    </span>
  </pre>
  <span class="line-highlight" data-start="2" data-end="2"></span>
  <span class="line-highlight" data-start="4" data-end="6"></span>
  <div class="toolbar">
    <div class="toolbar-item">
      <button data-copy-state>Copy</button>
    </div>
    <div class="toolbar-item">
      <a download>Download</a>
    </div>
    <div class="toolbar-item">
      <span class="language-label">JSON</span>
    </div>
  </div>
</div>
```

---

### **Step 4: Mark Configured Wrappers**

After 100ms delay:

1. Find all `<pre>` with `data-prism-configured="true"`
2. Find parent `div.code-toolbar` wrapper
3. Add `.prism-block-configured` class to wrapper

**Result**:
```html
<div class="code-toolbar prism-block-configured">
  ...
</div>
```

---

### **Step 5: CSS Applies Correctly**

**Global Settings Disabled** (`body.prism-no-copy`):

```css
/* This rule hides copy button for NON-configured blocks */
body.prism-no-copy div.code-toolbar:not(.prism-block-configured) .toolbar-item button[data-copy-state] {
    display: none !important;
}
```

**Result**:
- ✅ Configured blocks (with `.prism-block-configured`) show copy button
- ✅ Non-configured blocks hide copy button

---

## Files Modified Summary

| File | Lines | Description |
|------|-------|-------------|
| `htdocs/src/utilities/prism-config.js` | 321-341 | Copy language class from code to pre |
| `htdocs/src/utilities/prism-config.js` | 91-115 | Update code block detection |
| `htdocs/src/utilities/prism-config.js` | 134-174 | Force re-highlighting + mark wrappers |
| `htdocs/docs/dev/css/styles.css` | 972-986 | Update CSS to target wrapper divs |

---

## Testing Checklist

- ✅ Line numbers visible for per-block configured blocks
- ✅ Lines highlighted correctly (e.g., 2,4-6)
- ✅ Toolbar visible with copy/download/language buttons
- ✅ Per-block config overrides global settings
- ✅ Non-configured blocks respect global settings
- ✅ CSS correctly excludes configured blocks from global hiding
- ✅ Language class copied from code to pre
- ✅ Wrapper divs marked with `.prism-block-configured`
- ✅ Works across page navigation
- ✅ Console logging shows correct processing

---

## Summary

All issues preventing Prism.js per-block configuration from rendering visual features have been resolved:

1. ✅ **Marked.js structure mismatch** - Language class now copied to `<pre>`
2. ✅ **CSS selector issues** - Now targeting `div.code-toolbar` wrapper
3. ✅ **Prism skipping re-highlight** - Now forcing re-highlight with `highlightElement()`
4. ✅ **Wrapper class markers** - Now adding `.prism-block-configured` after Prism runs

The per-block configuration system is now fully functional! 🎉
