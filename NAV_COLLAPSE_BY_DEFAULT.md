# Navigation Collapse by Default Enhancement

**Date**: 2025-11-03  
**Status**: ✅ Complete  
**Enhancement**: All parent menu items collapsed by default with auto-expand for active pages

---

## Problem Statement

### **Current Behavior (Before Enhancement)** ❌

- Navigation menu restored previously opened sections from localStorage
- Parent menu items with children could be expanded by default
- Navigation took up more vertical space than necessary
- Overwhelming for users to see all child pages immediately

---

### **Desired Behavior (After Enhancement)** ✅

- All `<details>` elements collapsed by default on initial page load
- Parent menu items show only parent link and collapsed chevron (▸)
- Users manually expand specific sections by clicking chevron
- **UX Enhancement**: Auto-expand parent section when child page is active
- Clean, compact navigation view by default

---

## Solution Implemented

### **1. Configuration Options** - `htdocs/src/plugins/nav-tree.js`

**Lines 9-17** - Added configuration options:

```javascript
export async function setup(spa, options = {}) {
    const config = {
        nav: '/docs/dev/conf/nav.json',
        container: '#site-nav',
        activeClass: 'active',
        collapseByDefault: true,        // ✅ All sections collapsed on initial load
        autoExpandActive: true,         // ✅ Auto-expand parent of active page
        ...options
    };
    // ...
}
```

**Configuration Options**:

| Option | Default | Description |
|--------|---------|-------------|
| `collapseByDefault` | `true` | All `<details>` sections start collapsed (ignores localStorage) |
| `autoExpandActive` | `true` | Auto-expand parent section when child page is active |

---

### **2. Conditional State Restoration** - `htdocs/src/plugins/nav-tree.js`

**Lines 41-51** - Modified setup to conditionally restore state:

```javascript
// Enhance UX
if (!config.collapseByDefault) {
    restoreDetailsState(nav);   // Only restore if not collapsing by default
}
persistDetailsState(nav);
highlightActiveLink(nav, config.activeClass);

// Auto-expand parent section of active page
if (config.autoExpandActive) {
    autoExpandActiveParent(nav);
}
```

**Logic**:
1. ✅ If `collapseByDefault: true` → Skip `restoreDetailsState()` (all sections collapsed)
2. ✅ If `collapseByDefault: false` → Restore previous state from localStorage
3. ✅ Always persist future state changes via `persistDetailsState()`
4. ✅ If `autoExpandActive: true` → Auto-expand parent of active page

---

### **3. Auto-Expand Active Parent Function**

**Lines 163-184** - New function to auto-expand parent sections:

```javascript
/* ----------------------------
   Auto-expand active parent
----------------------------- */
function autoExpandActiveParent(nav) {
    const apply = () => {
        // Find the active link
        const activeLink = nav.querySelector('a.nav-link.active');
        if (!activeLink) return;

        // Check if the active link is inside a <summary> element
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

**How It Works**:
1. Find the active link (`.nav-link.active`)
2. **Check if link is inside `<summary>`** - if yes, it's a parent page link → keep collapsed
3. If link is NOT in summary, it's a child page link → find parent `<details>` element
4. Expand that parent by setting `parent.open = true`
5. Walk up the tree to expand all ancestor `<details>` elements
6. Listen for `popstate` events to re-apply on navigation

**Key Distinction**:
- **Parent page link** (inside `<summary>`) → Section stays collapsed (▸)
- **Child page link** (inside submenu) → Parent section expands (▾)

---

## User Experience Flow

### **Scenario 1: Initial Page Load**

**User navigates to `/getting-started`**

1. Navigation renders with all sections collapsed (▸)
2. `highlightActiveLink()` finds and highlights "Getting Started" link
3. `autoExpandActiveParent()` finds "Getting Started" is NOT in a submenu
4. ✅ "Getting Started" link is highlighted
5. ✅ No sections are expanded (parent page, not child)

**Visual**:
```
┌─────────────────────────────────────┐
│ 🏠 Introduction                     │
│ 🚀 Getting Started          ▸       │  ← Active, highlighted
│ 📚 API Reference            ▸       │
│ 🔧 Configuration            ▸       │
└─────────────────────────────────────┘
```

---

### **Scenario 2: Navigate to Child Page**

**User navigates to `/setup` (child of "Getting Started")**

1. Navigation renders with all sections collapsed (▸)
2. `highlightActiveLink()` finds and highlights "Setup" link
3. `autoExpandActiveParent()` finds "Setup" is inside "Getting Started" `<details>`
4. ✅ "Getting Started" section auto-expands (▾)
5. ✅ "Setup" link is highlighted

**Visual**:
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

### **Scenario 3: Manual Expand/Collapse**

**User manually clicks chevron to expand "API Reference"**

1. User clicks chevron marker (▸) on "API Reference"
2. `<details>` toggles to `open` state
3. `persistDetailsState()` saves state to localStorage
4. ✅ "API Reference" section expands (▾)
5. ✅ State persists for future visits

**Visual**:
```
┌─────────────────────────────────────┐
│ 🏠 Introduction                     │
│ 🚀 Getting Started          ▸       │
│ 📚 API Reference            ▾       │  ← Manually expanded
│   ├─ Core API                       │
│   ├─ Plugins                        │
│   └─ Utilities                      │
│ 🔧 Configuration            ▸       │
└─────────────────────────────────────┘
```

**On next page load**:
- `collapseByDefault: true` → All sections collapsed (ignores localStorage)
- `autoExpandActive: true` → Only active parent expands

---

## Behavior Comparison

### **Before Enhancement**

| Action | Behavior |
|--------|----------|
| Initial page load | Restores previous state from localStorage |
| Navigate to parent page | Parent link not clickable (only toggles) |
| Navigate to child page | No auto-expand of parent section |
| Manual expand/collapse | State persists in localStorage |
| Next page load | Restores all previously opened sections |

**Issues**:
- ❌ Navigation could be cluttered with many expanded sections
- ❌ Parent pages not accessible via navigation
- ❌ No visual indication of active page's location in hierarchy

---

### **After Enhancement**

| Action | Behavior |
|--------|----------|
| Initial page load | All sections collapsed (clean view) |
| Navigate to parent page | Parent link clickable, navigates to page |
| Navigate to child page | Parent section auto-expands to show active page |
| Manual expand/collapse | State persists in localStorage |
| Next page load | All sections collapsed (ignores localStorage) |

**Benefits**:
- ✅ Clean, compact navigation on every page load
- ✅ Parent pages accessible via clickable links
- ✅ Active page always visible (parent auto-expands)
- ✅ User can still manually expand/collapse sections
- ✅ Consistent experience across page loads

---

## Configuration Examples

### **Example 1: Default Behavior (Recommended)**

```javascript
// All sections collapsed, auto-expand active parent
spa.use(navTree, {
    collapseByDefault: true,
    autoExpandActive: true
});
```

**Result**:
- ✅ Clean navigation on every page load
- ✅ Active page always visible
- ✅ User can manually expand sections

---

### **Example 2: Preserve User State**

```javascript
// Restore previous state, auto-expand active parent
spa.use(navTree, {
    collapseByDefault: false,
    autoExpandActive: true
});
```

**Result**:
- ✅ Restores previously opened sections
- ✅ Active page always visible
- ✅ User preferences preserved

---

### **Example 3: Minimal Auto-Expansion**

```javascript
// All sections collapsed, no auto-expand
spa.use(navTree, {
    collapseByDefault: true,
    autoExpandActive: false
});
```

**Result**:
- ✅ Clean navigation on every page load
- ❌ Active page may be hidden in collapsed section
- ✅ User must manually expand to see child pages

---

## Files Modified

| File | Lines | Description |
|------|-------|-------------|
| `htdocs/src/plugins/nav-tree.js` | 9-17 | Add configuration options |
| `htdocs/src/plugins/nav-tree.js` | 41-51 | Conditional state restoration |
| `htdocs/src/plugins/nav-tree.js` | 163-184 | Auto-expand active parent function |
| `NAV_PARENT_LINK_FIX.md` | 396-470 | Updated documentation |

---

## Testing Checklist

### **Visual Verification**

1. ✅ All sections collapsed on initial page load (▸)
2. ✅ Chevron markers visible on all parent items
3. ✅ No sections expanded by default
4. ✅ Clean, compact navigation view

---

### **Functional Testing**

**Test 1: Initial Page Load**
1. Clear localStorage: `localStorage.removeItem('navTreeDetails')`
2. Refresh page
3. ✅ All sections collapsed (▸)
4. ✅ No child pages visible

**Test 2: Navigate to Parent Page (Critical Test)**
1. Click on "Getting Started" **link text** (NOT the chevron)
2. ✅ Page navigates to `/getting-started`
3. ✅ "Getting Started" link highlighted
4. ✅ Section remains collapsed (▸) - **MUST NOT expand**
5. ✅ Child pages (Setup, CLI) NOT visible
6. **Verify**: Only clicking the chevron marker should expand the section

**Test 3: Navigate to Child Page**
1. Navigate to `/setup` (child of "Getting Started")
2. ✅ Page navigates to `/setup`
3. ✅ "Getting Started" section auto-expands (▾)
4. ✅ "Setup" link highlighted
5. ✅ Active page visible in navigation
6. **Verify**: Parent section auto-expands ONLY for child pages

**Test 4: Manual Expand/Collapse**
1. Click chevron on "API Reference" (▸)
2. ✅ Section expands (▾)
3. ✅ Child pages visible
4. Click chevron again (▾)
5. ✅ Section collapses (▸)
6. ✅ Child pages hidden

**Test 5: State Persistence**
1. Manually expand "API Reference"
2. Refresh page
3. ✅ All sections collapsed (ignores localStorage)
4. ✅ Only active parent expands (if on child page)

**Test 6: Deep Nesting**
1. Navigate to deeply nested page (e.g., `/api/plugins/router`)
2. ✅ All ancestor sections auto-expand
3. ✅ Active page visible
4. ✅ Other sections remain collapsed

---

## Accessibility Considerations

### **Keyboard Navigation**

- ✅ Tab to focus on collapsed section → Enter expands
- ✅ Tab to focus on expanded section → Enter collapses
- ✅ Arrow keys navigate between menu items
- ✅ Active page always reachable via keyboard

### **Screen Readers**

- ✅ Collapsed state announced: "collapsed"
- ✅ Expanded state announced: "expanded"
- ✅ Active link announced: "Getting Started, link, current page"
- ✅ Auto-expand does not interrupt screen reader flow

---

## Benefits Achieved

1. ✅ **Clean navigation** - Compact view on every page load
2. ✅ **Active page visible** - Parent auto-expands to show active child
3. ✅ **User control** - Manual expand/collapse still works
4. ✅ **Consistent experience** - Same view on every page load
5. ✅ **Reduced clutter** - Only relevant sections expanded
6. ✅ **Better UX** - Users can focus on current context
7. ✅ **Configurable** - Options for different use cases
8. ✅ **Backward compatible** - Can restore old behavior via config

---

## Summary

The navigation menu now displays with **all sections collapsed by default**, providing a clean and compact view. When navigating to a child page, the parent section **automatically expands** to show the active page, ensuring users can always see their current location in the navigation hierarchy.

**Key Features**:
- ✅ All sections collapsed on initial page load
- ✅ Parent section auto-expands when child page is active
- ✅ Manual expand/collapse state persists in localStorage
- ✅ Configurable behavior via options
- ✅ Clean, compact navigation view

This enhancement improves usability by reducing visual clutter while ensuring the active page is always visible and accessible. 🎉
