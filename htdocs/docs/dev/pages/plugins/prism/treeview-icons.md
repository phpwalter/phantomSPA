# Prism.js Treeview Plugin: Icon Systems & Customization

## Overview

The Prism.js treeview plugin displays file and folder structures with automatic icon rendering. PhantomSPA customizes the default icon system to use its own file type icon sprite system for a more visually rich and design-system-aligned experience.

This document explains both the native Prism.js icon system and the PhantomSPA customization approach.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Native Prism.js Icon System](#native-prismjs-icon-system)
3. [PhantomSPA Icon Sprite System](#phantomspa-icon-sprite-system)
4. [Creating Custom Icon Systems](#creating-custom-icon-systems)
5. [How File Type Detection Works](#how-file-type-detection-works)
6. [CSS Class Structure](#css-class-structure)
7. [Comparison: Font Icons vs Sprites](#comparison-font-icons-vs-sprites)
8. [Adding New File Types](#adding-new-file-types)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Basic Treeview Activation

The Prism.js treeview plugin is activated using an HTML comment directive placed directly above your code block. The directive tells Prism.js to treat the code block as a treeview and apply special formatting.

**Directive Syntax:**
```html
<!-- prism: treeview -->
```

### Simple Example (Without Line Numbers)

```html
<!-- prism: treeview -->
<pre><code class="language-treeview">
project/
├── src/
│   ├── index.js
│   ├── styles.css
│   └── utils.js
├── docs/
│   └── README.md
└── package.json
</code></pre>
```

**Result:** A file tree without folder and file icons and line numbers.

### Example with Line Numbers

```html
<!-- prism: line-numbers treeview -->
<pre><code class="language-treeview">
project/
├── src/
│   ├── index.js
│   ├── styles.css
│   └── utils.js
├── docs/
│   └── README.md
└── package.json
</code></pre>
```

**Result:** A file tree with line numbers in the left gutter and without file type icons.

### Icon Display Modes

The Prism.js treeview plugin supports three icon display modes, controlled via flags in the HTML comment directive. This allows you to explicitly choose which icon system to use per code block.

#### **Mode 1: No Icons (Default)**

**Directive:** `<!-- prism: treeview -->`

**Behavior:** Display file tree structure without any icons. Only tree characters and filenames are shown.

**Use case:** Minimal display, text-only trees, when icons are not needed.

**Example:**
```html
<!-- prism: treeview -->
<pre><code class="language-treeview">
project/
├── src/
│   ├── index.js
│   └── styles.css
└── README.md
</code></pre>
```

**Result:** Clean tree structure with no icons.

---

#### **Mode 2: Native Icons (-N flag)**

**Directive:** `<!-- prism: treeview -N -->`

**Behavior:** Use Prism.js native PrismTreeview icon font (12 predefined icons). Lightweight and standard Prism.js appearance.

**Use case:** Lightweight display, standard Prism.js look, when you want minimal file size.

**What you get:**
- Generic file icon for most files
- Folder icon for directories
- Specific icons for: images, audio, video, text, code, archives, PDF, Excel, PowerPoint, Word

**Example:**
```html
<!-- prism: treeview -N -->
<pre><code class="language-treeview">
project/
├── 📁 src/
│   ├── 🟪 index.js
│   └── 🟦 styles.css
└── 📋 README.md
</code></pre>
```

**Result:** Tree structure with Prism's native font-based icons.

---

#### **Mode 3: Custom Icons (-C flag)**

**Directive:** `<!-- prism: treeview -C -->`

**Behavior:** Use custom icon system (PhantomSPA sprites or developer-created). Design-system-aligned, branded appearance with 28+ icons.

**Use case:** Design-system-aligned display, branded appearance, when you want rich visual design.

**What you get (PhantomSPA):**
- 📁 Folder icon for directories
- 🟨 JavaScript icon for `.js` and `.mjs` files
- 🟦 CSS icon for `.css` files
- 🟪 JSON icon for `.json` files
- 🖼️ PNG icon for `.png` files
- 📄 PDF icon for `.pdf` files
- 📋 Generic icon for unknown file types
- Plus 21 more language-specific and file-type icons

**Example:**
```html
<!-- prism: treeview -C -->
<pre><code class="language-treeview">
📁 project/
├── 📁 src/
│   ├── 🟪 index.js
│   └── 🟦 styles.css
└── 📋 README.md
</code></pre>
```

**Result:** Tree structure with PhantomSPA's custom sprite-based icons.

---

#### **Comparison Table**

| Feature           | No Icons   | Native (-N)   | Custom (-C)   |
|-------------------|------------|---------------|---------------|
| **Directive**     | `treeview` | `treeview -N` | `treeview -C` |
| **Icon Count**    | 0          | 12            | 28+           |
| **Icon Type**     | None       | Font-based    | Sprite-based  |
| **File Size**     | Minimal    | ~2KB          | ~15KB         |
| **Scalability**   | N/A        | Infinite      | Fixed sizes   |
| **Colors**        | N/A        | Monochrome    | Multi-color   |
| **Design System** | N/A        | Generic       | Branded       |
| **Use Case**      | Minimal    | Lightweight   | Rich design   |

### Complete Working Example

Here's a complete HTML example showing all three icon display modes:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Treeview Icon Modes Example</title>

    <!-- Prism.js CSS -->
    <link rel="stylesheet" href="/library/vendor/prism/prism.min.css">

    <!-- Prism Treeview Plugin CSS -->
    <link rel="stylesheet" href="/library/vendor/prism/plugins/treeview/prism-treeview.css">

    <!-- PhantomSPA Prism Customization (required for -C flag) -->
    <link rel="stylesheet" href="/src/plugins/prism/prism-syntax-highlighter.css">

    <!-- File Type Icons Sprite CSS (required for -C flag) -->
    <link rel="stylesheet" href="/src/assets/images/file.type-icons/file.type-icons.css">
</head>
<body>
    <h1>Treeview Icon Display Modes</h1>

    <!-- Mode 1: No Icons (default) -->
    <h2>Mode 1: No Icons</h2>
    <!-- prism: treeview -->
    <pre><code class="language-treeview">
📁 project/
├── 📁 src/
│   ├── 🟪 index.js
│   └── 🟦 styles.css
└── 📋 README.md
└── 🟪 package.json
    </code></pre>

    <!-- Mode 2: Native Icons (-N flag) -->
    <h2>Mode 2: Native Icons</h2>
    <!-- prism: treeview -N -->
    <pre><code class="language-treeview">
📁 project/
├── 📁 src/
│   ├── 🟪 index.js
│   └── 🟦 styles.css
└── 📋 README.md
└── 🟪 package.json
    </code></pre>

    <!-- Mode 3: Custom Icons (-C flag) -->
    <h2>Mode 3: Custom Icons (PhantomSPA)</h2>
    <!-- prism: treeview -C -->
    <pre><code class="language-treeview">
📁 project/
├── 📁 src/
│   ├── 🟪 index.js
│   └── 🟦 styles.css
└── 📋 README.md
└── 🟪 package.json
    </code></pre>

    <!-- Mode 3 with Line Numbers -->
    <h2>Mode 3 with Line Numbers</h2>
    <!-- prism: line-numbers treeview -C -->
    <pre><code class="language-treeview">
phantomSPA/
├── .github/
│   └── workflows/
│       ├── build.yml
│       ├── test.yml
│       └── deploy.yml
├── htdocs/
│   ├── src/
│   │   ├── core/
│   │   │   ├── router.js
│   │   │   ├── app.js
│   │   │   └── plugin-manager.js
│   │   ├── plugins/
│   │   │   ├── prism/
│   │   │   │   ├── prism-syntax-highlighter.js
│   │   │   │   ├── prism-syntax-highlighter.css
│   │   │   │   └── prism-config.js
│   │   │   └── markdown/
│   │   │       ├── markdown-processor.js
│   │   │       └── markdown-processor.css
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   │   ├── prog.lang-icons/
│   │   │   │   │   ├── prog.lang-icons.png
│   │   │   │   │   └── prog.lang-icons.css
│   │   │   │   └── file.type-icons/
│   │   │   │       ├── file.type-icons.png
│   │   │   │       └── file.type-icons.css
│   │   │   └── styles/
│   │   │       ├── styles.css
│   │   │       └── prose.css
│   │   └── utilities/
│   │       ├── helpers.js
│   │       ├── logger.js
│   │       └── cache.js
│   ├── docs/
│   │   └── dev/
│   │       ├── conf/
│   │       │   ├── app-config.json
│   │       │   ├── nav.json
│   │       │   └── settings.json
│   │       ├── css/
│   │       │   ├── styles.css
│   │       │   └── theme.css
│   │       └── pages/
│   │           ├── index.md
│   │           ├── getting-started.md
│   │           └── guides/
│   │               ├── setup.md
│   │               └── plugins.md
│   └── tests/
│       ├── test-prism.html
│       ├── test-router.html
│       └── test-plugins.html
├── .gitignore
├── .eslintrc.json
├── package.json
├── package-lock.json
├── build.mjs
├── README.md
└── LICENSE
    </code></pre>

    <!-- Prism.js JavaScript -->
    <script src="/library/vendor/prism/prism.min.js"></script>

    <!-- Prism Treeview Plugin JavaScript -->
    <script src="/library/vendor/prism/plugins/treeview/prism-treeview.js"></script>

    <!-- PhantomSPA Prism Plugin -->
    <script src="/src/plugins/prism/prism-syntax-highlighter.js"></script>
</body>
</html>
```

### Key Points

- **Directive placement:** The `<!-- prism: treeview [flags] -->` comment must appear directly above the `<pre><code>` block
- **Language class:** Always use `class="language-treeview"` on the `<code>` element
- **Tree characters:** Use standard tree characters: `├──`, `│`, `└──`, `─`
- **Folder marker:** End folder names with `/` (e.g., `src/`)
- **File extensions:** Include file extensions (e.g., `.js`, `.css`, `.json`)
- **Icon flags:** Use `-N` for native icons or `-C` for custom icons (omit for no icons)
- **Flag combinations:** Flags can be combined with other directives (e.g., `<!-- prism: line-numbers treeview -C -->`)
- **CSS requirements:** For `-C` flag, ensure `prism-syntax-highlighter.css` and `file.type-icons.css` are loaded

### Quick Reference

| Feature                     | Syntax                                     | Example            |
|-----------------------------|--------------------------------------------|--------------------|
| **Treeview (no icons)**     | `<!-- prism: treeview -->`                 | Default mode       |
| **Treeview (native icons)** | `<!-- prism: treeview -N -->`              | Prism font icons   |
| **Treeview (custom icons)** | `<!-- prism: treeview -C -->`              | PhantomSPA sprites |
| **With line numbers**       | `<!-- prism: line-numbers treeview -C -->` | Combined flags     |
| **Mark folder**             | End with `/`                               | `src/`             |
| **Mark file**               | Include extension                          | `index.js`         |
| **Mark dotfile**            | Start with `.`                             | `.gitignore`       |
| **Tree branch**             | `├──`                                      | Horizontal branch  |
| **Tree vertical**           | `│`                                        | Vertical line      |
| **Tree last**               | `└──`                                      | Last branch        |

---

## Native Prism.js Icon System

### Icon Font: PrismTreeview

Prism.js uses a **custom icon font** called "PrismTreeview" to display file type icons.

**Key characteristics:**
- **Format**: WOFF (Web Open Font Format)
- **Embedding**: Base64 encoded directly in CSS
- **Icon Count**: 12 predefined icons
- **Access Method**: Unicode escape sequences (e.g., `\ea01` for file)

### Available Icons

| Icon       | Unicode | File Types                                                                |
|------------|---------|---------------------------------------------------------------------------|
| File       | `\ea01` | Default for unknown types                                                 |
| Folder     | `\ea02` | Directories (`.dir` class)                                                |
| Image      | `\ea03` | `.png`, `.jpg`, `.gif`, `.svg`, `.eps`, `.bmp`, `.tiff`                   |
| Audio      | `\ea04` | `.mp3`, `.wav`, `.flac`, `.aac`, `.ogg`, `.oga`, `.au`, `.cda`, `.wma`    |
| Video      | `\ea05` | `.mp4`, `.avi`, `.mov`, `.mkv`, `.flv`, `.mpeg`, `.mpg`, `.webm`, `.ogv`  |
| Text       | `\ea06` | `.md`, `.txt`, `.csv`, `.log`, `.cfg`, `.conf`, `.config`, `.ini`, `.nfo` |
| Code       | `\ea07` | `.js`, `.css`, `.html`, `.php`, `.java`, `.c`, `.cpp`, `.xml`, `.rb`      |
| Archive    | `\ea08` | `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.bz2`, `.tgz`, `.bz`               |
| PDF        | `\ea09` | `.pdf`                                                                    |
| Excel      | `\ea0a` | `.xls`, `.xlsx`                                                           |
| PowerPoint | `\ea0b` | `.ppt`, `.pps`, `.pptx`                                                   |
| Word       | `\ea0c` | `.doc`, `.docm`, `.docx`                                                  |

### How It Works

**1. JavaScript Detection** (`prism-treeview.js`)

The Prism.js hook detects file types and adds CSS classes:

```javascript
Prism.hooks.add('wrap', function (env) {
    if (env.language === 'treeview' && env.type === 'entry-name') {
        var classes = env.classes;
        
        // Detect folders (ending with /)
        if (/(^|[^\\])\/\s*$/.test(env.content)) {
            classes.push('dir');
        } else {
            // Extract file extension
            var parts = env.content.toLowerCase().split('.');
            while (parts.length > 1) {
                parts.shift();
                classes.push('ext-' + parts.join('-'));
            }
        }
        
        // Detect dotfiles
        if (env.content[0] === '.') {
            classes.push('dotfile');
        }
    }
});
```

**2. CSS Icon Mapping** (`prism-treeview.css`)

CSS selectors map classes to Unicode characters:

```css
.token.treeview-part .entry-name:before {
    content: "\ea01";  /* Default file icon */
    font-family: "PrismTreeview";
}

.token.treeview-part .entry-name.dir:before {
    content: "\ea02";  /* Folder icon */
}

.token.treeview-part .entry-name.ext-js:before {
    content: "\ea07";  /* Code icon for .js files */
}
```

---

## PhantomSPA Icon Sprite System

### Overview

PhantomSPA replaces Prism's native icon font with a **CSS sprite-based system** for enhanced visual design and consistency with the design system.

**Key characteristics:**
- **Format**: PNG sprite sheet (7 columns × 4 rows = 28 icons)
- **Sizes**: Small (16px), Medium (32px), Large (64px)
- **Colors**: Multi-color, design-system-aligned
- **Location**: `htdocs/src/assets/images/file.type-icons/`

### Sprite Grid Layout

```
Row 0: Folder, Generic, Text, PNG, GIF, EPS, SVG
Row 1: WAV, MOV, MP3, AVI, ZIP, RAR, EXE
Row 2: DLL, CSV, PDF, DOC, XLS, PPT, MOD
Row 3: HTML, CSS, JS, PHP, Python, JSON, Perl
```

### File Type Mappings

| Extension     | Icon       | Row | Col |
|---------------|------------|-----|-----|
| (folder)      | Folder     | 0   | 0   |
| `.html`       | HTML       | 3   | 0   |
| `.css`        | CSS        | 3   | 1   |
| `.js`, `.mjs` | JavaScript | 3   | 2   |
| `.json`       | JSON       | 3   | 5   |
| `.png`        | PNG        | 0   | 3   |
| `.svg`        | SVG        | 0   | 6   |
| `.pdf`        | PDF        | 2   | 2   |
| (unknown)     | Generic    | 0   | 1   |

### CSS Implementation

The override in `prism-syntax-highlighter.css` (lines 684-786):

```css
.token.treeview-part .entry-name:before {
    content: "";  /* No text content */
    display: inline-block;
    width: var(--file-icon-size-sm);
    height: var(--file-icon-size-sm);
    background-image: var(--file-icon-png);
    background-repeat: no-repeat;
    background-size: calc(var(--file-sprite-cols) * var(--file-icon-size-sm))
                     calc(var(--file-sprite-rows) * var(--file-icon-size-sm));
    vertical-align: middle;
    margin-right: 0.5rem;
}

.token.treeview-part .entry-name.ext-js:before {
    --icon-row: 3;
    --icon-col: 2;
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--file-icon-size-sm))
        calc((var(--icon-row, 0) * -1) * var(--file-icon-size-sm));
}
```

---

## Creating Custom Icon Systems

### Using PhantomSPA Custom Icons

PhantomSPA provides a ready-to-use custom icon system for treeview. To use it:

**1. Ensure CSS files are loaded:**

```html
<!-- PhantomSPA Prism Customization -->
<link rel="stylesheet" href="/src/plugins/prism/prism-syntax-highlighter.css">

<!-- File Type Icons Sprite CSS -->
<link rel="stylesheet" href="/src/assets/images/file.type-icons/file.type-icons.css">
```

**2. Use the `-C` flag in your directive:**

```html
<!-- prism: treeview -C -->
<pre><code class="language-treeview">
project/
├── src/
│   ├── index.js
│   └── styles.css
└── README.md
</code></pre>
```

**3. Extend PhantomSPA icons:**

To add support for additional file types, add CSS rules to `prism-syntax-highlighter.css`:

```css
/* Add support for .yml files */
.token.treeview-part .entry-name.ext-yml:before {
    --icon-row: 0;
    --icon-col: 1;  /* Use generic icon */
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--file-icon-size-sm))
        calc((var(--icon-row, 0) * -1) * var(--file-icon-size-sm));
}

/* Add support for .lock files */
.token.treeview-part .entry-name.ext-lock:before {
    --icon-row: 1;
    --icon-col: 4;  /* Use ZIP icon */
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--file-icon-size-sm))
        calc((var(--icon-row, 0) * -1) * var(--file-icon-size-sm));
}
```

---

### Creating Your Own Custom Icon System

You can create a completely custom icon system using either font-based or sprite-based icons.

#### **Option A: Font-Based Custom Icons**

**Step 1: Create a custom icon font**

Use a tool like [IcoMoon](https://icomoon.io/) or [FontForge](https://fontforge.org/) to create a WOFF font with your custom icons.

**Step 2: Create CSS with font-face declaration**

```css
@font-face {
    font-family: "MyCustomTreeviewIcons";
    src: url('/path/to/my-icons.woff') format('woff');
}

/* Base styles for all entries */
.token.treeview-part .entry-name:before {
    font-family: "MyCustomTreeviewIcons";
    content: "\e001";  /* Default file icon */
    margin-right: 0.5rem;
}

/* Folder icon */
.token.treeview-part .entry-name.dir:before {
    content: "\e002";
}

/* JavaScript icon */
.token.treeview-part .entry-name.ext-js:before {
    content: "\e003";
}

/* CSS icon */
.token.treeview-part .entry-name.ext-css:before {
    content: "\e004";
}
```

**Step 3: Load your CSS**

```html
<link rel="stylesheet" href="/path/to/my-custom-icons.css">
```

**Step 4: Use the `-C` flag**

```html
<!-- prism: treeview -C -->
<pre><code class="language-treeview">
project/
├── src/
│   ├── index.js
│   └── styles.css
└── README.md
</code></pre>
```

---

#### **Option B: Sprite-Based Custom Icons**

**Step 1: Create a sprite sheet**

Create a PNG image with your custom icons arranged in a grid (e.g., 7 columns × 4 rows for 28 icons).

**Step 2: Create CSS with sprite positioning**

```css
:root {
    --my-icon-png: url('/path/to/my-icons.png');
    --my-icon-size-sm: 16px;
    --my-icon-size-md: 32px;
    --my-icon-size-lg: 64px;
    --my-sprite-cols: 7;
    --my-sprite-rows: 4;
}

/* Base styles for all entries */
.token.treeview-part .entry-name:before {
    content: "";
    display: inline-block;
    width: var(--my-icon-size-sm);
    height: var(--my-icon-size-sm);
    background-image: var(--my-icon-png);
    background-repeat: no-repeat;
    background-size: calc(var(--my-sprite-cols) * var(--my-icon-size-sm))
                     calc(var(--my-sprite-rows) * var(--my-icon-size-sm));
    vertical-align: middle;
    margin-right: 0.5rem;
}

/* Folder icon - Row 0, Col 0 */
.token.treeview-part .entry-name.dir:before {
    --icon-row: 0;
    --icon-col: 0;
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--my-icon-size-sm))
        calc((var(--icon-row, 0) * -1) * var(--my-icon-size-sm));
}

/* JavaScript icon - Row 3, Col 2 */
.token.treeview-part .entry-name.ext-js:before {
    --icon-row: 3;
    --icon-col: 2;
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--my-icon-size-sm))
        calc((var(--icon-row, 0) * -1) * var(--my-icon-size-sm));
}

/* CSS icon - Row 3, Col 1 */
.token.treeview-part .entry-name.ext-css:before {
    --icon-row: 3;
    --icon-col: 1;
    background-position:
        calc((var(--icon-col, 0) * -1) * var(--my-icon-size-sm))
        calc((var(--icon-row, 0) * -1) * var(--my-icon-size-sm));
}
```

**Step 3: Load your CSS**

```html
<link rel="stylesheet" href="/path/to/my-custom-icons.css">
```

**Step 4: Use the `-C` flag**

```html
<!-- prism: treeview -C -->
<pre><code class="language-treeview">
project/
├── src/
│   ├── index.js
│   └── styles.css
└── README.md
</code></pre>
```

---

### CSS Class Structure for Custom Icons

Regardless of which approach you choose, the Prism.js treeview plugin automatically adds these CSS classes to entry elements:

| Class                    | Applied When          | Example               |
|--------------------------|-----------------------|-----------------------|
| `.entry-name`            | Always                | All entries           |
| `.entry-name.dir`        | Entry ends with `/`   | `src/`                |
| `.entry-name.ext-{type}` | File has extension    | `.ext-js`, `.ext-css` |
| `.entry-name.dotfile`    | Entry starts with `.` | `.gitignore`          |

**Multi-extension support:** Files like `foo.min.js` get multiple classes: `.ext-min-js .ext-js`

This allows you to:
1. Create specific styles for minified files (`.ext-min-js`)
2. Fall back to generic JavaScript styles (`.ext-js`)

---

## How File Type Detection Works

### Class Generation Process

1. **Prism.js parses** the treeview code block
2. **Hook detects** file type based on:
   - Trailing `/` → folder (adds `dir` class)
   - File extension → adds `ext-{extension}` class
   - Leading `.` → dotfile (adds `dotfile` class)
3. **CSS selectors** target these classes
4. **Icon displays** based on matched selector

### Example: JavaScript File

**Input:**
```
├── router.js
```

**Classes added:**
```html
<span class="token treeview-part entry-name ext-js">router.js</span>
```

**CSS selector matched:**
```css
.token.treeview-part .entry-name.ext-js:before
```

**Result:** JavaScript icon displays before filename

---

## CSS Class Structure

### Base Classes

| Class                    | Meaning            | Example               |
|--------------------------|--------------------|-----------------------|
| `.entry-name`            | Any file or folder | All entries           |
| `.entry-name.dir`        | Directory/folder   | `src/`                |
| `.entry-name.dotfile`    | Hidden file        | `.gitignore`          |
| `.entry-name.ext-{type}` | File extension     | `.ext-js`, `.ext-css` |

### Multi-Extension Support

Files with multiple extensions get multiple classes:

**Example:** `foo.min.js`

**Classes added:**
```
ext-min-js ext-js
```

**CSS matching order:**
1. `.entry-name.ext-min-js:before` (most specific)
2. `.entry-name.ext-js:before` (fallback)

This allows specific styling for minified files while falling back to generic JavaScript icon.

---

## Comparison: Font Icons vs Sprites

### Prism Native (Font Icons)

**Advantages:**
- ✅ Lightweight (~2KB embedded)
- ✅ Infinitely scalable
- ✅ Single color (easily customizable with CSS `color`)
- ✅ No external requests
- ✅ Simple CSS implementation

**Disadvantages:**
- ❌ Only 12 icons
- ❌ Generic appearance
- ❌ No language-specific icons
- ❌ Monochrome only
- ❌ Requires font rebuild to add icons

### PhantomSPA Sprites

**Advantages:**
- ✅ 28 distinct icons
- ✅ Language-specific (JS, CSS, JSON, etc.)
- ✅ Multi-color, professional design
- ✅ Consistent with design system
- ✅ Easy to extend (add to sprite)
- ✅ Better visual hierarchy

**Disadvantages:**
- ❌ Larger file size (~15KB PNG)
- ❌ Fixed pixel sizes (16/32/64px)
- ❌ More CSS rules needed
- ❌ Grid-based positioning
- ❌ Additional HTTP request (though cached)

---

## Adding New File Types

### To PhantomSPA Sprite System

**1. Add icon to sprite sheet** (`file.type-icons.png`)
   - Maintain 7×4 grid layout
   - Use consistent icon size

**2. Update CSS** (`file.type-icons.css`)
   ```css
   .file-icon-yaml { --icon-row: 0; --icon-col: 1; }
   ```

**3. Add treeview mapping** (`prism-syntax-highlighter.css`)
   ```css
   .token.treeview-part .entry-name.ext-yaml:before {
       --icon-row: 0;
       --icon-col: 1;
       background-position:
           calc((var(--icon-col, 0) * -1) * var(--file-icon-size-sm))
           calc((var(--icon-row, 0) * -1) * var(--file-icon-size-sm));
   }
   ```

**4. Test** in `test-prism.html`

---

## Troubleshooting

### Icons Not Displaying

**Problem:** Icons appear as blank spaces

**Solutions:**
1. Check CSS is loaded: `prism-syntax-highlighter.css`
2. Verify sprite image exists: `file.type-icons.png`
3. Check browser console for CSS errors
4. Verify file extensions match CSS selectors (lowercase)

### Icons Misaligned

**Problem:** Icons overlap with text

**Solutions:**
1. Check `margin-right` value (should be `0.5rem`)
2. Verify `width` and `height` match icon size
3. Check `vertical-align: middle` is applied
4. Verify `background-size` calculation is correct

### Wrong Icon Displaying

**Problem:** File shows generic icon instead of specific type

**Solutions:**
1. Check file extension is lowercase in CSS
2. Verify extension matches sprite mapping
3. Check CSS specificity (more specific selectors override generic)
4. Use browser DevTools to inspect applied CSS

---

## Related Files

- **JavaScript**: `htdocs/library/vendor/prism/plugins/treeview/prism-treeview.js`
- **Prism CSS**: `htdocs/library/vendor/prism/plugins/treeview/prism-treeview.css`
- **PhantomSPA Override**: `htdocs/src/plugins/prism/prism-syntax-highlighter.css` (lines 684-786)
- **Sprite CSS**: `htdocs/src/assets/images/file.type-icons/file.type-icons.css`
- **Sprite Image**: `htdocs/src/assets/images/file.type-icons/file.type-icons.png`
- **Test Page**: `htdocs/src/tests/test-prism.html` (lines 499-597)

---

## See Also

- [Prism.js Treeview Plugin Examples](./examples.md)
- [Prism.js Integration Guide](./integration.md)
- [Per-Block Configuration Examples](./per-block-examples.md)
