# PhantomSPA Vendor Icons Sprite System

A CSS sprite-based icon system providing **111 vendor and technology logos** in three size variants.

## Quick Start

1. Include the CSS file:
```html
<link rel="stylesheet" href="vendor-icons.css">
```

2. Use the icons:
```html
<span class="vendor-icon vendor-icon-md vendor-icon-github"></span>
<span class="vendor-icon vendor-icon-lg vendor-icon-react"></span>
<span class="vendor-icon vendor-icon-sm vendor-icon-nodejs"></span>
```

## Features

- **111 vendor icons** in a single PNG sprite
- **Three size variants**: 16px (sm), 32px (md), 64px (lg)
- **CSS custom properties** for easy customization
- **Grid-based positioning** using row/column coordinates
- **Single HTTP request** for all icons

## Size Variants

| Class | Size | Usage |
|-------|------|-------|
| `.vendor-icon-sm` | 16px | Inline text, compact UI |
| `.vendor-icon-md` | 32px | Default, buttons, lists |
| `.vendor-icon-lg` | 64px | Feature highlights, headers |

## Available Icons (111 total)

### Row 0: Operating Systems & Editors
`linux`, `air`, `atom`, `bower`, `c`, `chai`, `codemirror`, `codepen`, `composer`, `cordova`, `modernizr`

### Row 1: Frameworks & Services
`angular`, `apache`, `backbone`, `bitbucket`, `blackberry`, `bootstrap`, `couchdb`, `coveralls`, `css3`, `david-dm`, `mongodb`

### Row 2: Browsers & CMS
`chrome`, `chromium`, `code-climate`, `codeigniter`, `debian`, `django`, `drupal`, `editorconfig`, `fedora`, `firefox-dev`, `mysql`

### Row 3: Version Control & Browsers
`firefox-os`, `firefox`, `flash`, `flattr`, `font-awesome`, `git`, `gitbook`, `github`, `gitlab`, `gnu`, `nginx`

### Row 4: Build Tools & Web Standards
`gradle`, `grunt`, `gtk`, `gulp`, `h5bp`, `hbase`, `html5`, `humans-txt`, `ie`, `inch-ci`, `nodejs`

### Row 5: Mobile & Languages
`ios`, `java`, `jekyll`, `jquery`, `jsbin`, `json`, `android`, `lodash`, `lua`, `mariadb`, `npm`

### Row 6: Documentation & Package Managers
`marionette`, `markdown`, `mdn`, `mocha`, `nuget`, `opengl`, `openhub`, `opera`, `packagist`, `pear`, `perl`

### Row 7: Languages & Frameworks
`phantomjs`, `phonegap`, `php`, `polymer`, `postgresql`, `python`, `qt`, `react`, `redis`, `requirejs`, `ruby`

### Row 8: Databases & Version Control
`rubygems`, `safari`, `sourceforge`, `sourcegraph`, `sqlite`, `stack-overflow`, `svg`, `svn`, `symfony`, `titanium`, `tizen`

### Row 9: CI/CD & Operating Systems
`travis-ci`, `ubuntu`, `unity`, `versioneye`, `w3c`, `webgl`, `webkit`, `whatwg`, `windows8`, `wordpress`, `xamarin`

### Row 10: Build Tools
`yeoman`, `zend`

## CSS Architecture

### Custom Properties

```css
:root {
    --vendor-icon-png: url('./vendor-icons.png');
    --vendor-icon-size-sm: 16px;
    --vendor-icon-size-md: 32px;
    --vendor-icon-size-lg: 64px;
    --vendor-sprite-cols: 11;
    --vendor-sprite-rows: 11;
}
```

### Grid-Based Positioning

Each icon class defines its position using `--icon-row` and `--icon-col`:

```css
.vendor-icon-github { --icon-row: 3; --icon-col: 7; }
.vendor-icon-react  { --icon-row: 7; --icon-col: 7; }
.vendor-icon-nodejs { --icon-row: 4; --icon-col: 10; }
```

### Automatic Fallback

The base class defaults to the Linux icon (row 0, col 0). Elements without a specific vendor class automatically display this fallback:

```css
.vendor-icon {
    --icon-row: 0;
    --icon-col: 0;  /* linux icon position */
}
```

## Sprite Grid Layout

- **Dimensions**: 352px × 352px
- **Grid**: 11 columns × 11 rows
- **Icon size**: 32px × 32px (native)
- **Total cells**: 121 (111 used)

## Extending the System

### Adding New Icons

1. Add the icon to the sprite at the next available position
2. Create a CSS class:

```css
.vendor-icon-newvendor {
    --icon-row: 10;
    --icon-col: 2;
}
```

### Creating Aliases

```css
.vendor-icon-node    { --icon-row: 4; --icon-col: 10; }  /* alias for nodejs */
.vendor-icon-postgres { --icon-row: 7; --icon-col: 4; }  /* alias for postgresql */
```

## PhantomSPA Integration

When using within PhantomSPA, the icons integrate with the framework's CSS layer system:

```css
@layer tokens {
    :root {
        --vendor-icon-png: url('/src/assets/images/vendor-icons/vendor-icons.png');
    }
}
```

## Browser Support

- Modern browsers with CSS custom properties support
- Fallback values provided for older browsers
- `image-rendering: pixelated` for crisp scaling

## Files

| File | Description |
|------|-------------|
| `vendor-icons.css` | Standalone CSS with all icon classes |
| `vendor-icons.png` | Sprite image (352×352px) |
| `index.html` | Interactive demo page |
| `README.md` | This documentation |

## Comparison: Sprite vs Font Icons

| Feature | Sprite Icons | Font Icons |
|---------|--------------|------------|
| Color | Full color | Single color |
| Scaling | Pixelated at large sizes | Smooth at any size |
| HTTP requests | 1 (image) | 1-2 (font files) |
| File size | ~50KB | Varies |
| Accessibility | Decorative only | Can use ligatures |

---

*PhantomSPA Vendor Icons • 111 Icons • 3 Size Variants*

