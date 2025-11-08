# PhantomSPA Vendor Installation Script

This directory contains the vendor installation script for PhantomSPA, which automates copying necessary files from `node_modules` to `htdocs/library/vendor/` for local fallback support.

## Overview

PhantomSPA uses a hybrid approach for dependencies:
- **CDN-first**: Primary loading from CDNs for performance
- **Local fallback**: Vendor files provide offline/local development support
- **Plugin architecture**: Optional dependencies don't force installation on all users

## Usage

### Automatic Installation
The script runs automatically after `npm install`:
```bash
npm install  # Automatically runs vendor installation
```

### Manual Installation
```bash
# Run the script directly
node scripts/install-vendors.mjs

# Or use the npm script
npm run vendor:install
```

## Dependencies

### Required Dependencies
- **marked** (^17.0.0): Markdown parser for core functionality
  - Always installed as a core dependency
  - Required for Markdown rendering in PhantomSPA

### Optional Dependencies
- **dompurify**: HTML sanitization (security feature)
- **prismjs**: Syntax highlighting (plugin feature)

To install optional dependencies:
```bash
# For HTML sanitization support
npm install --save-optional dompurify

# For local Prism.js fallback (syntax highlighting plugin)
npm install --save-optional prismjs
```

## Prism.js Support

The script includes comprehensive Prism.js support for users who want local fallbacks:

### Core Files
- `prism.js` - Core Prism library
- `themes/prism-tomorrow.min.css` - Tomorrow theme

### Language Components
- `prism-markup.min.js` - HTML/XML support
- `prism-css.min.js` - CSS support  
- `prism-javascript.min.js` - JavaScript support
- `prism-json.min.js` - JSON support
- `prism-markdown.min.js` - Markdown support
- `prism-python.min.js` - Python support

### Plugin Files
- **Line Numbers**: `prism-line-numbers.min.js` + CSS
- **Line Highlight**: `prism-line-highlight.min.js` + CSS
- **Toolbar**: `prism-toolbar.min.js` + CSS
- **Copy to Clipboard**: `prism-copy-to-clipboard.min.js`
- **Show Language**: `prism-show-language.min.js`
- **Command Line**: `prism-command-line.min.js` + CSS

## Architecture Notes

### Why Optional Dependencies?
PhantomSPA follows a plugin architecture where:
- Core framework only includes essential dependencies
- Optional features (like syntax highlighting) don't force dependencies on all users
- Users can choose which features to install locally vs. use from CDN

### CDN vs Local Strategy
1. **Primary**: Load from CDN (fast, cached, up-to-date)
2. **Fallback**: Load from local vendor files (offline support)
3. **Development**: Local files useful for offline development

### File Organization
```
htdocs/library/vendor/
├── marked/
│   └── marked.esm.js
├── dompurify/          # Optional
│   └── purify.es.js
└── prism/              # Optional
    ├── prism.js
    ├── themes/
    ├── components/
    └── plugins/
```

## Script Output

The script provides detailed feedback:
- ✅ **Success**: File copied successfully with size info
- ⚠️ **Skipped**: Optional dependency not found (normal)
- ❌ **Failed**: Required dependency missing or copy failed

Example output:
```
🚀 PhantomSPA Vendor Installation

📋 Current Vendor Directory Status
ℹ Existing vendor directories: handlebars, marked, prism

📦 Installing Vendor Files
📋 Processing required dependencies (1):
  Processing marked (Markdown parser)...
✅ marked: node_modules/marked/lib/marked.esm.js → htdocs/library/vendor/marked/marked.esm.js (39.1 KB)

📋 Processing optional dependencies (19):
  Processing dompurify (HTML sanitizer)...
⚠ Optional source file not found: node_modules/dompurify/dist/purify.es.js (skipping)
  ...

📊 Installation Summary
ℹ Total vendors processed: 20
✅ Successfully installed: 1
⚠ Optional dependencies skipped: 19
ℹ To install optional dependencies:
  npm install --save-optional prismjs  # For syntax highlighting
  npm install --save-optional dompurify  # For HTML sanitization
✅ Vendor installation completed successfully! 🎉
```

## Maintenance

To add new vendor dependencies:
1. Add entry to `VENDOR_CONFIG` array in `install-vendors.mjs`
2. Specify source path in `node_modules`
3. Specify destination path in `htdocs/library/vendor`
4. Mark as `required: true` for core dependencies, `required: false` for optional
5. Test with and without the dependency installed
