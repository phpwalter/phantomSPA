# ![pSPA.icon.png](../../../assets/images/pSPA.icon.png) Getting Started

## Installation

Install phantomSPA via npm, yarn, or use it directly from a CDN.

```bash
npm install phantomspa
# or
yarn add phantomspa
# or use CDN
<script src="https://unpkg.com/phantomspa/dist/phantomspa.min.js"></script>
````

---

## Basic Setup

Create a simple phantomSPA application with just a few lines of code.

```js
// main.js
import phantomSPA from 'phantomspa';

const app = new phantomSPA({
  root: '#app',
  pages: './pages',
  theme: 'auto',
  plugins: []
});

app.init();
```

---

## Project Structure

phantomSPA uses a simple file-based routing system. Your project structure might look like this:

```
project/
├─ index.html
├─ main.js
├─ pages/
│  ├─ index.md
│  ├─ about.md
│  └─ docs/
│     ├─ getting-started.md
│     └─ api.md
└─ public/
   └─ styles.css
```

---

## Writing Content

Write your content in Markdown files. phantomSPA will automatically convert them to HTML and handle routing.

```md
# Welcome to My Site

This is written in **Markdown** and rendered as HTML.

## Features
- Simple routing
- Markdown support
- Zero configuration

[learn more](/docs/dev/pages/getting-started)
```

> **Pro Tip:** You can use HTML directly in your Markdown files for more complex layouts. phantomSPA will render both Markdown and HTML seamlessly.

---

[API Reference →](/docs/dev/pages/api)
