# Layout Fixes - PhantomSPA Developer Docs

## Overview
Fixed the CSS layout to implement a fixed header/footer with scrollable middle content area. The layout now properly handles the viewport height and allows independent scrolling of the sidebar and main content.

## Changes Made to `styles.css`

### 1. Body Layout (Lines 53-62)
**Before:**
```css
body{
    margin:0;
    background:var(--bg);
    color:var(--fg);
    font:16px/1.55 var(--font);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
}
```

**After:**
```css
body{
    margin:0;
    background:var(--bg);
    color:var(--fg);
    font:16px/1.55 var(--font);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    display: flex;
    flex-direction: column;
}
```

**Reason:** Creates a flex container that stacks header, shell, and footer vertically. This allows the shell to flex and fill available space.

---

### 2. Header (Lines 69-85)
**Before:**
```css
.site-header{
    position:sticky; top:0; z-index:10;
    background: var(--panel);
    border-bottom:1px solid var(--panel-line);
}
.header-inner{
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 10px 16px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
}
```

**After:**
```css
.site-header{
    flex-shrink: 0;
    height: 52px;
    background: var(--panel);
    border-bottom:1px solid var(--panel-line);
    z-index:10;
}
.header-inner{
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 10px 16px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
    height: 100%;
}
```

**Changes:**
- Removed `position:sticky` (no longer needed with flex layout)
- Added `flex-shrink: 0` to prevent header from shrinking
- Added fixed `height: 52px` (calculated from padding: 10px top + 10px bottom + ~32px content)
- Added `height: 100%` to `.header-inner` to fill the header

---

### 3. Shell (Lines 110-120)
**Before:**
```css
.shell{
    max-width: var(--maxw);
    margin: 0 auto;
    display:grid;
    grid-template-columns: var(--sidebar) 1fr;
    gap: 18px;
    padding: 18px 16px 32px;
}
```

**After:**
```css
.shell{
    flex: 1;
    overflow: hidden;
    display:grid;
    grid-template-columns: var(--sidebar) 1fr;
    gap: 18px;
    padding: 18px 16px;
    max-width: var(--maxw);
    margin: 0 auto;
    width: 100%;
}
```

**Changes:**
- Added `flex: 1` to make shell grow and fill available space between header and footer
- Added `overflow: hidden` to contain scrollable children
- Removed bottom padding (32px) since footer is now fixed
- Reordered properties for clarity

---

### 4. Footer (Lines 123-138)
**Before:**
```css
.site-footer{
    background: var(--panel);
    border-top:1px solid var(--panel-line);
}
.footer-inner{
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 36px 16px 18px;
}
```

**After:**
```css
.site-footer{
    flex-shrink: 0;
    height: 52px;
    background: var(--panel);
    border-top:1px solid var(--panel-line);
    z-index:10;
}
.footer-inner{
    max-width: var(--maxw);
    margin: 0 auto;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
```

**Changes:**
- Added `flex-shrink: 0` to prevent footer from shrinking
- Added fixed `height: 52px` (same as header)
- Changed padding from `36px 16px 18px` to `10px 16px` (matches header)
- Added `display: flex`, `align-items: center`, `justify-content: center` to center content
- Added `height: 100%` to `.footer-inner`

---

### 5. Sidebar Navigation (Lines 172-175)
**Added:**
```css
#site-nav{
    overflow-y: auto;
    overflow-x: hidden;
}
```

**Reason:** Allows the sidebar to scroll independently when content overflows.

---

### 6. Main Content Area (Lines 517-520)
**Before:**
```css
.site-main{
    min-height: 60vh;
}
```

**After:**
```css
.site-main{
    overflow-y: auto;
    overflow-x: hidden;
}
```

**Reason:** Allows the main content to scroll independently when content overflows.

---

## Layout Structure

```
┌─────────────────────────────────────┐
│         HEADER (52px fixed)         │
├──────────────┬──────────────────────┤
│              │                      │
│   SIDEBAR    │   MAIN CONTENT       │
│  (scrolls)   │    (scrolls)         │
│              │                      │
├──────────────┴──────────────────────┤
│         FOOTER (52px fixed)         │
└─────────────────────────────────────┘
```

## Key Features

✅ **Fixed Header:** Always visible at top, 52px height
✅ **Fixed Footer:** Always visible at bottom, 52px height (same as header)
✅ **Scrollable Sidebar:** Independent scrolling for navigation
✅ **Scrollable Main:** Independent scrolling for content
✅ **Responsive:** Layout adapts to different screen sizes
✅ **No Page Scroll:** Only sidebar and main content scroll, not the entire page

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard CSS Flexbox (widely supported)
- No JavaScript required

