# Prism.js Per-Block Configuration - Debugging Guide

**Date**: 2025-11-03  
**Purpose**: Step-by-step guide to debug why Prism.js features aren't rendering

---

## 🔍 Step-by-Step Debugging Process

### **Step 1: Clear Browser Cache**

**Why**: Browser may be serving old JavaScript/CSS files.

**How**:
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload" (Chrome) or "Clear Cache and Reload" (Firefox)
4. Alternatively: Press `Ctrl+Shift+Delete`, select "Cached images and files", click "Clear data"

---

### **Step 2: Check Browser Console for Errors**

**Why**: JavaScript errors will prevent code from running.

**How**:
1. Open browser DevTools (F12)
2. Click "Console" tab
3. Look for red error messages
4. Common errors to look for:
   - `Uncaught SyntaxError` - Code has syntax errors
   - `Uncaught ReferenceError` - Variable/function not defined
   - `Failed to load resource` - Script/CSS file not found
   - `Uncaught TypeError` - Trying to call undefined function

**What to do if errors found**:
- Note the file name and line number
- Check if the file exists at that path
- Check if there are syntax errors in the code
- Check if imports are correct

---

### **Step 3: Run Diagnostic Script**

**Why**: Comprehensive check of all Prism.js components and configuration.

**How**:
1. Navigate to the routing.md page in your browser
2. Open browser console (F12)
3. Open the file `htdocs/src/tests/debug-prism-per-block.js`
4. Copy the entire contents
5. Paste into browser console
6. Press Enter
7. Review the detailed diagnostic output

**What to look for**:
- ✅ "Prism.js is loaded" - If ❌, Prism scripts aren't loading
- ✅ Plugins loaded - Should see toolbar, lineNumbers, lineHighlight, etc.
- ✅ Code blocks found - Should find at least 1 code block
- ✅ `.line-numbers-rows` present - If ❌, line-numbers plugin didn't run
- ✅ `.code-toolbar` wrapper - If ❌, toolbar plugin didn't run
- ✅ `.line-highlight` elements - If ❌, line-highlight plugin didn't run

---

### **Step 4: Check Network Tab**

**Why**: Verify all scripts and stylesheets are loading successfully.

**How**:
1. Open browser DevTools (F12)
2. Click "Network" tab
3. Reload the page (F5)
4. Filter by "JS" to see JavaScript files
5. Filter by "CSS" to see stylesheet files
6. Look for red/failed requests

**Files that should load**:
- ✅ `prism.js` (core)
- ✅ `prism-json.js`, `prism-javascript.js`, etc. (languages)
- ✅ `prism-toolbar.js`
- ✅ `prism-copy-to-clipboard.js`
- ✅ `prism-download-button.js`
- ✅ `prism-show-language.js`
- ✅ `prism-line-numbers.js`
- ✅ `prism-line-highlight.js`
- ✅ `prism.css` (theme)
- ✅ `prism-toolbar.css`
- ✅ `prism-line-numbers.css`
- ✅ `prism-line-highlight.css`
- ✅ `styles.css` (custom styles)

**What to do if files fail to load**:
- Check the URL in the error message
- Verify the file exists at that path
- Check if CDN is accessible (try opening URL in new tab)
- Check for typos in script/link tags

---

### **Step 5: Inspect DOM Structure**

**Why**: Verify Prism.js created the expected elements.

**How**:
1. Open browser DevTools (F12)
2. Click "Elements" tab (Chrome) or "Inspector" tab (Firefox)
3. Find the code block (look for `<pre class="language-json">`)
4. Expand the element tree

**Expected structure for a fully-configured block**:

```html
<div class="code-toolbar prism-block-configured">
  <pre class="code json line-numbers language-json" 
       data-line="2,4-6" 
       data-prism-configured="true" 
       tabindex="0">
    <code class="language-json">
      <!-- highlighted code here -->
    </code>
    <span class="line-numbers-rows">
      <span></span>
      <span></span>
      <span></span>
    </span>
  </pre>
  <span class="line-highlight" data-start="2" data-end="2" style="..."></span>
  <span class="line-highlight" data-start="4" data-end="6" style="..."></span>
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

**Check each element**:
- ❌ No `div.code-toolbar` wrapper → Toolbar plugin didn't run
- ❌ No `.line-numbers-rows` → Line numbers plugin didn't run
- ❌ No `.line-highlight` → Line highlight plugin didn't run
- ❌ No `.toolbar` → Toolbar plugin didn't run
- ❌ `language-json` class on `<code>` but not `<pre>` → Language class not copied

---

### **Step 6: Check Console Logs**

**Why**: Our code adds debug logging to track execution.

**How**:
1. Open browser console (F12)
2. Look for messages starting with `[prism-config]`

**Expected logs**:
```
[prism-config] Applied per-block directive: {...} to <pre>
[prism-config] Pre element classes: code json line-numbers language-json
[prism-config] Pre element attributes: {...}
[prism-config] Highlighting 1 code blocks
[prism-config] Block 1: {...}
[prism-config] Block 1 highlighted
[prism-config] Marked wrapper as configured: <div class="code-toolbar prism-block-configured">
```

**What to do if logs are missing**:
- ❌ No logs at all → Code isn't running (check for JS errors)
- ❌ "Applied per-block directive" missing → `applyPerBlockPrismConfig()` not running
- ❌ "Highlighting" missing → `highlightCode()` not running
- ❌ "Marked wrapper" missing → Wrapper not created or timeout issue

---

### **Step 7: Check CSS Computed Styles**

**Why**: CSS might be hiding elements even though they exist in DOM.

**How**:
1. Open browser DevTools (F12)
2. Click "Elements" tab
3. Select the element (e.g., `.line-numbers-rows`)
4. Look at "Styles" panel on the right
5. Check "Computed" tab to see final CSS values

**What to check**:
- `display: none` → Element is hidden
- `visibility: hidden` → Element is invisible
- `opacity: 0` → Element is transparent
- `height: 0` or `width: 0` → Element has no size
- `position: absolute; left: -9999px` → Element is off-screen

**Common CSS issues**:
- Body class `prism-no-line-numbers` hiding `.line-numbers-rows`
- Body class `prism-no-copy` hiding copy button
- Custom CSS overriding Prism styles

---

### **Step 8: Test with Minimal Example**

**Why**: Isolate the issue from the rest of the application.

**How**:
1. Open `test-prism-per-block.html` in browser
2. Check if Prism features work in this minimal example
3. If YES → Issue is with router/integration
4. If NO → Issue is with Prism setup/configuration

---

### **Step 9: Check Prism Plugin Load Order**

**Why**: Plugins must load in correct order (toolbar before toolbar-dependent plugins).

**How**:
1. Open `htdocs/docs/dev/index.html`
2. Check script tags in `<head>` section
3. Verify order:
   1. Prism core (`prism.js`)
   2. Language components (`prism-json.js`, etc.)
   3. Toolbar plugin (`prism-toolbar.js`) **BEFORE** toolbar-dependent plugins
   4. Copy-to-clipboard plugin (`prism-copy-to-clipboard.js`)
   5. Download button plugin (`prism-download-button.js`)
   6. Show language plugin (`prism-show-language.js`)
   7. Line numbers plugin (`prism-line-numbers.js`)
   8. Line highlight plugin (`prism-line-highlight.js`)

**Correct order**:
```html
<!-- Core -->
<script src=".../prism.js"></script>

<!-- Languages -->
<script src=".../prism-json.js"></script>

<!-- Toolbar FIRST -->
<script src=".../prism-toolbar.js"></script>

<!-- Toolbar-dependent plugins -->
<script src=".../prism-copy-to-clipboard.js"></script>
<script src=".../prism-download-button.js"></script>
<script src=".../prism-show-language.js"></script>

<!-- Other plugins -->
<script src=".../prism-line-numbers.js"></script>
<script src=".../prism-line-highlight.js"></script>
```

---

### **Step 10: Manual Prism Trigger Test**

**Why**: Test if Prism can be manually triggered to highlight code.

**How**:
1. Open browser console (F12)
2. Run this code:

```javascript
// Find a code block
const pre = document.querySelector('pre[class*="language-"]');
const code = pre.querySelector('code');

// Add classes manually
pre.classList.add('line-numbers');
pre.setAttribute('data-line', '2,4-6');

// Clear highlighting
code.removeAttribute('data-highlighted');
code.classList.remove('highlighted');

// Manually trigger Prism
Prism.highlightElement(code, false);

// Wait 200ms, then check for elements
setTimeout(() => {
    console.log('Line numbers rows:', pre.querySelector('.line-numbers-rows'));
    console.log('Toolbar wrapper:', pre.parentElement.classList.contains('code-toolbar'));
    console.log('Line highlights:', document.querySelectorAll('.line-highlight').length);
}, 200);
```

**What to look for**:
- ✅ `.line-numbers-rows` found → Line numbers plugin works
- ✅ `.code-toolbar` wrapper → Toolbar plugin works
- ✅ `.line-highlight` elements → Line highlight plugin works
- ❌ Any missing → That plugin isn't working

---

## 🎯 Common Issues and Solutions

### **Issue 1: Prism.js Not Loaded**

**Symptoms**:
- Console error: `Prism is not defined`
- No syntax highlighting at all

**Solutions**:
- Check script tags in `index.html`
- Verify CDN URLs are correct
- Check Network tab for failed requests
- Try loading Prism from different CDN

---

### **Issue 2: Plugins Not Running**

**Symptoms**:
- Syntax highlighting works
- But no line numbers, toolbar, or line highlights

**Solutions**:
- Check plugin script tags are present
- Verify plugin load order (toolbar before toolbar-dependent plugins)
- Check console for plugin errors
- Verify plugins are loaded: `console.log(Prism.plugins)`

---

### **Issue 3: Language Class Not on Pre**

**Symptoms**:
- `<code>` has `language-json` class
- `<pre>` does NOT have `language-json` class
- Plugins don't run

**Solutions**:
- Verify `applyPerBlockPrismConfig()` is running
- Check console logs for "Pre element classes"
- Manually add class: `pre.classList.add('language-json')`

---

### **Issue 4: CSS Hiding Elements**

**Symptoms**:
- Elements exist in DOM
- But not visible on page

**Solutions**:
- Check body classes: `document.body.className`
- Remove hiding classes: `document.body.classList.remove('prism-no-line-numbers')`
- Check computed styles in DevTools
- Verify `.prism-block-configured` class on wrapper

---

### **Issue 5: Timing Issues**

**Symptoms**:
- Sometimes works, sometimes doesn't
- Wrapper class not added

**Solutions**:
- Increase setTimeout delay from 100ms to 500ms
- Use MutationObserver instead of setTimeout
- Trigger manually after page load

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Browser cache cleared (hard reload)
- [ ] No JavaScript errors in console
- [ ] Prism.js loaded (`window.Prism` exists)
- [ ] All plugins loaded (check `Prism.plugins`)
- [ ] All scripts/stylesheets loaded successfully (Network tab)
- [ ] Code blocks found in DOM
- [ ] Language class on `<pre>` element
- [ ] `data-prism-configured="true"` on configured blocks
- [ ] Ran diagnostic script (`debug-prism-per-block.js`)
- [ ] Checked DOM structure (Elements tab)
- [ ] Checked console logs for `[prism-config]` messages
- [ ] Tested minimal example (`test-prism-per-block.html`)

---

## 🆘 If Still Not Working

If you've completed all steps and it's still not working:

1. **Capture diagnostic output**:
   - Run `debug-prism-per-block.js` in console
   - Copy all console output
   - Take screenshot of Elements tab showing code block DOM

2. **Check these specific things**:
   - What browser and version?
   - What does `window.Prism.version` return?
   - What does `Object.keys(Prism.plugins)` return?
   - Does `test-prism-per-block.html` work?

3. **Try this emergency fix**:
   ```javascript
   // Force re-highlight all code blocks
   document.querySelectorAll('pre code').forEach(code => {
       code.removeAttribute('data-highlighted');
       Prism.highlightElement(code);
   });
   ```

---

**Good luck debugging!** 🐛🔍

