# PhantomSPA Documentation - Heading Icons Style Guide

**Version**: 1.0  
**Last Updated**: 2025-11-03  
**Audience**: Developers, Designers, Contributors

---

## Overview

PhantomSPA documentation pages use **inline icons** in markdown headings to provide visual branding and improve page recognition. The primary icon (`pSPA.icon.png`) appears in page titles across all documentation pages, creating a consistent visual identity.

**Key Features**:
- ✅ Font-relative sizing (scales with heading text)
- ✅ Automatic responsive behavior (no media queries needed)
- ✅ Consistent 90% icon-to-text ratio across all viewport sizes
- ✅ Proper vertical alignment and spacing

---

## Markdown Syntax

### Standard Page Title (H1)

Use this syntax for all documentation page titles:

```markdown
# ![pSPA.icon.png](/src/assets/images/pSPA.icon.png) API Reference
```

**Components**:
- `#` - H1 heading marker
- `![pSPA.icon.png]` - Image alt text (for accessibility)
- `(/src/assets/images/pSPA.icon.png)` - Absolute path to icon
- `API Reference` - Page title text

**Result**: Icon appears inline before the heading text, scaled to 90% of the H1 font size.

---

### Special Case: Intro Page (Banner)

The intro page uses a title banner instead of the icon:

```markdown
# ![PhantomSPA Title Banner](/src/assets/images/pSPA.title-banner.png)
```

**Styling**: The banner displays at 50% width, centered, as a block element (not inline).

---

### Subheadings (H2-H6)

Icons can also be used in subheadings (though rarely needed):

```markdown
## ![pSPA.icon.png](/src/assets/images/pSPA.icon.png) Section Title
```

**Styling**: Same 0.9em ratio, scales with the subheading font size.

---

## CSS Implementation

### Font-Relative Sizing

Icons use **em units** for font-relative sizing:

```css
.doc-page.md > h1:first-child img[src$="pSPA.icon.png"] {
    height: 0.9em;             /* 90% of H1 font size */
    width: auto;               /* maintain aspect ratio */
    vertical-align: middle;    /* align with text baseline */
    margin-right: 0.3em;       /* proportional spacing */
    display: inline-block;
}
```

**File**: `htdocs/docs/dev/css/prose.css` (lines 17-23)

---

### Selector Specificity

The CSS selector targets **only the first H1** (page title), not nested H1 elements:

```css
.doc-page.md > h1:first-child img[src$="pSPA.icon.png"]
```

**Breakdown**:
- `.doc-page.md` - Markdown content wrapper (added by router)
- `>` - Direct child combinator (not descendants)
- `h1:first-child` - Only the first H1 element
- `img[src$="pSPA.icon.png"]` - Images ending with this filename

**Why?** Prevents styling icons in nested H1 elements within the page content.

---

## Sizing Rationale

### Why 0.9em?

**Visual Balance**: 
- `1.0em` (100%) would make the icon too large, competing with text
- `0.8em` (80%) would make the icon too small, losing visual impact
- `0.9em` (90%) provides optimal balance and readability

**Industry Standard**: 
- Most design systems use 0.8em - 1.0em for inline heading icons
- 0.9em is a common choice for branding icons

---

### Why em instead of px?

**Fixed Pixels (❌ Don't Use)**:
```css
height: 28px;  /* Icon doesn't scale with heading */
```

**Problems**:
- Icon stays 28px regardless of heading size
- H1 scales from 38.4px (mobile) to 56px (desktop)
- Icon-to-text ratio varies: 73% → 50%
- Requires manual media queries for responsive sizing

**Font-Relative (✅ Use This)**:
```css
height: 0.9em;  /* Icon scales with heading */
```

**Benefits**:
- Icon automatically scales with H1 font size
- Maintains consistent 90% ratio at all viewport sizes
- No media queries needed
- Works with any heading font size changes

---

### Why em instead of rem?

**rem** = Relative to root `<html>` font size (usually 16px)  
**em** = Relative to parent element font size (H1)

**Example**:
- H1 font size: `3.5rem` (56px)
- Icon with `0.9rem`: 14.4px (too small! ❌)
- Icon with `0.9em`: 50.4px (correct! ✅)

**Conclusion**: Use `em` to scale with the heading, not the global font size.

---

## Scaling Behavior

### Responsive Scaling Table

| Viewport | H1 Font Size | Icon Height (0.9em) | Icon/Text Ratio |
|----------|--------------|---------------------|-----------------|
| **Mobile** (320px) | 2.4rem (38.4px) | 34.6px | **90%** |
| **Tablet** (768px) | ~2.8rem (44.8px) | 40.3px | **90%** |
| **Desktop** (1920px) | 3.5rem (56px) | 50.4px | **90%** |

**H1 Font Size**: `clamp(2.4rem, 3.2vw + 1rem, 3.5rem)` (line 59 in `prose.css`)

**Key Benefit**: Icon maintains a **consistent 90% ratio** across all viewport sizes!

---

### Visual Comparison

**Before (Fixed Pixels)**:
```
Mobile:   [Icon: 28px] Heading: 38.4px  → Ratio: 73%
Desktop:  [Icon: 28px] Heading: 56px    → Ratio: 50%
```
❌ Icon appears larger on mobile, smaller on desktop (inconsistent)

**After (Font-Relative)**:
```
Mobile:   [Icon: 34.6px] Heading: 38.4px  → Ratio: 90%
Desktop:  [Icon: 50.4px] Heading: 56px    → Ratio: 90%
```
✅ Icon scales proportionally with heading (consistent)

---

## Usage Guidelines

### When to Use Icons

**✅ DO Use Icons**:
- Page title H1 on all documentation pages
- Branding and visual identity
- Improving page recognition in navigation

**❌ DON'T Use Icons**:
- In body text or paragraphs
- In code examples or technical content
- Excessively in subheadings (H2-H6)
- Multiple icons in the same heading (except intro page)

---

### Supported Icons

| Icon File | Usage | Styling |
|-----------|-------|---------|
| `pSPA.icon.png` | Page titles (H1) on all pages | Inline, 0.9em height |
| `pSPA.title-banner.png` | Intro page banner | Block, 50% width, centered |

**Icon Paths**: Always use absolute paths from root: `/src/assets/images/`

---

### Pages Using Icons

All 10 documentation pages use the pSPA icon in their H1 titles:

1. ✅ `/` (Intro) - Uses banner instead
2. ✅ `/getting-started` - Standard icon
3. ✅ `/setup` - Standard icon
4. ✅ `/cli` - Standard icon
5. ✅ `/api` - Standard icon
6. ✅ `/routing` - Standard icon
7. ✅ `/html-injection` - Standard icon
8. ✅ `/events` - Standard icon
9. ✅ `/plugins` - Standard icon
10. ✅ `/examples` - Standard icon

---

## Accessibility Considerations

### Alt Text

Always provide descriptive alt text:

```markdown
![pSPA.icon.png](/src/assets/images/pSPA.icon.png)
```

**Alt text**: `pSPA.icon.png` (describes the image)

**Screen readers**: Will announce "pSPA icon" before the heading text.

---

### Vertical Alignment

```css
vertical-align: middle;
```

**Purpose**: Aligns the icon with the vertical center of the text, creating visual balance.

**Alternatives**:
- `baseline` - Aligns with text baseline (icon appears higher)
- `text-bottom` - Aligns with bottom of text (icon appears lower)
- `middle` - Best for inline icons (✅ recommended)

---

### Spacing

```css
margin-right: 0.3em;
```

**Purpose**: Provides proportional spacing between icon and text.

**Why 0.3em?**:
- Scales with heading font size
- Provides comfortable visual separation
- Not too tight (0.1em) or too loose (0.5em)

---

## Testing Checklist

### Visual Verification

**For each documentation page**:

1. ✅ Icon appears before page title text
2. ✅ Icon is approximately 90% of heading text height
3. ✅ Icon is vertically centered with text
4. ✅ Spacing between icon and text is consistent
5. ✅ Icon maintains aspect ratio (not stretched)

---

### Responsive Testing

**Resize browser from 320px to 1920px**:

1. ✅ Icon scales smoothly with heading text
2. ✅ No sudden jumps or size changes
3. ✅ Icon-to-text ratio remains consistent
4. ✅ Spacing remains proportional

---

### DevTools Verification

**Inspect icon `<img>` element**:

```
Computed Styles:
- height: 0.9em (computed to ~34.6px - 50.4px)
- width: auto
- vertical-align: middle
- margin-right: 0.3em
- display: inline-block
```

**CSS Rule**:
- Selector: `.doc-page.md > h1:first-child img[src$="pSPA.icon.png"]`
- Source: `prose.css:17`

---

## Best Practices

### ✅ DO

- Use the standard markdown syntax for all page titles
- Use absolute paths from root (`/src/assets/images/`)
- Provide descriptive alt text
- Test icon appearance on multiple viewport sizes
- Maintain consistent icon usage across all pages

### ❌ DON'T

- Use fixed pixel values for icon sizing
- Use relative paths (`../../../src/assets/images/`)
- Add multiple icons to the same heading (except intro page)
- Override icon styles with inline CSS
- Use icons in body text or code examples

---

## Troubleshooting

### Icon Not Appearing

**Check**:
1. Markdown syntax is correct (space after `#`)
2. Image path is absolute from root
3. Icon file exists at `/src/assets/images/pSPA.icon.png`
4. Router wraps content in `.doc-page.md` container

---

### Icon Wrong Size

**Check**:
1. CSS rule is applied (DevTools → Styles panel)
2. No conflicting CSS rules overriding height
3. `height: 0.9em` (not fixed pixels)
4. H1 font size is set correctly

---

### Icon Not Scaling

**Check**:
1. Using `em` units (not `px` or `rem`)
2. No media queries overriding with fixed pixels
3. H1 uses responsive font size (clamp)
4. Browser zoom is at 100%

---

## Related Documentation

- **Technical Implementation**: `HEADING_ICONS_SELECTOR_FIX.md`
- **CSS Architecture**: `CSS_ARCHITECTURE_REORGANIZATION.md`
- **Prose Styles**: `htdocs/docs/dev/css/prose.css`
- **Router Implementation**: `htdocs/src/router.js`

---

## Summary

PhantomSPA documentation uses **font-relative heading icons** (0.9em) that scale proportionally with heading text across all viewport sizes. This approach provides:

- ✅ Consistent visual branding
- ✅ Automatic responsive behavior
- ✅ Optimal readability and balance
- ✅ Simplified CSS (no media queries)
- ✅ Future-proof scalability

**Standard Syntax**:
```markdown
# ![pSPA.icon.png](/src/assets/images/pSPA.icon.png) Page Title
```

**Result**: Professional, scalable, accessible heading icons across all PhantomSPA documentation pages. 🎉

