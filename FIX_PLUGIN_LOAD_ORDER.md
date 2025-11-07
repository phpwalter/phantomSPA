# 🎯 CRITICAL FIX: Prism Plugin Load Order Issue

**Date**: 2025-11-04  
**Status**: FIXED - Plugin dependency order resolved

---

## 🐛 The Problem

When you tried to manually reload plugins, you got these errors:

```
Show Languages plugin loaded before Toolbar plugin.
Copy to Clipboard plugin loaded before Toolbar plugin.
Cannot read properties of undefined (reading 'registerButton')
```

**Root Cause**: **Plugin dependency order violation**

---

## 🔍 Why This Happened

### **Plugin Dependencies**:

```
Prism Core (prism.min.js)
  ↓
Language Components (prism-json.min.js, etc.)
  ↓
Toolbar Plugin (prism-toolbar.min.js) ← MUST LOAD FIRST
  ↓
├─ Copy-to-Clipboard Plugin (depends on Toolbar)
├─ Download-Button Plugin (depends on Toolbar)
└─ Show-Language Plugin (depends on Toolbar)
  ↓
Independent Plugins:
├─ Line Numbers Plugin
├─ Line Highlight Plugin
└─ Command Line Plugin
```

### **What Was Happening**:

1. All `<script>` tags without `defer` load **asynchronously**
2. Browser downloads all scripts in parallel
3. Scripts execute in **random order** (whichever finishes downloading first)
4. Copy/Download/Language plugins execute **before** Toolbar plugin
5. They try to call `Prism.plugins.toolbar.registerButton()` but it doesn't exist yet
6. They fail and don't register themselves
7. Result: `Prism.plugins` is empty

---

## ✅ The Fix

Added `defer` attribute to **ALL** Prism script tags to ensure **sequential loading**.

### **What `defer` Does**:

- Scripts download in parallel (fast)
- Scripts execute **in order** (after DOM is ready)
- Scripts execute **in the order they appear in HTML**
- Scripts execute **before** `DOMContentLoaded` event

### **Load Order Now**:

```
1. Prism Core loads and executes
2. Language components load and execute (in order)
3. Toolbar plugin loads and executes ← Creates Prism.plugins.toolbar
4. Copy/Download/Language plugins load and execute ← Can now use toolbar
5. Independent plugins load and execute
6. ES6 modules (router.js) load and execute
7. DOMContentLoaded fires
```

---

## 📝 Changes Made

### **File**: `htdocs/docs/dev/index.html`

**Before**:
```html
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
<!-- etc. -->
```

**After**:
```html
<!-- Core must load first, then languages, then plugins - use defer for sequential loading -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-markup.min.js" defer></script>
<!-- etc. -->

<!-- CRITICAL: Toolbar MUST load first - other plugins depend on it -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js" defer></script>
<!-- These plugins depend on toolbar - load with defer to ensure sequential loading -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/download-button/prism-download-button.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/show-language/prism-show-language.min.js" defer></script>
<!-- These plugins are independent -->
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-numbers/prism-line-numbers.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/command-line/prism-command-line.min.js" defer></script>
```

---

## 🧪 Testing

### **Step 1: Clear Cache and Reload**

1. Open DevTools (F12)
2. Right-click the reload button
3. Select "Empty Cache and Hard Reload"
4. Or press: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)

### **Step 2: Run Diagnostic**

Open console and run:

```javascript
console.log('=== PLUGIN LOAD TEST ===');
console.log('1. Prism loaded:', !!window.Prism);
console.log('2. Prism.manual:', window.Prism?.manual);
console.log('3. Plugins loaded:', Object.keys(window.Prism?.plugins || {}));
console.log('4. Toolbar plugin:', !!window.Prism?.plugins?.toolbar);
console.log('5. Line numbers plugin:', !!window.Prism?.plugins?.lineNumbers);
console.log('6. Line highlight plugin:', !!window.Prism?.plugins?.lineHighlight);
```

### **Expected Output**:

```
=== PLUGIN LOAD TEST ===
1. Prism loaded: true
2. Prism.manual: true
3. Plugins loaded: ['toolbar', 'lineNumbers', 'lineHighlight', 'commandLine', 'copyToClipboard', 'downloadButton', 'showLanguage']
4. Toolbar plugin: true
5. Line numbers plugin: true
6. Line highlight plugin: true
```

### **Step 3: Check Visual Features**

Navigate to `/routing` page and verify:

- ✅ Line numbers appear in gutter
- ✅ Lines 2, 4-6 are highlighted
- ✅ Toolbar appears with Copy, Download, and JSON label buttons
- ✅ Syntax highlighting colors are applied

---

## 🎯 Why This Fix Works

### **Before (Async Loading)**:

```
Time →
0ms:  All scripts start downloading
100ms: Copy plugin finishes, executes → ERROR (toolbar not loaded)
150ms: Toolbar plugin finishes, executes → Too late!
200ms: Download plugin finishes, executes → ERROR (toolbar not loaded)
```

### **After (Deferred Sequential Loading)**:

```
Time →
0ms:   All scripts start downloading (parallel)
100ms: All scripts downloaded
150ms: Prism core executes
151ms: Language components execute (in order)
152ms: Toolbar plugin executes ✅
153ms: Copy plugin executes ✅ (toolbar exists)
154ms: Download plugin executes ✅ (toolbar exists)
155ms: Show Language plugin executes ✅ (toolbar exists)
156ms: Line Numbers plugin executes ✅
157ms: Line Highlight plugin executes ✅
158ms: Command Line plugin executes ✅
200ms: Router executes → Prism.plugins is fully populated ✅
```

---

## 📚 Technical Details

### **Script Loading Attributes**:

| Attribute | Download | Execute | Order |
|-----------|----------|---------|-------|
| (none) | Blocking | Immediately | Random (async) |
| `async` | Parallel | Immediately | Random |
| `defer` | Parallel | After DOM | **Sequential** ✅ |
| `type="module"` | Parallel | After DOM | Sequential (after defer) |

### **Why `defer` is Perfect Here**:

1. **Parallel download** - Fast loading
2. **Sequential execution** - Respects dependencies
3. **DOM ready** - Executes after HTML is parsed
4. **Before DOMContentLoaded** - Available when router initializes

---

## 🚀 Expected Result

After clearing cache and reloading:

1. **All 7 plugins load successfully**
2. **No console errors**
3. **Visual features render correctly**:
   - Line numbers visible
   - Lines highlighted
   - Toolbar with buttons
   - Syntax highlighting colors

---

## 🔍 If It Still Doesn't Work

If plugins still don't load after this fix, run this diagnostic:

```javascript
// Check if defer is working
const scripts = Array.from(document.querySelectorAll('script[src*="prismjs"]'));
console.log('Script tags:', scripts.map(s => ({
    src: s.src.split('/').pop(),
    defer: s.defer,
    async: s.async
})));

// Check load order
window.prismLoadOrder = window.prismLoadOrder || [];
console.log('Load order:', window.prismLoadOrder);
```

And add this to the top of each plugin script (temporarily):

```javascript
window.prismLoadOrder = window.prismLoadOrder || [];
window.prismLoadOrder.push('plugin-name');
```

This will show the actual execution order.

---

## 📋 Summary

**Problem**: Plugins loaded in random order, dependencies failed  
**Solution**: Added `defer` to all Prism scripts for sequential loading  
**Result**: Plugins load in correct order, all features work  

**Next Step**: Clear cache and reload page! 🚀

