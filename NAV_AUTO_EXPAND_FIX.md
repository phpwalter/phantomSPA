# Navigation Auto-Expand Fix

**Date**: 2025-11-03  
**Status**: ✅ Complete  
**Issue**: Parent sections were expanding when clicking parent page link (should only expand for child pages)

---

## Problem Statement

### **Incorrect Behavior (Before Fix)** ❌

When clicking on the "Getting Started" **link text** (not the chevron marker):

1. ✅ Page navigates to `/getting-started` (correct)
2. ❌ Submenu expands to show child pages (INCORRECT)

**Issue**: The `autoExpandActiveParent()` function was expanding the parent section even when the active page WAS the parent itself, not a child.

---

### **Correct Behavior (After Fix)** ✅

When clicking on the "Getting Started" **link text**:

1. ✅ Page navigates to `/getting-started`
2. ✅ Submenu remains collapsed (▸) - does NOT expand

When clicking on the **chevron marker** (▸/▾):

1. ✅ Submenu expands/collapses
2. ✅ No navigation occurs

**Key Principle**: Navigate (link) and expand (chevron) are **completely independent** actions.

---

## Root Cause

### **Original Code** - `htdocs/src/plugins/nav-tree.js` (Lines 163-184)

```javascript
function autoExpandActiveParent(nav) {
    const apply = () => {
        // Find the active link
        const activeLink = nav.querySelector('a.nav-link.active');
        if (!activeLink) return;

        // Find parent <details> element (if link is inside a submenu)
        let parent = activeLink.closest('details');

        // ❌ PROBLEM: Expands ANY parent <details>, even for parent page links
        while (parent) {
            parent.open = true;
            parent = parent.parentElement?.closest('details');
        }
    };

    window.addEventListener('popstate', apply);
    apply();
}
```

**Issue**: The function finds the closest `<details>` element and expands it, without checking if the active link is:
- **Parent page link** (inside `<summary>`) → Should NOT expand
- **Child page link** (inside submenu) → Should expand

---

## Solution Implemented

### **Fixed Code** - `htdocs/src/plugins/nav-tree.js` (Lines 163-191)

```javascript
function autoExpandActiveParent(nav) {
    const apply = () => {
        // Find the active link
        const activeLink = nav.querySelector('a.nav-link.active');
        if (!activeLink) return;

        // ✅ FIX: Check if the active link is inside a <summary> element
        // If it is, it's a parent page link - do NOT expand
        const isParentLink = activeLink.closest('summary') !== null;
        if (isParentLink) {
            return; // Parent page link - keep section collapsed
        }

        // Active link is in submenu (child page) - expand parent sections
        let parent = activeLink.closest('details');

        // Expand all parent <details> elements up the tree
        while (parent) {
            parent.open = true;
            parent = parent.parentElement?.closest('details');
        }
    };

    window.addEventListener('popstate', apply);
    apply();
}
```

**Key Change**: Added check for `activeLink.closest('summary')`:
- If link is inside `<summary>` → It's a parent page link → Return early (keep collapsed)
- If link is NOT in `<summary>` → It's a child page link → Expand parent sections

---

## DOM Structure Reference

### **Parent Page Link** (inside `<summary>`)

```html
<li>
  <details>
    <summary>
      <!-- ✅ Parent page link - inside <summary> -->
      <a class="nav-link active" href="/getting-started">
        <span class="icon">🚀</span>
        <span class="title">Getting Started</span>
      </a>
      <span class="toggle-marker"></span>
    </summary>
    <ul class="nav-list">
      <li><a href="/setup">Setup</a></li>
      <li><a href="/cli">Using the CLI</a></li>
    </ul>
  </details>
</li>
```

**Detection**: `activeLink.closest('summary') !== null` → **true**  
**Action**: Keep section collapsed (▸)

---

### **Child Page Link** (inside submenu)

```html
<li>
  <details>
    <summary>
      <a class="nav-link" href="/getting-started">
        <span class="icon">🚀</span>
        <span class="title">Getting Started</span>
      </a>
      <span class="toggle-marker"></span>
    </summary>
    <ul class="nav-list">
      <!-- ✅ Child page link - inside submenu (NOT in <summary>) -->
      <li><a class="nav-link active" href="/setup">Setup</a></li>
      <li><a href="/cli">Using the CLI</a></li>
    </ul>
  </details>
</li>
```

**Detection**: `activeLink.closest('summary') !== null` → **false**  
**Action**: Expand parent section (▾)

---

## Behavior Comparison

### **Scenario 1: Navigate to Parent Page** (`/getting-started`)

| Step | Before Fix | After Fix |
|------|------------|-----------|
| Click "Getting Started" link | Navigate to page | Navigate to page |
| Section state | ❌ Expands (▾) | ✅ Stays collapsed (▸) |
| Child pages visible | ❌ Yes | ✅ No |

**Visual (After Fix)**:
```
┌─────────────────────────────────────┐
│ 🏠 Introduction                     │
│ 🚀 Getting Started          ▸       │  ← Active, highlighted, COLLAPSED
│ 📚 API Reference            ▸       │
│ 🔧 Configuration            ▸       │
└─────────────────────────────────────┘
```

---

### **Scenario 2: Navigate to Child Page** (`/setup`)

| Step | Before Fix | After Fix |
|------|------------|-----------|
| Navigate to `/setup` | Navigate to page | Navigate to page |
| Section state | ✅ Expands (▾) | ✅ Expands (▾) |
| Child pages visible | ✅ Yes | ✅ Yes |

**Visual (After Fix)**:
```
┌─────────────────────────────────────┐
│ 🏠 Introduction                     │
│ 🚀 Getting Started          ▾       │  ← Auto-expanded
│   ├─ Setup                          │  ← Active, highlighted
│   └─ Using the CLI                  │
│ 📚 API Reference            ▸       │
│ 🔧 Configuration            ▸       │
└─────────────────────────────────────┘
```

---

## Logic Flow

### **Decision Tree**

```
User navigates to page
    ↓
Find active link (.nav-link.active)
    ↓
Is active link inside <summary>?
    ↓
   YES → Parent page link
    ↓
   Return early (keep collapsed)
    ↓
   ✅ Section stays collapsed (▸)

    ↓
   NO → Child page link
    ↓
   Find parent <details> element
    ↓
   Expand parent section
    ↓
   ✅ Section expands (▾)
```

---

## Testing Checklist

### **Test 1: Parent Page Link (Critical)**

**Steps**:
1. Navigate to `/getting-started` (or click "Getting Started" link text)
2. Observe navigation state

**Expected Results**:
- ✅ Page navigates to `/getting-started`
- ✅ "Getting Started" link is highlighted
- ✅ Section remains collapsed (▸)
- ✅ Child pages (Setup, CLI) are NOT visible
- ✅ Only clicking chevron marker expands the section

**Verification**:
```javascript
// In browser console:
const activeLink = document.querySelector('a.nav-link.active');
console.log('Active link:', activeLink.textContent);
console.log('Is in summary:', activeLink.closest('summary') !== null); // Should be true
console.log('Parent details open:', activeLink.closest('details')?.open); // Should be undefined (no parent details)
```

---

### **Test 2: Child Page Link**

**Steps**:
1. Navigate to `/setup` (child of "Getting Started")
2. Observe navigation state

**Expected Results**:
- ✅ Page navigates to `/setup`
- ✅ "Setup" link is highlighted
- ✅ "Getting Started" section auto-expands (▾)
- ✅ Child pages (Setup, CLI) are visible
- ✅ Active page is visible in navigation

**Verification**:
```javascript
// In browser console:
const activeLink = document.querySelector('a.nav-link.active');
console.log('Active link:', activeLink.textContent);
console.log('Is in summary:', activeLink.closest('summary') !== null); // Should be false
console.log('Parent details open:', activeLink.closest('details')?.open); // Should be true
```

---

### **Test 3: Chevron Independence**

**Steps**:
1. Navigate to `/getting-started` (section collapsed)
2. Click chevron marker (▸)
3. Observe section expands (▾)
4. Click chevron marker again (▾)
5. Observe section collapses (▸)

**Expected Results**:
- ✅ Chevron click expands/collapses section
- ✅ No navigation occurs
- ✅ Page remains on `/getting-started`
- ✅ Link and chevron are independent controls

---

## Files Modified

| File | Lines | Description |
|------|-------|-------------|
| `htdocs/src/plugins/nav-tree.js` | 163-191 | Add parent link detection in `autoExpandActiveParent()` |
| `NAV_COLLAPSE_BY_DEFAULT.md` | 89-131 | Updated function documentation |
| `NAV_COLLAPSE_BY_DEFAULT.md` | 333-347 | Updated test cases |
| `NAV_AUTO_EXPAND_FIX.md` | NEW | This document |

---

## Code Change Summary

**Single Line Addition** (Line 174):
```javascript
const isParentLink = activeLink.closest('summary') !== null;
```

**Early Return** (Lines 175-177):
```javascript
if (isParentLink) {
    return; // Parent page link - keep section collapsed
}
```

**Impact**: Prevents auto-expansion when navigating to parent pages, while preserving auto-expansion for child pages.

---

## Benefits Achieved

1. ✅ **Correct UX** - Parent page links don't expand sections
2. ✅ **Independent controls** - Link (navigate) and chevron (expand) are separate
3. ✅ **Clean navigation** - Sections only expand when necessary
4. ✅ **Intuitive behavior** - Matches user expectations
5. ✅ **Minimal code change** - Simple, elegant fix
6. ✅ **No side effects** - Child page auto-expand still works
7. ✅ **Backward compatible** - Doesn't break existing functionality

---

## Summary

The navigation auto-expand feature now correctly distinguishes between:

- **Parent page links** (inside `<summary>`) → Section stays collapsed (▸)
- **Child page links** (inside submenu) → Parent section expands (▾)

This ensures that clicking a parent page link navigates to that page WITHOUT expanding the submenu, while clicking a child page link still auto-expands the parent section to show the active page.

**Key Fix**: Added `activeLink.closest('summary')` check to detect parent page links and return early without expanding. 🎉

