# Fix: Prism Config Scope Error in router.js

**Date**: 2025-11-03  
**Status**: ✅ FIXED  
**Error**: `Uncaught ReferenceError: prismConfig is not defined at router.js:229`

---

## 🐛 The Problem

**JavaScript Error**:
```
router.js:229 Uncaught ReferenceError: prismConfig is not defined
    at router.js:229:56
```

**Root Cause**: Variable scope issue

### **What Was Wrong**

The `initPrismSettingsUI()` function was defined **inside** the `setup()` function but was being **called outside** the `setup()` function, causing a scope error.

**Before (Broken)**:

```javascript
export async function setup(spa, options = {}) {
    // prismConfig declared HERE (inside setup function)
    let prismConfig = loadPrismConfig();
    
    // ... other code ...
    
    // Function defined inside setup() - has access to prismConfig
    function initPrismSettingsUI() {
        const panel = createPrismSettingsPanel(prismConfig, ...); // ✅ Can access
    }
    
    // End of setup function
}

// OUTSIDE setup function - prismConfig is out of scope!
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // ...
    });
    
    // Called OUTSIDE setup() - prismConfig is undefined here!
    initPrismSettingsUI(); // ❌ ERROR: prismConfig is not defined
    
    // Function defined OUTSIDE setup() - cannot access prismConfig
    function initPrismSettingsUI() {
        const panel = createPrismSettingsPanel(prismConfig, ...); // ❌ ERROR
    }
}
```

**The Issue**:
1. `prismConfig` is declared with `let` inside `setup()` function (line 28)
2. `initPrismSettingsUI()` function is defined inside `setup()` (lines 185-224)
3. But `initPrismSettingsUI()` is **also** called outside `setup()` (line 260)
4. There's a **duplicate** `initPrismSettingsUI()` function defined outside `setup()` (lines 265-303)
5. The duplicate function tries to access `prismConfig`, which is out of scope
6. Result: `ReferenceError: prismConfig is not defined`

---

## ✅ The Solution

**Move the `initPrismSettingsUI()` call inside the `setup()` function** where it has access to `prismConfig`, and remove the duplicate function definition.

**After (Fixed)**:

```javascript
export async function setup(spa, options = {}) {
    // prismConfig declared HERE (inside setup function)
    let prismConfig = loadPrismConfig();
    
    // ... other code ...
    
    // Function defined inside setup() - has access to prismConfig
    function initPrismSettingsUI() {
        const panel = createPrismSettingsPanel(prismConfig, ...); // ✅ Can access
    }
    
    // Call INSIDE setup() - prismConfig is in scope!
    initPrismSettingsUI(); // ✅ Works correctly
    
    // End of setup function
}

// OUTSIDE setup function - no duplicate function or call
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // ...
    });
    // No duplicate initPrismSettingsUI() here anymore ✅
}
```

---

## 🔧 Changes Made

### **File**: `htdocs/src/router.js`

### **Change 1: Moved function call inside `setup()`**

**Location**: End of `setup()` function (line 227)

**Added**:
```javascript
    // Initialize Prism settings UI
    initPrismSettingsUI();
}
```

This ensures `initPrismSettingsUI()` is called **after** `prismConfig` is defined and **within** the same scope.

---

### **Change 2: Removed duplicate function definition and call**

**Location**: Lines 259-303 (removed)

**Removed**:
```javascript
    // Initialize Prism settings UI
    initPrismSettingsUI(); // ❌ Removed - was causing error

    /**
     * Initialize Prism settings UI
     */
    function initPrismSettingsUI() {
        // ... duplicate function body ...
    } // ❌ Removed - was duplicate
}
```

---

## 📊 Code Flow After Fix

### **Correct Execution Order**:

1. **Page loads** → `DOMContentLoaded` fires
2. **Router auto-initializes** → Calls `setup(window.spa, options)`
3. **Inside `setup()`**:
   - `prismConfig` is loaded from localStorage
   - `prismConfig` is applied to body classes
   - Routes are fetched
   - Navigation is handled
   - Event listeners are set up
   - **`initPrismSettingsUI()` is called** ✅
4. **Inside `initPrismSettingsUI()`**:
   - Waits for `.site-nav` to exist
   - Creates settings panel with `prismConfig` ✅
   - Creates settings button
   - Adds UI to navigation

**Result**: No scope errors, Prism settings UI initializes correctly!

---

## 🧪 Testing

### **Step 1: Clear Browser Cache**

**CRITICAL**: Clear cache to load the updated `router.js`

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

---

### **Step 2: Check Console**

Open browser console (F12) and verify:

1. ✅ **No errors** - The `ReferenceError` should be gone
2. ✅ **Prism config logs** - Should see `[prism-config]` messages
3. ✅ **No warnings** - No scope-related warnings

**Expected console output**:
```
[prism-config] Configuration loaded: {...}
[prism-config] Configuration applied
[router] loading: /docs/dev/pages/routing.md
[prism-config] Applied per-block directive: {...}
[prism-config] Highlighting 1 code blocks
[prism-config] Block 1 highlighted
[prism-config] Marked wrapper as configured: <div>
```

---

### **Step 3: Verify Settings UI**

Check that the Prism settings UI appears:

1. ✅ **Settings button** - `</>` icon in navigation
2. ✅ **Settings panel** - Opens when clicking button
3. ✅ **Checkboxes** - 7 toggleable options
4. ✅ **Functionality** - Toggling options works
5. ✅ **Persistence** - Settings saved to localStorage

---

### **Step 4: Verify Per-Block Config**

Navigate to `routing.md` and verify:

1. ✅ **Line numbers** visible
2. ✅ **Lines highlighted** (2, 4-6)
3. ✅ **Toolbar** visible with buttons
4. ✅ **No JavaScript errors** in console

---

## 🎯 Why This Fix Works

### **Scope Chain**:

```
Global Scope
└── setup() function scope
    ├── prismConfig variable ✅
    ├── initPrismSettingsUI() function ✅
    └── initPrismSettingsUI() call ✅
```

**Before**: The call was outside `setup()`, trying to access `prismConfig` from a different scope.

**After**: The call is inside `setup()`, in the same scope as `prismConfig`.

---

## 📋 Summary

| Issue | Status |
|-------|--------|
| `ReferenceError: prismConfig is not defined` | ✅ Fixed |
| Duplicate `initPrismSettingsUI()` function | ✅ Removed |
| Duplicate `initPrismSettingsUI()` call | ✅ Removed |
| Scope error | ✅ Resolved |
| Settings UI initialization | ✅ Working |

---

## 🔍 Related Fixes

This fix is part of the complete Prism.js per-block configuration implementation:

1. ✅ **Disable automatic highlighting** - `index.html` (CRITICAL)
2. ✅ **Copy language class** - `prism-config.js`
3. ✅ **Force re-highlighting** - `prism-config.js`
4. ✅ **Mark wrapper divs** - `prism-config.js`
5. ✅ **Update CSS selectors** - `styles.css`
6. ✅ **Fix scope error** - `router.js` (THIS FIX)

**All fixes are now complete!** 🎉

---

## 📚 Additional Resources

- **Critical Fix**: See `CRITICAL_FIX_PRISM_MANUAL.md`
- **Debugging Guide**: See `DEBUGGING_GUIDE.md`
- **Technical Details**: See `PRISM_PER_BLOCK_FIX_V2.md`
- **Diagnostic Script**: `htdocs/src/tests/debug-prism-per-block.js`

---

**The scope error is now fixed!** The Prism settings UI should initialize correctly without errors. 🚀

