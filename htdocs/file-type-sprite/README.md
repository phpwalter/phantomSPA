# PhantomSPA File Type Icons

A CSS sprite-based icon system providing 28 file type icons in three sizes (16px, 32px, 64px).

## Quick Start

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="file-type-icons.css">

<!-- Use an icon -->
<span class="file-icon file-icon-md file-icon-pdf"></span>
```

## Demo

Open `index.html` in a browser to see all icons in action with interactive examples.

## Available Icons (28 total)

| Row       | Icons                                    |
|-----------|------------------------------------------|
| **Row 0** | folder, generic, txt, png, gif, eps, svg |
| **Row 1** | wav, mov, mp3, avi, zip, rar, exe        |
| **Row 2** | dll, csv, pdf, doc, xls, ppt, mod        |
| **Row 3** | html, css, js, php, py, json, perl       |

## Size Variants

| Class           | Size | Use Case                             |
|-----------------|------|--------------------------------------|
| `.file-icon-sm` | 16px | Inline text, file lists, compact UIs |
| `.file-icon-md` | 32px | File browsers, cards (default)       |
| `.file-icon-lg` | 64px | Featured displays, hero sections     |

## Usage Examples

### Basic Usage

```html
<!-- Small PDF icon -->
<span class="file-icon file-icon-sm file-icon-pdf"></span>

<!-- Medium JavaScript icon -->
<span class="file-icon file-icon-md file-icon-js"></span>

<!-- Large folder icon -->
<span class="file-icon file-icon-lg file-icon-folder"></span>
```

### Class Structure

Every icon requires:
1. **`.file-icon`** - Base class (required)
2. **`.file-icon-{size}`** - Size variant: `sm`, `md`, or `lg` (optional, defaults to md)
3. **`.file-icon-{type}`** - Icon type (required)

### Handling Unknown File Types

The **generic icon** (grid position row 0, column 1) serves as a fallback for unknown or unsupported file types like `.yaml`, `.toml`, `.lock`, `.env`, or any extension without a dedicated icon.

**Direct usage:**

```html
<!-- Explicitly use the generic icon -->
<span class="file-icon file-icon-md file-icon-generic"></span>
```

**Automatic fallback pattern:** Set the generic icon position as the default in the base class. Each icon type class then overrides these values:

```css
/* Base class defaults to generic icon */
.file-icon {
    --icon-row: 0;
    --icon-col: 1;  /* generic icon position */
    /* ...other styles... */
}

/* Each type class overrides the position */
.file-icon-folder { --icon-row: 0; --icon-col: 0; }
.file-icon-pdf    { --icon-row: 2; --icon-col: 2; }
/* etc. */
```

This approach is **simple** (no complex selectors), **scalable** (new icons just add their position), and **maintainable** (default set once in base class).

**Creating aliases** for unknown file types that should use the generic icon:

```css
.file-icon-yaml { --icon-row: 0; --icon-col: 1; }  /* Maps to generic */
.file-icon-toml { --icon-row: 0; --icon-col: 1; }  /* Maps to generic */
```

**Use cases for the generic icon:**
- `config.yaml` - Configuration files
- `settings.toml` - TOML configuration
- `package.lock` - Lock files
- `.env` - Environment files
- `Makefile` - Build files
- Any file type without a dedicated icon

## CSS Architecture

The system uses CSS custom properties for efficient sprite positioning:

```css
:root {
    --file-icon-png: url('./file.type-icons.png');
    --file-icon-size-sm: 16px;
    --file-icon-size-md: 32px;
    --file-icon-size-lg: 64px;
    --file-sprite-cols: 7;
    --file-sprite-rows: 4;
}

/* Base class handles all calculations */
.file-icon {
    --file-icon-size: var(--file-icon-size-md);
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--file-icon-size))
        calc((var(--icon-row, 0) * -1) * var(--file-icon-size));
}

/* Icon classes just set grid position */
.file-icon-pdf { --icon-row: 2; --icon-col: 2; }

/* Size classes just change the size variable */
.file-icon-lg { --file-icon-size: var(--file-icon-size-lg); }
```

## Sprite Grid Layout

```
Position: (row, col)

Row 0: folder(0,0)  generic(0,1)  txt(0,2)  png(0,3)  gif(0,4)  eps(0,5)  svg(0,6)
Row 1: wav(1,0)     mov(1,1)      mp3(1,2)  avi(1,3)  zip(1,4)  rar(1,5)  exe(1,6)
Row 2: dll(2,0)     csv(2,1)      pdf(2,2)  doc(2,3)  xls(2,4)  ppt(2,5)  mod(2,6)
Row 3: html(3,0)    css(3,1)      js(3,2)   php(3,3)  py(3,4)   json(3,5) perl(3,6)
```

## Extending the System

### Adding New File Types

1. Add the icon to the sprite sheet (`file.type-icons.png`)
2. Add a CSS class with the grid position:

```css
.file-icon-yaml { --icon-row: 0; --icon-col: 1; }
```

### Creating Aliases

Map multiple extensions to the same icon:

```css
.file-icon-mjs  { --icon-row: 3; --icon-col: 2; }  /* Same as .js */
.file-icon-docx { --icon-row: 2; --icon-col: 3; }  /* Same as .doc */
```

### Expanding the Grid

If adding new rows/columns, update the configuration:

```css
:root {
    --file-sprite-cols: 7;  /* Update if adding columns */
    --file-sprite-rows: 5;  /* Update if adding rows */
}
```

## PhantomSPA Integration

In PhantomSPA projects, use the original file location:

```html
<link rel="stylesheet" href="/src/assets/images/file.type-icons/file.type-icons.css">
```

### Prism Treeview Integration

For the Prism treeview plugin with custom icons (`-C` flag):

```css
/* In prism-syntax-highlighter.css */
pre[data-treeview-icons="custom"] .entry-name.ext-yaml:before {
    --icon-row: 0;
    --icon-col: 1;
}
```

## Comparison: Sprite vs Font Icons

| Aspect        | Sprite (This System)    | Icon Fonts           |
|---------------|-------------------------|----------------------|
| Colors        | ✅ Multi-color           | ❌ Single color       |
| Scalability   | ⚠️ Fixed sizes          | ✅ Any size           |
| File Size     | ~15KB PNG               | ~5-10KB WOFF2        |
| Accessibility | ✅ Decorative by default | ⚠️ Needs aria-hidden |

## Files in This Package

| File                  | Description                     |
|-----------------------|---------------------------------|
| `index.html`          | Interactive demo page           |
| `file-type-icons.css` | Standalone CSS (relative paths) |
| `file.type-icons.png` | Sprite sheet image              |
| `README.md`           | This documentation              |

## License

Part of the PhantomSPA project.
