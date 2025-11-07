# Prism.js Per-Block Configuration Examples

This document demonstrates the HTML comment directive syntax for configuring Prism.js features on a per-code-block basis.

---

## Example 1: Line Numbers + Line Highlighting

This code block has line numbers and highlights lines 2, 4, 5, and 6:

<!-- prism: line-numbers highlight=2,4-6 -->
```javascript
const x = 1;
const y = 2;
const z = 3;
const a = 4;
const b = 5;
const c = 6;
```

**Directive**: `<!-- prism: line-numbers highlight=2,4-6 -->`

**Features**:
- ✅ Line numbers in gutter
- ✅ Lines 2, 4, 5, 6 highlighted with accent color
- ✅ Syntax highlighting
- ❌ No toolbar (not specified)

---

## Example 2: Full Toolbar Features

This code block has all toolbar features enabled:

<!-- prism: line-numbers copy-to-clipboard download-button show-language -->
```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}

greet('PhantomSPA');
```

**Directive**: `<!-- prism: line-numbers copy-to-clipboard download-button show-language -->`

**Features**:
- ✅ Line numbers
- ✅ Copy button in toolbar
- ✅ Download button in toolbar
- ✅ Language label "JAVASCRIPT" in toolbar
- ✅ Toolbar auto-enabled (implied by copy/download/language)

---

## Example 3: Highlight Only (No Line Numbers)

This code block highlights specific lines without showing line numbers:

<!-- prism: highlight=1,3 -->
```css
.container { background: #fff; }
.header { color: #333; }
.footer { padding: 1rem; }
```

**Directive**: `<!-- prism: highlight=1,3 -->`

**Features**:
- ✅ Lines 1 and 3 highlighted
- ❌ No line numbers (not specified)
- ✅ CSS syntax highlighting
- ✅ Uses global config for other features

---

## Example 4: Command-Line Block

This code block displays command-line prompts:

<!-- prism: command-line -->
```bash
npm install phantomspa
cd phantomspa
npm start
```

**Directive**: `<!-- prism: command-line -->`

**Features**:
- ✅ Command-line prompts displayed
- ❌ No line numbers (mutually exclusive with command-line)
- ✅ Bash syntax highlighting

---

## Example 5: Copy Button Only

This code block has only the copy button enabled:

<!-- prism: copy-to-clipboard -->
```json
{
    "name": "phantomspa",
    "version": "1.0.0",
    "description": "Lightweight SPA framework"
}
```

**Directive**: `<!-- prism: copy-to-clipboard -->`

**Features**:
- ✅ Copy button in toolbar
- ✅ Toolbar auto-enabled (implied by copy button)
- ❌ No line numbers (not specified)
- ❌ No download button
- ❌ No language label

---

## Example 6: Range Highlighting

This code block highlights a range of lines (1-3):

<!-- prism: line-numbers highlight=1-3 -->
```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
};
```

**Directive**: `<!-- prism: line-numbers highlight=1-3 -->`

**Features**:
- ✅ Line numbers
- ✅ Lines 1, 2, 3 highlighted (range syntax)
- ✅ TypeScript syntax highlighting

---

## Example 7: Combined Highlighting

This code block highlights multiple ranges and individual lines:

<!-- prism: line-numbers highlight=1,3-5,7 -->
```python
class PhantomSPA:
    def __init__(self, name):
        self.name = name
        self.version = '1.0.0'
        self.plugins = []
    
    def add_plugin(self, plugin):
        self.plugins.append(plugin)
```

**Directive**: `<!-- prism: line-numbers highlight=1,3-5,7 -->`

**Features**:
- ✅ Line numbers
- ✅ Lines 1, 3, 4, 5, 7 highlighted (combined syntax)
- ✅ Python syntax highlighting

---

## Example 8: Download Button + Language Label

This code block has download and language label features:

<!-- prism: line-numbers download-button show-language -->
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PhantomSPA</title>
</head>
<body>
    <main id="app-shell"></main>
    <script type="module" src="/js/spa.js"></script>
</body>
</html>
```

**Directive**: `<!-- prism: line-numbers download-button show-language -->`

**Features**:
- ✅ Line numbers
- ✅ Download button in toolbar
- ✅ Language label "HTML" in toolbar
- ✅ Toolbar auto-enabled
- ❌ No copy button (not specified)

---

## Example 9: No Directive (Uses Global Config)

This code block has no directive, so it uses the global Prism configuration from the settings UI:

```javascript
const app = {
    name: 'PhantomSPA',
    version: '1.0.0'
};

console.log(app.name);
```

**Directive**: None

**Features**:
- ✅ Uses global configuration settings
- ✅ Respects user preferences from settings UI
- ✅ No per-block override

---

## Example 10: All Features Combined

This code block has every feature enabled:

<!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard download-button show-language -->
```jsx
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div className="counter">
            <h2>Count: {count}</h2>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}

export default Counter;
```

**Directive**: `<!-- prism: line-numbers highlight=2,4-6 copy-to-clipboard download-button show-language -->`

**Features**:
- ✅ Line numbers
- ✅ Lines 2, 4, 5, 6 highlighted
- ✅ Copy button
- ✅ Download button
- ✅ Language label "JSX"
- ✅ Full toolbar

---

## Directive Syntax Reference

### **Basic Format**

```html
<!-- prism: [space-separated options] -->
```

### **Simple Flags**

- `line-numbers` - Enable line numbers
- `copy-to-clipboard` - Enable copy button (auto-enables toolbar)
- `download-button` - Enable download button (auto-enables toolbar)
- `show-language` - Display language label (auto-enables toolbar)
- `toolbar` - Enable toolbar (usually auto-enabled)
- `command-line` - Enable command-line prompts

### **Parameterized Options**

- `highlight=<lines>` - Highlight specific lines

**Highlight Syntax**:
- Single line: `highlight=5`
- Multiple lines: `highlight=1,3,5`
- Range: `highlight=1-5`
- Combined: `highlight=1,3-5,7,9-12`

---

## Important Notes

### **Placement**

The HTML comment directive must be placed **immediately above** the code block in the markdown source:

✅ **Correct**:
```markdown
<!-- prism: line-numbers -->
```javascript
code here
```
```

❌ **Incorrect** (blank line between):
```markdown
<!-- prism: line-numbers -->

```javascript
code here
```
```

---

### **Override Behavior**

- Per-block directives **override** global configuration settings for that specific block only
- Code blocks without directives use the global configuration from the settings UI
- The `data-prism-configured="true"` attribute marks blocks as configured

---

### **Auto-Toolbar**

The `toolbar` option is automatically enabled when any of these options are specified:
- `copy-to-clipboard`
- `download-button`
- `show-language`

You don't need to explicitly add `toolbar` in these cases.

---

### **Command-Line vs Line Numbers**

The `command-line` and `line-numbers` options are **mutually exclusive**:
- If both are specified, `command-line` takes precedence
- `line-numbers` class is removed when `command-line` is added

---

### **Error Handling**

Invalid directives are logged to the console with warnings:
- Unknown options: `console.warn('[prism-config] Unknown directive option:', part)`
- Invalid highlight syntax: `console.warn('[prism-config] Invalid highlight syntax:', value)`
- No code block follows: `console.warn('[prism-config] Prism directive found but no code block follows:', text)`

---

## Testing This Feature

To test the per-block configuration feature:

1. **Create a markdown file** with HTML comment directives
2. **Navigate to the page** in the PhantomSPA documentation
3. **Verify** that code blocks display the specified features
4. **Check console** for any warnings about invalid directives
5. **Toggle global settings** and verify per-block directives still work
6. **Navigate between pages** and verify directives re-parse correctly

---

## Summary

The per-block Prism.js configuration system provides:

- ✅ **Fine-grained control** over individual code blocks
- ✅ **Simple HTML comment syntax** that's easy to write
- ✅ **7 directive options** for comprehensive customization
- ✅ **Parameterized options** like `highlight=2,4-6`
- ✅ **Auto-toolbar** when toolbar features are specified
- ✅ **Global override** - per-block config takes precedence
- ✅ **Error handling** with console warnings
- ✅ **DOM cleanup** - comments removed after processing

Use HTML comment directives to configure Prism.js features on a per-code-block basis! 🎉

