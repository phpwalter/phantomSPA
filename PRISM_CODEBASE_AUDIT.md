# PhantomSPA Prism.js Codebase Audit Report

**Date**: 2025-11-05  
**Audit Scope**: PhantomSPA repository (excluding `/src/plugins/` for Part 1)  
**Status**: ✅ Complete

---

## EXECUTIVE SUMMARY

### Critical Findings

1. **VIOLATION: Core Framework Prism Dependency** ⚠️ **SEVERITY: HIGH**
   - `/src/integrations/prism.js` contains Prism.js integration code in the core framework
   - This violates the plugin isolation principle (plugins must be completely self-contained)
   - The plugin should NOT require core framework files to be modified

2. **VIOLATION: Unused Legacy Integration File** ⚠️ **SEVERITY: MEDIUM**
   - `/src/integrations/prism-loader.js` is a legacy file that duplicates functionality
   - Not used by the current plugin architecture
   - Should be removed to avoid confusion

3. **VIOLATION: Package.json Dependency** ⚠️ **SEVERITY: MEDIUM**
   - `prismjs` is listed as a core dependency in `package.json`
   - Should be optional or removed from core dependencies
   - Plugin should manage its own dependencies

4. **POSITIVE: Plugin Architecture is Self-Contained** ✅
   - The Prism plugin (`/src/plugins/prism/`) is well-designed and modular
   - Can be removed by deleting the plugin entry from `app-config.json`
   - No modifications to core router.js, spa.js, or styles.css required

---

## PART 1: PRISM.JS CORE FRAMEWORK AUDIT

### Files with Prism References (Excluding `/src/plugins/`)

| File Path | Line(s) | Usage Type | Severity | Issue |
|-----------|---------|-----------|----------|-------|
| `/src/integrations/prism.js` | 1-16 | Event listener + method calls | **HIGH** | Core framework integration - violates plugin isolation |
| `/src/integrations/prism-loader.js` | 1-51 | Export functions | **MEDIUM** | Legacy/unused code - duplicates plugin functionality |
| `/package.json` | 52 | Dependency declaration | **MEDIUM** | Core dependency - should be optional |
| `/package-lock.json` | 15 | Lock file entry | **MEDIUM** | Consequence of package.json dependency |
| `/htdocs/docs/dev/conf/app-config.json` | 12-76 | Plugin configuration | **LOW** | Correct usage - plugin config only |

### Detailed Findings

#### 1. `/src/integrations/prism.js` - CRITICAL VIOLATION

**Lines 1-16**: Direct Prism.js integration in core framework

```javascript
// Re-highlight after every route change (router dispatches "route:after")
document.addEventListener('route:after', () => {
    if (window.Prism && typeof window.Prism.highlightAllUnder === 'function') {
        const main = document.querySelector('main.site-main') || document.querySelector('main');
        if (main) window.Prism.highlightAllUnder(main);
    }
});
```

**Issues**:
- Hardcoded Prism method calls (`window.Prism.highlightAllUnder`)
- Listens to `route:after` event (core framework event)
- Assumes Prism is always available
- **This file should NOT exist** - plugin should handle its own highlighting

**Recommendation**: DELETE this file entirely. The plugin already handles highlighting via `route:after` event in `prism-syntax-highlighter.js` (lines 61-73).

#### 2. `/src/integrations/prism-loader.js` - LEGACY CODE

**Lines 1-51**: Unused helper functions for loading Prism

**Issues**:
- Exports `loadPrismBase()`, `loadPrismLanguages()`, `loadPrismPlugins()`
- Duplicates functionality in `/src/plugins/prism/prism-plugin-loader.js`
- Not imported or used anywhere in the codebase
- Creates confusion about which loader to use

**Recommendation**: DELETE this file. The plugin has its own loader.

#### 3. `/package.json` - DEPENDENCY VIOLATION

**Line 52**: `"prismjs": "^1.30.0"` listed as core dependency

**Issues**:
- Makes Prism a required dependency for all PhantomSPA installations
- Violates plugin architecture principle (plugins should be optional)
- Users who don't use syntax highlighting are forced to install Prism

**Recommendation**: Remove from `dependencies`. Users who want the Prism plugin should install it separately or it should be listed as an optional peer dependency.

---

## PART 2: PRISM PLUGIN ARCHITECTURE REVIEW

### Plugin File Structure

```
/src/plugins/prism/
├── prism-syntax-highlighter.js      (Main entry point - 395 lines)
├── prism-config.js                  (Configuration manager - 554 lines)
├── prism-plugin-loader.js           (Plugin loader - 112 lines)
├── prism-debug.js                   (Debug utilities - 63 lines)
└── prism-syntax-highlighter.css     (Styles - 609 lines)
```

### Architecture Assessment

#### ✅ STRENGTHS

1. **Self-Contained**: Plugin can be removed by deleting entry from `app-config.json`
2. **Modular Design**: Clear separation of concerns across 5 files
3. **Configuration-Driven**: All settings come from `app-config.json`
4. **No Core Modifications**: Plugin doesn't modify router.js, spa.js, or core styles.css
5. **Proper Event Handling**: Uses `route:after` event for highlighting
6. **CSS Isolation**: All Prism-specific CSS in dedicated file
7. **Debug Utilities**: Includes debugging tools for troubleshooting

#### ⚠️ ISSUES & RECOMMENDATIONS

| Issue | File | Severity | Recommendation |
|-------|------|----------|-----------------|
| Unused legacy integration files | `/src/integrations/` | HIGH | Delete `prism.js` and `prism-loader.js` |
| Core dependency in package.json | `package.json` | MEDIUM | Remove `prismjs` from dependencies |
| Hardcoded CDN URLs | `prism-syntax-highlighter.js` | LOW | Already config-driven - OK |
| Large monolithic config file | `prism-config.js` (554 lines) | LOW | Consider splitting into smaller modules |
| Debug code in production | `prism-debug.js` | LOW | Move to tests directory |

### Detailed Recommendations

#### 1. DELETE `/src/integrations/prism.js`

**Why**: The plugin already handles all highlighting via its own `route:after` listener. This file is redundant and violates plugin isolation.

**Impact**: None - functionality is duplicated in the plugin.

#### 2. DELETE `/src/integrations/prism-loader.js`

**Why**: Unused legacy code. The plugin has its own loader (`prism-plugin-loader.js`).

**Impact**: None - not imported anywhere.

#### 3. REMOVE `prismjs` from `package.json` dependencies

**Why**: Makes Prism mandatory for all users. Should be optional.

**Options**:
- Option A: Remove entirely (users install separately if needed)
- Option B: Move to `optionalDependencies`
- Option C: Document as peer dependency

**Impact**: Reduces bundle size for users who don't use syntax highlighting.

#### 4. REFACTOR `prism-config.js` (Optional Enhancement)

**Current**: 554 lines in single file

**Suggested Split**:
- `prism-config.js` - Configuration loading/saving (100 lines)
- `prism-highlighter.js` - Highlighting logic (150 lines)
- `prism-ui.js` - Settings panel UI (200 lines)
- `prism-directives.js` - Per-block directive parsing (100 lines)

**Benefit**: Improved maintainability and testability

#### 5. MOVE `prism-debug.js` to Tests Directory

**Current**: `/src/plugins/prism/prism-debug.js`

**Suggested**: `/src/tests/prism-debug.js`

**Reason**: Debug utilities belong in tests, not production code

---

## COMPLIANCE CHECKLIST

| Requirement | Status | Notes |
|-------------|--------|-------|
| Self-contained plugin | ✅ PASS | Can be removed by deleting config entry |
| Zero core modifications | ❌ FAIL | `/src/integrations/prism.js` violates this |
| Removable by config only | ✅ PASS | Plugin entry in app-config.json |
| No hardcoded paths | ✅ PASS | All paths from configuration |
| Proper event handling | ✅ PASS | Uses `route:after` event |
| CSS isolation | ✅ PASS | Dedicated CSS file |
| No global state pollution | ✅ PASS | Uses localStorage for config |

---

## ACTION ITEMS (Priority Order)

### 🔴 CRITICAL (Must Fix)

1. **Delete `/src/integrations/prism.js`** - Violates plugin isolation
2. **Delete `/src/integrations/prism-loader.js`** - Unused legacy code
3. **Remove `prismjs` from `package.json`** - Makes plugin mandatory

### 🟡 RECOMMENDED (Should Fix)

4. Move `prism-debug.js` to `/src/tests/`
5. Refactor `prism-config.js` into smaller modules (optional)

### 🟢 NICE-TO-HAVE (Can Wait)

6. Add JSDoc comments to all exported functions
7. Add unit tests for plugin loader
8. Document per-block directive syntax

---

## CONCLUSION

The Prism plugin architecture is **well-designed and modular**, but the codebase has **3 critical violations** of the plugin isolation principle:

1. Core framework integration file (`/src/integrations/prism.js`)
2. Unused legacy loader (`/src/integrations/prism-loader.js`)
3. Mandatory core dependency (`prismjs` in `package.json`)

**Removing these three items will make the plugin fully compliant** with PhantomSPA's plugin architecture requirements.

**Estimated Fix Time**: 15 minutes

