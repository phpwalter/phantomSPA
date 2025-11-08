# Prism.js Syntax Highlighting Examples

This document demonstrates all Prism.js features integrated into PhantomSPA documentation.

---

## 1. JavaScript with Line Numbers

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
}

const user = {
    name: 'PhantomSPA',
    version: '1.0.0',
    features: ['routing', 'markdown', 'plugins']
};

greet(user.name);
```

**Features**:
- ✅ Syntax highlighting
- ✅ Line numbers in gutter
- ✅ Copy button
- ✅ Download button
- ✅ Language label "JAVASCRIPT"

---

## 2. CSS Styling

```css
:root {
    --bg: #0f1724;
    --panel: #101a2a;
    --accent: #6ea8ff;
}

.container {
    background: var(--bg);
    color: var(--fg);
    padding: 2rem;
    border-radius: 12px;
}

.button:hover {
    background: var(--accent);
    transform: scale(1.05);
    transition: all 0.3s ease;
}
```

---

## 3. HTML Markup

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PhantomSPA</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <main id="app-shell" data-config="/config.json"></main>
    <script type="module" src="/js/spa.js"></script>
</body>
</html>
```

---

## 4. JSON Configuration

```json
{
    "name": "phantomspa",
    "version": "1.0.0",
    "basePath": "/docs/dev/",
    "contentRoot": "/docs/dev/pages/",
    "plugins": {
        "router": "/src/router.js",
        "nav-tree": {
            "path": "/src/core/nav/nav-tree.js",
            "options": {
                "collapseByDefault": true,
                "autoExpandActive": true
            }
        }
    }
}
```

---

## 5. Bash Commands

```bash
# Install PhantomSPA
npm install phantomspa

# Navigate to project
cd phantomspa

# Start development server
npm start

# Build for production
npm run build
```

---

## 6. TypeScript

```typescript
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    getUser(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }
}

const service = new UserService();
service.addUser({ id: 1, name: 'John', email: 'john@example.com' });
```

---

## 7. Python

```python
class PhantomSPA:
    def __init__(self, name, version):
        self.name = name
        self.version = version
        self.plugins = []
    
    def add_plugin(self, plugin):
        self.plugins.append(plugin)
        print(f"Plugin '{plugin}' added to {self.name}")
    
    def render(self, content):
        return f"<div class='doc-page'>{content}</div>"

# Create instance
app = PhantomSPA('PhantomSPA', '1.0.0')
app.add_plugin('router')
app.add_plugin('nav-tree')
```

---

## 8. React JSX

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
            <button onClick={() => setCount(count - 1)}>
                Decrement
            </button>
        </div>
    );
}

export default Counter;
```

---

## 9. Markdown

```markdown
# PhantomSPA Documentation

## Features

- **Zero dependencies** - No framework required
- **Markdown support** - Write content in Markdown
- **Plugin system** - Extend functionality easily

### Code Example

\`\`\`javascript
const app = { name: 'PhantomSPA' };
\`\`\`

[Learn more](/docs/getting-started)
```

---

## 10. Inline Code

Here's some inline code: `const app = { name: 'PhantomSPA' }` and `npm install phantomspa`.

You can also use inline code with language: `javascript›const x = 10;` or `bash›npm start`.

---

## Advanced Features

### Line Highlighting

The following code highlights specific lines (lines 2-4 and 7):

```javascript
// Line 1: Not highlighted
const config = {
    name: 'PhantomSPA',
    version: '1.0.0'
};

// Line 6: Not highlighted
console.log(config.name); // Line 7: Highlighted
```

**Note**: To enable line highlighting, add `{2-4,7}` after the language identifier in markdown:

````markdown
```javascript{2-4,7}
// Your code here
```
````

---

### Command Line with Prompts

```bash
user@localhost:~$ npm install phantomspa
added 1 package in 2s

user@localhost:~$ cd phantomspa
user@localhost:~/phantomspa$ npm start
Server running on http://localhost:3000
```

**Note**: To enable command-line prompts, use the `command-line` class with data attributes.

---

### Download Button

All code blocks have a download button in the toolbar. Click it to save the code as a file:

```javascript
// This code can be downloaded as "file.js"
const downloadExample = {
    feature: 'Download Button',
    plugin: 'prism-download-button',
    action: 'Click the download icon in the toolbar'
};

console.log(downloadExample);
```

---

### Copy to Clipboard

All code blocks have a copy button. Click it to copy the code to your clipboard:

```javascript
// Click the copy button to copy this code
const copyExample = {
    feature: 'Copy to Clipboard',
    plugin: 'prism-copy-to-clipboard',
    action: 'Click the copy icon in the toolbar'
};

// The button will show "Copied!" when successful
console.log(copyExample);
```

---

## Testing All Features

### ✅ Syntax Highlighting
- JavaScript, CSS, HTML, JSON, Bash, TypeScript, Python, JSX, Markdown

### ✅ Line Numbers
- Displayed in gutter for all code blocks (except command-line)

### ✅ Toolbar Buttons
- Copy button (clipboard icon)
- Download button (download icon)
- Language label (e.g., "JAVASCRIPT")

### ✅ Interactive Features
- Hover to show toolbar
- Click copy to copy code
- Click download to save file
- Copy success state (button turns accent color)

### ✅ Responsive Design
- Code blocks scroll horizontally on mobile
- Toolbar always visible on mobile
- Font size adjusts for readability

---

## Summary

Prism.js is fully integrated with PhantomSPA documentation, providing:

1. **Professional syntax highlighting** for 9+ languages
2. **Interactive toolbar** with copy and download buttons
3. **Line numbers** for easy reference
4. **Line highlighting** for emphasis
5. **Command-line support** with prompts
6. **Custom dark theme** matching PhantomSPA design
7. **Responsive design** for all devices

All features work seamlessly with the PhantomSPA router and markdown rendering! 🎉
