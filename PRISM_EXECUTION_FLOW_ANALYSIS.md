# Prism.js Per-Block Configuration - Execution Flow Analysis

**Date**: 2025-11-04  
**Status**: Diagnostic Analysis

---

## 🔍 Problem Statement

You have a code block with **all correct classes and data attributes**, but **visual features are not appearing**:

**Current DOM**:
```html
<pre class="code json line-numbers language-json" 
     data-line="2,4-6" 
     data-prism-configured="true" 
     data-prism-copy="true" 
     data-prism-download="true" 
     data-prism-language="true" 
     tabindex="0">
  <code class="language-json">...</code>
</pre>
```

**Missing**:
- ❌ No `.line-numbers-rows` element (line numbers)
- ❌ No `.line-highlight` elements (highlighted lines)
- ❌ No `.code-toolbar` wrapper (toolbar)
- ❌ No `.toolbar` element (buttons)

---

## 📊 Complete Execution Flow

See the Mermaid diagram above for the complete visual flow.

### **Phase 1: Page Load (Synchronous)**

1. Browser loads `index.html`
2. **CRITICAL**: `<script>Prism.manual = true</script>` executes
   - **Location**: `htdocs/docs/dev/index.html` (lines 23-27)
   - **Purpose**: Disable Prism's automatic highlighting
   - **Result**: Prism waits for manual trigger
3. Prism.js core loads from CDN
4. Prism.js plugins load from CDN (toolbar, line-numbers, line-highlight, etc.)
5. Plugins register their hooks but don't execute yet

---

### **Phase 2: Initialization (Asynchronous)**

1. `DOMContentLoaded` event fires
2. Router auto-initialization runs
   - **Location**: `htdocs/src/router.js` (lines 230-258)
3. `setup(spa, options)` is called
   - **Location**: `htdocs/src/router.js` (line 16)
4. `prismConfig = loadPrismConfig()` loads settings from localStorage
   - **Location**: `htdocs/src/router.js` (line 28)
   - **Function**: `htdocs/src/utilities/prism-config.js` (lines 11-30)
5. `applyPrismConfig(prismConfig)` applies body classes
   - **Location**: `htdocs/src/router.js` (line 29)
   - **Function**: `htdocs/src/utilities/prism-config.js` (lines 32-78)
   - **Result**: Body gets classes like `prism-no-line-numbers`, `prism-no-toolbar`, etc.

---

### **Phase 3: Navigation (Asynchronous)**

1. `fetchRoutes()` loads navigation config
   - **Location**: `htdocs/src/router.js` (line 169)
2. `handleNavigation()` loads page content
   - **Location**: `htdocs/src/router.js` (line 107)
3. `fetch('/docs/dev/pages/routing.md')` retrieves markdown
4. `spa.renderMarkdown(content)` converts markdown to HTML
   - **Uses**: Snarkdown library
   - **Output**: HTML with structure `<pre class="code json"><code class="language-json">...</code></pre>`
5. `main.innerHTML = html` injects HTML into DOM
   - **Location**: `htdocs/src/router.js` (line 145)
   - **Result**: Code blocks exist in DOM but are NOT highlighted yet

---

### **Phase 4: Per-Block Configuration (Synchronous)**

1. `applyPerBlockPrismConfig(main)` is called
   - **Location**: `htdocs/src/router.js` (line 156)
   - **Function**: `htdocs/src/utilities/prism-config.js` (lines 342-418)
2. TreeWalker finds all HTML comments in the container
3. For each `<!-- prism: ... -->` comment:
   - Parse directive text (e.g., `"toolbar line-numbers highlight=2,4-6 ..."`)
   - Find next `<pre>` element
   - Copy `language-*` class from `<code>` to `<pre>` (Snarkdown fix)
   - Add classes: `.line-numbers`
   - Add attributes: `data-line="2,4-6"`, `data-prism-configured="true"`, etc.
   - Remove the HTML comment from DOM
4. **Result**: `<pre>` element has all classes and attributes applied ✅

---

### **Phase 5: Highlighting (Synchronous with Plugin Hooks)**

1. `highlightCode(main, prismConfig)` is called
   - **Location**: `htdocs/src/router.js` (line 159)
   - **Function**: `htdocs/src/utilities/prism-config.js` (lines 80-174)
2. Find all `<pre>` elements in container
3. Filter for elements with `language-*` classes
4. For each code block:
   - Check if it has `data-prism-configured` attribute
   - If yes, skip global configuration (per-block config takes precedence)
   - If no, apply global configuration
5. **For each code block** (lines 139-159):
   - `code.removeAttribute('data-highlighted')` - Clear previous highlighting
   - **`Prism.highlightElement(code, false)`** - **🔥 CRITICAL CALL**
   
#### **Inside Prism.highlightElement() - This is where plugins run!**

**Prism Core**:
- Parses code content
- Applies syntax highlighting (wraps tokens in `<span>` elements)
- Adds `data-highlighted="yes"` to `<code>` element

**Plugin Hooks Execute** (in order):

**A. Line Numbers Plugin**:
- **Trigger**: Checks if `<pre>` has `.line-numbers` class
- **Action**: Creates `.line-numbers-rows` element
- **DOM Change**: Inserts `<span class="line-numbers-rows">` inside `<pre>` after `<code>`
- **Expected Result**: Line numbers appear in left gutter

**B. Toolbar Plugin**:
- **Trigger**: Checks if toolbar plugin is loaded
- **Action**: Creates wrapper and toolbar
- **DOM Changes**:
  1. Creates `<div class="code-toolbar">` wrapper
  2. Moves `<pre>` inside wrapper
  3. Creates `<div class="toolbar">` element
  4. Inserts toolbar as sibling of `<pre>` inside wrapper
- **Expected Result**: Toolbar wrapper exists

**C. Copy-to-Clipboard Plugin** (requires toolbar):
- **Trigger**: Checks if copy plugin is loaded
- **Action**: Creates copy button
- **DOM Change**: Adds `<button data-copy-state="copy">` to toolbar
- **Expected Result**: Copy button appears in toolbar

**D. Download-Button Plugin** (requires toolbar):
- **Trigger**: Checks if download plugin is loaded
- **Action**: Creates download link
- **DOM Change**: Adds `<a download="...">` to toolbar
- **Expected Result**: Download button appears in toolbar

**E. Show-Language Plugin** (requires toolbar):
- **Trigger**: Checks if language plugin is loaded
- **Action**: Creates language label
- **DOM Change**: Adds `<span class="language-label">` to toolbar
- **Expected Result**: Language badge appears in toolbar

**F. Line Highlight Plugin**:
- **Trigger**: Checks if `<pre>` has `data-line` attribute
- **Action**: Creates highlight spans
- **DOM Change**: Inserts `<span class="line-highlight" data-start="..." data-end="...">` as siblings of `<pre>`
- **Expected Result**: Highlighted lines appear with colored background
- **⚠️ IMPORTANT**: These spans are inserted as siblings of `<pre>`, so they need to be inside the `.code-toolbar` wrapper if it exists

---

### **Phase 6: Post-Processing (Asynchronous)**

1. `setTimeout(() => {...}, 100)` schedules callback
   - **Location**: `htdocs/src/utilities/prism-config.js` (line 163)
   - **Purpose**: Wait for Prism plugins to finish creating DOM elements
2. After 100ms, callback executes:
   - For each `<pre>` with `data-prism-configured="true"`:
     - Find parent element
     - If parent is `.code-toolbar`, add `.prism-block-configured` class
   - **Purpose**: Mark wrappers so CSS can exclude them from global hiding rules

---

## 🎯 Expected vs Actual DOM

### **Expected Final DOM Structure**:

```html
<div class="code-toolbar prism-block-configured">
  <pre class="code json line-numbers language-json" 
       data-line="2,4-6" 
       data-prism-configured="true" 
       data-prism-copy="true" 
       data-prism-download="true" 
       data-prism-language="true" 
       tabindex="0">
    <code class="language-json" data-highlighted="yes">
      <span class="token punctuation">{</span>
      <span class="token property">"basePath"</span>
      ...
    </code>
    <span class="line-numbers-rows">
      <span></span>
      <span></span>
      <span></span>
      ...
    </span>
  </pre>
  <span class="line-highlight" data-start="2" data-end="2" style="top: ..."></span>
  <span class="line-highlight" data-start="4" data-end="6" style="top: ..."></span>
  <div class="toolbar">
    <div class="toolbar-item">
      <button data-copy-state="copy">Copy</button>
    </div>
    <div class="toolbar-item">
      <a download="file.json">Download</a>
    </div>
    <div class="toolbar-item">
      <span class="language-label">JSON</span>
    </div>
  </div>
</div>
```

### **Your Current DOM**:

```html
<pre class="code json line-numbers language-json" 
     data-line="2,4-6" 
     data-prism-configured="true" 
     data-prism-copy="true" 
     data-prism-download="true" 
     data-prism-language="true" 
     tabindex="0">
  <code class="language-json">
    // nav.json (excerpt)
    {
      "basePath": "/docs/dev/",
      ...
    }
  </code>
</pre>
```

**Missing Elements**:
- ❌ No `.code-toolbar` wrapper
- ❌ No `.line-numbers-rows` inside `<pre>`
- ❌ No `.line-highlight` spans
- ❌ No `.toolbar` element
- ❌ No syntax highlighting tokens (`<span class="token ...">`)
- ❌ No `data-highlighted="yes"` on `<code>`

---

## 🚨 CRITICAL DIAGNOSIS

**The plugins are NOT running!**

The fact that you have:
1. ✅ All classes and attributes on `<pre>`
2. ❌ No plugin-generated DOM elements
3. ❌ No syntax highlighting tokens
4. ❌ No `data-highlighted` attribute

**Means**: `Prism.highlightElement()` is either:
- **Not being called at all**, OR
- **Being called but failing silently**, OR
- **Being called but plugins are not loaded**

---

## 🔍 Diagnostic Steps

### **Step 1: Check if Prism.highlightElement() is being called**

Open browser console and look for these logs:

```
[prism-config] Highlighting X code blocks
[prism-config] Block 1: {preClasses: "...", ...}
[prism-config] Block 1 highlighted
```

**If you DON'T see these logs**:
- `highlightCode()` is not being called
- Check if router is executing properly

**If you DO see these logs**:
- `highlightCode()` is running
- But `Prism.highlightElement()` is failing

---

### **Step 2: Check if Prism.js is loaded**

Run in console:

```javascript
console.log('Prism loaded:', !!window.Prism);
console.log('Prism.manual:', window.Prism?.manual);
console.log('Prism.highlightElement:', typeof window.Prism?.highlightElement);
```

**Expected**:
```
Prism loaded: true
Prism.manual: true
Prism.highlightElement: "function"
```

**If Prism is not loaded**:
- Check network tab for failed CDN requests
- Check console for script loading errors

---

### **Step 3: Check if plugins are loaded**

Run in console:

```javascript
console.log('Prism plugins:', Object.keys(window.Prism?.plugins || {}));
```

**Expected**:
```
["toolbar", "copy-to-clipboard", "download-button", "show-language", "line-numbers", "line-highlight", "command-line"]
```

**If plugins are missing**:
- Check network tab for failed CDN requests
- Check plugin load order in `index.html`

---

### **Step 4: Manually trigger highlighting**

Run in console:

```javascript
const pre = document.querySelector('pre[data-prism-configured]');
const code = pre?.querySelector('code');
if (code) {
    console.log('Manually highlighting...');
    window.Prism.highlightElement(code, false);
    console.log('Done. Check DOM for changes.');
}
```

**If this creates the missing elements**:
- Prism works, but `highlightCode()` is not being called
- Check router execution flow

**If this DOESN'T create elements**:
- Prism or plugins are not loaded correctly
- Check CDN URLs and network requests

---

## 📋 Next Steps

Based on your diagnostic results, we can identify the exact failure point:

| Symptom | Diagnosis | Fix |
|---------|-----------|-----|
| No console logs | `highlightCode()` not called | Check router execution |
| Logs present, no DOM changes | `Prism.highlightElement()` failing | Check Prism loading |
| `window.Prism` undefined | Prism not loaded | Check CDN URLs |
| Plugins array empty | Plugins not loaded | Check plugin script tags |
| Manual trigger works | Router not calling function | Check router flow |
| Manual trigger fails | Prism/plugins broken | Reinstall Prism |

---

**Please run the diagnostic steps and share the console output!** This will help us pinpoint the exact issue.

