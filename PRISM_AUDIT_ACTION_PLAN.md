# Prism.js Audit - Action Plan & Implementation Guide

**Audit Date**: 2025-11-05  
**Status**: Ready for Implementation  
**Estimated Fix Time**: 5-10 minutes  
**Risk Level**: ✅ Very Low

---

## QUICK SUMMARY

The PhantomSPA codebase has **3 critical violations** of plugin architecture principles:

| # | Violation | File | Fix | Time |
|---|-----------|------|-----|------|
| 1 | Duplicate event listener | `/src/integrations/prism.js` | Delete | 1 min |
| 2 | Unused legacy loader | `/src/integrations/prism-loader.js` | Delete | 1 min |
| 3 | Mandatory core dependency | `package.json` | Remove line | 2 min |

**All fixes are safe** - no breaking changes, no impact on functionality.

---

## IMPLEMENTATION STEPS

### Step 1: Delete `/src/integrations/prism.js`

**Command**:
```bash
rm htdocs/src/integrations/prism.js
```

**Verification**:
```bash
# Should return "not found" or empty
ls -la htdocs/src/integrations/prism.js 2>&1 | grep -i "cannot\|no such"
```

**Why Safe**:
- ✅ Not imported anywhere
- ✅ Functionality duplicated in plugin
- ✅ Plugin already handles highlighting

---

### Step 2: Delete `/src/integrations/prism-loader.js`

**Command**:
```bash
rm htdocs/src/integrations/prism-loader.js
```

**Verification**:
```bash
# Should return "not found" or empty
ls -la htdocs/src/integrations/prism-loader.js 2>&1 | grep -i "cannot\|no such"
```

**Why Safe**:
- ✅ Not imported anywhere
- ✅ Plugin has its own loader
- ✅ No code depends on this file

---

### Step 3: Remove `prismjs` from `package.json`

**Current** (line 52):
```json
  "dependencies": {
    "dompurify": "^3.3.0",
    "jsdom": "^27.1.0",
    "prismjs": "^1.30.0",
    "snarkdown": "^2.0.0"
  }
```

**After Fix**:
```json
  "dependencies": {
    "dompurify": "^3.3.0",
    "jsdom": "^27.1.0",
    "snarkdown": "^2.0.0"
  }
```

**Command** (using npm):
```bash
npm uninstall prismjs
```

**Verification**:
```bash
# Should show "not installed"
npm list prismjs 2>&1 | grep -i "not installed\|extraneous"
```

**Why Safe**:
- ✅ Prism is loaded dynamically by plugin
- ✅ Plugin loads from CDN (not npm)
- ✅ No code imports prismjs from node_modules

---

## VERIFICATION CHECKLIST

### Before Starting

- [ ] Current branch is clean (no uncommitted changes)
- [ ] All tests pass
- [ ] Syntax highlighting works
- [ ] No console errors

### After Each Fix

**After Step 1 (Delete prism.js)**:
```bash
# Verify file is gone
test ! -f htdocs/src/integrations/prism.js && echo "✅ PASS" || echo "❌ FAIL"

# Verify no imports
grep -r "from.*integrations/prism['\"]" htdocs/src/ && echo "❌ FAIL: Still imported" || echo "✅ PASS"
```

**After Step 2 (Delete prism-loader.js)**:
```bash
# Verify file is gone
test ! -f htdocs/src/integrations/prism-loader.js && echo "✅ PASS" || echo "❌ FAIL"

# Verify no imports
grep -r "from.*integrations/prism-loader" htdocs/src/ && echo "❌ FAIL: Still imported" || echo "✅ PASS"
```

**After Step 3 (Remove from package.json)**:
```bash
# Verify removed from package.json
grep -q '"prismjs"' package.json && echo "❌ FAIL: Still in package.json" || echo "✅ PASS"

# Verify npm uninstall worked
npm list prismjs 2>&1 | grep -q "not installed" && echo "✅ PASS" || echo "❌ FAIL"
```

### Final Verification

```bash
# Run all checks
echo "=== Checking deleted files ==="
test ! -f htdocs/src/integrations/prism.js && echo "✅ prism.js deleted" || echo "❌ prism.js still exists"
test ! -f htdocs/src/integrations/prism-loader.js && echo "✅ prism-loader.js deleted" || echo "❌ prism-loader.js still exists"

echo ""
echo "=== Checking package.json ==="
grep -q '"prismjs"' package.json && echo "❌ prismjs still in package.json" || echo "✅ prismjs removed"

echo ""
echo "=== Checking for orphaned imports ==="
grep -r "from.*integrations/prism" htdocs/src/ && echo "❌ Orphaned imports found" || echo "✅ No orphaned imports"

echo ""
echo "=== Testing plugin functionality ==="
npm run build 2>&1 | grep -i "error" && echo "❌ Build failed" || echo "✅ Build successful"
```

---

## FUNCTIONAL TESTING

### Test 1: Plugin Still Loads

**Steps**:
1. Open browser to `http://localhost:8080/docs/dev/`
2. Check browser console for errors
3. Verify code blocks are highlighted

**Expected**:
- ✅ No errors about missing files
- ✅ Syntax highlighting works
- ✅ Line numbers display (if enabled)

### Test 2: Plugin Can Be Disabled

**Steps**:
1. Edit `app-config.json`
2. Remove or comment out the `prism-syntax-highlighter` plugin entry
3. Reload page

**Expected**:
- ✅ Code blocks display without highlighting
- ✅ No console errors

### Test 3: Settings Panel Works

**Steps**:
1. Click the code settings button (</> icon)
2. Toggle options
3. Verify changes apply

**Expected**:
- ✅ Settings panel opens/closes
- ✅ Options toggle correctly
- ✅ Changes persist on reload

---

## ROLLBACK PLAN

If anything breaks, you can rollback:

```bash
# Restore deleted files from git
git checkout HEAD -- htdocs/src/integrations/prism.js
git checkout HEAD -- htdocs/src/integrations/prism-loader.js

# Restore package.json
git checkout HEAD -- package.json

# Reinstall dependencies
npm install
```

---

## EXPECTED OUTCOMES

### What Will Improve

✅ **Plugin Architecture Compliance**
- Plugin is now fully self-contained
- Can be removed by config only
- No core framework dependencies

✅ **Code Cleanliness**
- Removes duplicate code
- Removes unused legacy files
- Clearer separation of concerns

✅ **Bundle Size**
- Reduces npm dependencies
- Users not using plugin don't get Prism

✅ **Maintainability**
- Single source of truth for highlighting logic
- Easier to update or replace plugin

### What Will NOT Change

✅ **Functionality**
- Syntax highlighting still works
- All features still available
- No user-facing changes

✅ **Performance**
- No performance impact
- Plugin still loads from CDN

✅ **Configuration**
- app-config.json unchanged
- Plugin options unchanged

---

## COMMIT MESSAGE TEMPLATE

```
refactor: remove core framework Prism.js dependencies

- Delete /src/integrations/prism.js (duplicate event listener)
- Delete /src/integrations/prism-loader.js (unused legacy code)
- Remove prismjs from package.json dependencies

This ensures the Prism plugin is fully self-contained and compliant
with PhantomSPA's plugin architecture principles. The plugin now
manages all Prism.js loading and highlighting independently.

Fixes: Plugin architecture violation
Related: PRISM_CODEBASE_AUDIT.md
```

---

## NEXT STEPS (OPTIONAL ENHANCEMENTS)

After the critical fixes, consider:

1. **Move debug utilities** (5 min)
   - Move `/src/plugins/prism/prism-debug.js` → `/src/tests/prism-debug.js`
   - Update imports in test files

2. **Refactor config file** (30 min)
   - Split `prism-config.js` into smaller modules
   - Improves maintainability

3. **Add unit tests** (1 hour)
   - Test plugin loader
   - Test configuration manager
   - Test highlighting logic

4. **Update documentation** (15 min)
   - Document per-block directive syntax
   - Add troubleshooting guide

---

## SUPPORT & QUESTIONS

**Q: Will this break existing installations?**  
A: No. The plugin still works the same way. Users just need to install prismjs separately if they want the plugin.

**Q: What if someone is importing from `/src/integrations/prism.js`?**  
A: Search the codebase first: `grep -r "from.*integrations/prism" .` - it's not imported anywhere.

**Q: Can I do this incrementally?**  
A: Yes. Each fix is independent. You can do them one at a time.

**Q: Do I need to update tests?**  
A: No. The plugin tests don't depend on the integration files.

---

## SUMMARY

| Item | Status | Action |
|------|--------|--------|
| Duplicate event listener | ❌ VIOLATION | Delete file |
| Unused loader | ❌ VIOLATION | Delete file |
| Mandatory dependency | ❌ VIOLATION | Remove from package.json |
| Plugin functionality | ✅ WORKING | No changes needed |
| Architecture compliance | ⚠️ PENDING | After fixes: ✅ COMPLIANT |

**Ready to proceed?** Follow the implementation steps above.

