# Prism.js Per-Block Configuration - Bug Fix

**Date**: 2025-11-03  
**Status**: ✅ Fixed  
**Issue**: Per-block Prism.js directives not rendering visual features

---

## Problem Description

After implementing the per-block Prism.js configuration system using HTML comment directives, the classes and data attributes were correctly applied to `<pre>` elements, but the visual features (line numbers, line highlighting, toolbar buttons) were not displaying.

### **Symptoms**

- ✅ HTML comment directives were parsed correctly
- ✅ Classes and data attributes were added to `<pre>` elements
- ✅ `data-prism-configured="true"` was set
- ❌ Line numbers not visible
- ❌ Lines not highlighted
- ❌ Toolbar buttons (copy, download, language) not showing
- ❌ Toolbar itself not visible

### **Example**

**Markdown**:
```markdown
<!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard download-button show-language -->
```json
{
  "name": "test",
  "version": "1.0.0"
}
```
```

**Generated HTML** (after directive processing):
```html
<pre class="code json line-numbers language-json" 
     data-line="2,4-6" 
     data-prism-configured="true" 
     data-prism-copy="true" 
     data-prism-download="true" 
     data-prism-language="true">
  <code class="language-json">...</code>
</pre>
```

**Expected**: Line numbers, highlighted lines, toolbar with buttons  
**Actual**: Plain code block with syntax highlighting only

---

## Root Causes Identified

### **1. Global CSS Body Classes Overriding Per-Block Config**

**Problem**: The global configuration UI uses body classes like `body.prism-no-line-numbers` to hide features globally. These CSS rules were applying to ALL code blocks, including those with per-block configuration.

**Original CSS**:
```css
body.prism-no-line-numbers .line-numbers-rows {
    display: none !important;
}
```

**Issue**: This rule hides line numbers for ALL blocks when the global setting is disabled, even if a specific block has `class="line-numbers"` and `data-prism-configured="true"`.

**Fix**: Updated CSS to exclude blocks with `data-prism-configured="true"`:
```css
body.prism-no-line-numbers pre[class*="language-"]:not([data-prism-configured]) .line-numbers-rows {
    display: none !important;
}
```

**Files Modified**: `htdocs/docs/dev/css/styles.css` (lines 954-990)

---

### **2. Marked.js HTML Structure Mismatch**

**Problem**: Marked.js (the markdown parser) generates a different HTML structure than expected:

**Marked.js Output**:
```html
<pre class="code json"><code class="language-json">...</code></pre>
```

**Expected by Prism**:
```html
<pre class="language-json"><code class="language-json">...</code></pre>
```

**Key Difference**: Marked.js puts the `language-*` class on the `<code>` element, not the `<pre>` element. However, Prism.js plugins (line-numbers, line-highlight, toolbar) look for the `language-*` class on the `<pre>` element to determine which blocks to enhance.

**Fix**: 
1. Updated `applyPerBlockPrismConfig()` to copy the `language-*` class from `<code>` to `<pre>`
2. Updated `highlightCode()` to find code blocks by checking both `<pre>` and `<code>` elements
3. Ensured language class is always on `<pre>` before Prism runs

**Files Modified**: `htdocs/src/utilities/prism-config.js` (lines 321-341, 91-115)

---

## Fixes Implemented

### **Fix 1: Update CSS to Exclude Per-Block Configured Elements**

**File**: `htdocs/docs/dev/css/styles.css`

**Changes**:
```css
/* OLD - Applied to ALL blocks */
body.prism-no-line-numbers .line-numbers-rows {
    display: none !important;
}

/* NEW - Excludes per-block configured blocks */
body.prism-no-line-numbers pre[class*="language-"]:not([data-prism-configured]) .line-numbers-rows {
    display: none !important;
}
```

**Applied to all 8 feature toggle rules**:
- `prism-no-highlighting`
- `prism-no-line-numbers`
- `prism-no-copy`
- `prism-no-download`
- `prism-no-language`
- `prism-no-line-highlight`
- `prism-no-command-line`

**Result**: Global CSS rules now only apply to blocks WITHOUT `data-prism-configured="true"`, allowing per-block directives to override global settings.

---

### **Fix 2: Copy Language Class from Code to Pre Element**

**File**: `htdocs/src/utilities/prism-config.js`

**Function**: `applyPerBlockPrismConfig()`

**Changes**:
```javascript
// OLD - Only checked for code element
const code = pre.querySelector('code[class*="language-"]');
if (!code) {
    console.warn('[prism-config] Prism directive found but next <pre> has no <code class="language-*">:', text);
    return;
}

// NEW - Copy language class from code to pre
const code = pre.querySelector('code');
if (!code) {
    console.warn('[prism-config] Prism directive found but next <pre> has no <code>:', text);
    return;
}

// Marked.js generates: <pre class="code <lang>"><code class="language-<lang>">
// We need to ensure the language class is on the <pre> element for Prism plugins
const codeClass = code.className;
const languageMatch = codeClass.match(/language-(\w+)/);
if (languageMatch && !pre.classList.contains(languageMatch[0])) {
    pre.classList.add(languageMatch[0]);
}
```

**Result**: The `language-json` class is now copied from `<code>` to `<pre>`, making the block detectable by Prism plugins.

---

### **Fix 3: Update Code Block Detection in highlightCode()**

**File**: `htdocs/src/utilities/prism-config.js`

**Function**: `highlightCode()`

**Changes**:
```javascript
// OLD - Only found pre elements with language class
const codeBlocks = container.querySelectorAll('pre[class*="language-"]');

// NEW - Find all pre elements and check both pre and code for language class
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

**Result**: All code blocks are now found, regardless of whether the language class is on `<pre>` or `<code>`, and the language class is ensured to be on `<pre>` before Prism runs.

---

## Testing Results

### **Test 1: Line Numbers + Line Highlight**

**Directive**: `<!-- prism: line-numbers highlight=2,4-6 -->`

**Result**:
- ✅ Line numbers visible in gutter
- ✅ Lines 2, 4, 5, 6 highlighted with accent color
- ✅ Syntax highlighting applied
- ✅ Works even when global line numbers setting is disabled

---

### **Test 2: Full Toolbar Features**

**Directive**: `<!-- prism: line-numbers copy-to-clipboard download-button show-language -->`

**Result**:
- ✅ Line numbers visible
- ✅ Copy button in toolbar
- ✅ Download button in toolbar
- ✅ Language label "JSON" in toolbar
- ✅ Toolbar visible and functional

---

### **Test 3: Global Override**

**Setup**: Global settings have line numbers disabled (`body.prism-no-line-numbers`)

**Directive**: `<!-- prism: line-numbers -->`

**Result**:
- ✅ Line numbers STILL visible (per-block directive overrides global setting)
- ✅ Other blocks without directives correctly have no line numbers

---

## Technical Details

### **Prism.js Plugin Architecture**

Prism.js plugins work by:
1. Hooking into the `Prism.highlightAllUnder()` process
2. Looking for specific classes and data attributes on `<pre>` elements
3. Generating additional DOM elements (e.g., `.line-numbers-rows`, `.toolbar`, `.line-highlight`)

**Key Requirements**:
- `language-*` class MUST be on `<pre>` element
- Plugin-specific classes (e.g., `line-numbers`) MUST be on `<pre>` before highlighting
- Data attributes (e.g., `data-line`) MUST be on `<pre>` before highlighting

### **Marked.js vs Prism Expectations**

| Aspect | Marked.js Output | Prism Expectation |
|--------|------------------|-------------------|
| Language class location | `<code class="language-json">` | `<pre class="language-json">` |
| Pre class | `<pre class="code json">` | `<pre class="language-json">` |
| Code class | `<code class="language-json">` | `<code class="language-json">` |

**Solution**: Copy `language-*` class from `<code>` to `<pre>` during directive processing and global highlighting.

---

## Files Modified Summary

| File | Lines | Description |
|------|-------|-------------|
| `htdocs/docs/dev/css/styles.css` | 954-990 | Updated 8 CSS rules to exclude `[data-prism-configured]` blocks |
| `htdocs/src/utilities/prism-config.js` | 321-341 | Copy language class from code to pre in `applyPerBlockPrismConfig()` |
| `htdocs/src/utilities/prism-config.js` | 91-115 | Updated code block detection in `highlightCode()` |

---

## Verification Steps

To verify the fix works:

1. **Navigate to a page with per-block directives** (e.g., `routing.md`)
2. **Inspect the DOM** - Verify `<pre>` has:
   - `class="code json line-numbers language-json"`
   - `data-line="2,4-6"`
   - `data-prism-configured="true"`
3. **Check visual features**:
   - Line numbers visible in gutter
   - Lines highlighted with accent background
   - Toolbar visible with buttons
4. **Toggle global settings** - Verify per-block directives still work
5. **Check console** - No warnings or errors

---

## Summary

The per-block Prism.js configuration feature was not rendering visual features due to two issues:

1. **Global CSS body classes** were hiding features for ALL blocks, including those with per-block configuration
2. **Marked.js HTML structure** put the `language-*` class on `<code>` instead of `<pre>`, preventing Prism plugins from detecting the blocks

Both issues have been fixed by:
1. Updating CSS rules to exclude `[data-prism-configured]` blocks from global hiding
2. Copying the `language-*` class from `<code>` to `<pre>` during directive processing

The per-block configuration system now works correctly, allowing markdown authors to override global settings on a per-code-block basis! 🎉
