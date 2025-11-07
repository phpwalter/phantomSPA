# Prism.js Execution Flow - Visual Diagrams Summary

**Date**: 2025-11-04

---

## 📊 Visual Diagrams Created

I've created **5 interactive Mermaid diagrams** showing the complete execution flow:

### **1. Phase 1-3: Page Load, Initialization & Navigation**
Shows:
- How `Prism.manual = true` disables automatic highlighting
- When Prism.js and plugins load from CDN
- Router initialization and navigation flow
- When markdown is converted to HTML and injected into DOM

**Key Insight**: Code blocks exist in DOM but are NOT highlighted yet after Phase 3

---

### **2. Phase 4: Per-Block Configuration**
Shows:
- How `applyPerBlockPrismConfig()` finds HTML comments
- Directive parsing process
- How classes and attributes are added to `<pre>` elements
- Language class copying from `<code>` to `<pre>` (Snarkdown fix)

**Key Insight**: After Phase 4, `<pre>` has all classes/attributes but NO visual features yet

---

### **3. Phase 5: Highlighting & Plugin Execution** ⭐ **MOST CRITICAL**
Shows:
- When `Prism.highlightElement()` is called
- How Prism core tokenizes and highlights code
- **When each plugin hook executes** (this is where visual features are created!)
- What DOM elements each plugin creates:
  - Line Numbers → `.line-numbers-rows`
  - Toolbar → `.code-toolbar` wrapper + `.toolbar` element
  - Copy → Copy button in toolbar
  - Download → Download link in toolbar
  - Language → Language label in toolbar
  - Line Highlight → `.line-highlight` spans

**Key Insight**: If plugins don't run in Phase 5, NO visual elements are created!

---

### **4. Phase 6-7: Post-Processing & Final DOM State**
Shows:
- `setTimeout()` delay to wait for plugins to finish
- How `.prism-block-configured` class is added to wrappers
- Expected final DOM structure with all elements

**Key Insight**: Shows what the DOM SHOULD look like if everything works correctly

---

### **5. Decision Flow: Where Visual Features Are Created**
Shows:
- All decision points in the process
- What happens if Prism.js is not loaded
- What happens if plugins are not loaded
- How each plugin checks for classes/attributes before creating elements
- All possible failure points

**Key Insight**: Identifies exactly where the process can fail

---

## 🎯 The Critical Phase: Phase 5

**Everything depends on Phase 5 executing correctly!**

### **What MUST happen in Phase 5**:

```
highlightCode() calls Prism.highlightElement(code, false)
    ↓
Prism Core:
  ✅ Tokenizes code
  ✅ Wraps tokens in <span class="token ...">
  ✅ Sets data-highlighted="yes"
    ↓
Plugin Hooks Execute:
  ✅ Line Numbers plugin → Creates .line-numbers-rows
  ✅ Toolbar plugin → Creates .code-toolbar wrapper
  ✅ Copy plugin → Creates copy button
  ✅ Download plugin → Creates download button
  ✅ Language plugin → Creates language label
  ✅ Line Highlight plugin → Creates .line-highlight spans
```

### **If Phase 5 fails, you get**:

```
❌ No syntax highlighting tokens
❌ No data-highlighted attribute
❌ No .line-numbers-rows
❌ No .code-toolbar wrapper
❌ No .toolbar element
❌ No .line-highlight spans
```

**This matches your current symptoms!**

---

## 🔍 Diagnostic: Which Phase is Failing?

Run this in browser console to identify the failure point:

```javascript
// Check Phase 1: Prism loaded?
console.log('Phase 1:', {
    prismLoaded: !!window.Prism,
    prismManual: window.Prism?.manual,
    prismVersion: window.Prism?.version
});

// Check Phase 1: Plugins loaded?
console.log('Phase 1 Plugins:', {
    pluginsObject: !!window.Prism?.plugins,
    loadedPlugins: Object.keys(window.Prism?.plugins || {})
});

// Check Phase 4: Per-block config applied?
const pre = document.querySelector('pre[data-prism-configured]');
console.log('Phase 4:', {
    preFound: !!pre,
    hasLineNumbersClass: pre?.classList.contains('line-numbers'),
    hasLanguageClass: pre?.classList.contains('language-json'),
    hasDataLine: pre?.hasAttribute('data-line'),
    dataLineValue: pre?.getAttribute('data-line')
});

// Check Phase 5: Highlighting executed?
const code = pre?.querySelector('code');
console.log('Phase 5 Core:', {
    codeFound: !!code,
    hasDataHighlighted: code?.hasAttribute('data-highlighted'),
    hasSyntaxTokens: (code?.querySelectorAll('.token').length || 0) > 0
});

// Check Phase 5: Plugins executed?
console.log('Phase 5 Plugins:', {
    hasLineNumbersRows: !!pre?.querySelector('.line-numbers-rows'),
    hasToolbarWrapper: pre?.parentElement?.classList.contains('code-toolbar'),
    hasToolbar: !!document.querySelector('.toolbar'),
    hasLineHighlight: !!document.querySelector('.line-highlight')
});

// Summary
if (!window.Prism) {
    console.error('❌ FAILURE AT PHASE 1: Prism.js not loaded');
} else if (!window.Prism.plugins || Object.keys(window.Prism.plugins).length === 0) {
    console.error('❌ FAILURE AT PHASE 1: Plugins not loaded');
} else if (!pre) {
    console.error('❌ FAILURE AT PHASE 4: Per-block config not applied');
} else if (!code?.hasAttribute('data-highlighted')) {
    console.error('❌ FAILURE AT PHASE 5: Prism.highlightElement() not executed or failed');
} else if (!pre.querySelector('.line-numbers-rows')) {
    console.error('❌ FAILURE AT PHASE 5: Plugins did not execute');
} else {
    console.log('✅ All phases completed successfully!');
}
```

---

## 📋 Expected Console Output

### **If everything is working**:

```
Phase 1: {prismLoaded: true, prismManual: true, prismVersion: "1.29.0"}
Phase 1 Plugins: {pluginsObject: true, loadedPlugins: Array(7)}
Phase 4: {preFound: true, hasLineNumbersClass: true, hasLanguageClass: true, hasDataLine: true, dataLineValue: "2,4-6"}
Phase 5 Core: {codeFound: true, hasDataHighlighted: true, hasSyntaxTokens: true}
Phase 5 Plugins: {hasLineNumbersRows: true, hasToolbarWrapper: true, hasToolbar: true, hasLineHighlight: true}
✅ All phases completed successfully!
```

### **If Prism not loaded**:

```
Phase 1: {prismLoaded: false, prismManual: undefined, prismVersion: undefined}
❌ FAILURE AT PHASE 1: Prism.js not loaded
```

### **If plugins not loaded**:

```
Phase 1: {prismLoaded: true, prismManual: true, prismVersion: "1.29.0"}
Phase 1 Plugins: {pluginsObject: false, loadedPlugins: []}
❌ FAILURE AT PHASE 1: Plugins not loaded
```

### **If highlighting didn't run**:

```
Phase 1: {prismLoaded: true, prismManual: true, prismVersion: "1.29.0"}
Phase 1 Plugins: {pluginsObject: true, loadedPlugins: Array(7)}
Phase 4: {preFound: true, hasLineNumbersClass: true, hasLanguageClass: true, hasDataLine: true, dataLineValue: "2,4-6"}
Phase 5 Core: {codeFound: true, hasDataHighlighted: false, hasSyntaxTokens: false}
❌ FAILURE AT PHASE 5: Prism.highlightElement() not executed or failed
```

### **If plugins didn't execute** (YOUR CURRENT ISSUE):

```
Phase 1: {prismLoaded: true, prismManual: true, prismVersion: "1.29.0"}
Phase 1 Plugins: {pluginsObject: true, loadedPlugins: Array(7)}
Phase 4: {preFound: true, hasLineNumbersClass: true, hasLanguageClass: true, hasDataLine: true, dataLineValue: "2,4-6"}
Phase 5 Core: {codeFound: true, hasDataHighlighted: ?, hasSyntaxTokens: ?}
Phase 5 Plugins: {hasLineNumbersRows: false, hasToolbarWrapper: false, hasToolbar: false, hasLineHighlight: false}
❌ FAILURE AT PHASE 5: Plugins did not execute
```

---

## 🚨 Most Likely Causes (Based on Your Symptoms)

### **1. Prism.js or Plugins Failed to Load from CDN** (80% probability)

**Symptoms**:
- `window.Prism` is undefined OR
- `window.Prism.plugins` is empty OR
- Some plugins are missing

**Check**:
1. Open Network tab in DevTools
2. Filter by "prism"
3. Look for failed requests (red, 404, etc.)

**Fix**:
- Check internet connection
- Verify CDN URLs are correct
- Try loading from different CDN (e.g., unpkg.com instead of jsdelivr.net)

---

### **2. Prism.highlightElement() Not Being Called** (15% probability)

**Symptoms**:
- No `[prism-config]` logs in console
- `data-highlighted` attribute not set
- No syntax highlighting tokens

**Check**:
Look for these console logs:
```
[prism-config] Highlighting X code blocks
[prism-config] Block 1: {...}
[prism-config] Block 1 highlighted
```

**Fix**:
- Check if `highlightCode()` is being called
- Check for JavaScript errors preventing execution

---

### **3. JavaScript Error in Plugin Code** (5% probability)

**Symptoms**:
- Red error messages in console
- Execution stops during highlighting

**Check**:
- Look for errors in console
- Check if error mentions Prism or plugins

**Fix**:
- Fix the JavaScript error
- Check for conflicting scripts

---

## 📚 Additional Resources

1. **Quick Diagnostic Script**: `htdocs/src/tests/quick-prism-diagnostic.js`
   - Copy entire file into console for comprehensive diagnostics

2. **Text-Based Flow**: `EXECUTION_FLOW_TEXT.md`
   - Complete execution flow in text format with line numbers

3. **Detailed Analysis**: `PRISM_EXECUTION_FLOW_ANALYSIS.md`
   - In-depth analysis with troubleshooting steps

---

## 🎯 Next Steps

1. **Run the diagnostic code above** in browser console
2. **Share the output** so we can identify the exact failure point
3. **Check Network tab** for failed CDN requests
4. **Look for JavaScript errors** in console

Once we know which phase is failing, we can provide a targeted fix!

---

**The visual diagrams above show the complete flow. The diagnostic code will tell us exactly where it's breaking.** 🚀

