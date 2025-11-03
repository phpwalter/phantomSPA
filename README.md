[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)](#)
[![Framework-Agnostic](https://img.shields.io/badge/framework-agnostic-lightgrey)](#)

![pSPA.title-banner.png](htdocs/assets/images/pSPA.title-banner.png)

# PhantomSPA (pSPA)

**The simplest way to build single-page applications with Markdown.**

> **PhantomSPA** is a pluggable, security-hardened, zero-assumptions SPA kernel built entirely in native JavaScript (ES6+).  
> No frameworks. No build required. Just edit → save → run.

---

## 📚 Table of Contents

- [What is PhantomSPA?](#what-is-phantomspa)
- [Why PhantomSPA?](#why-phantomspa)
- [Modes & Workflow](#modes--workflow)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Renderers & Plugin API](#renderers--plugin-api)
- [Markdown Parsing](#markdown-parsing)
- [Optional Enhancements](#optional-enhancements)
- [Security Model](#security-model)
- [Directory Structure](#directory-structure)
- [CLI (Bundler/Deployer)](#cli-bundlerdeployer)
- [Deployment Guides](#deployment-guides)
- [Browser Support](#browser-support)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🧩 What is PhantomSPA?

PhantomSPA is a **modular, config-first SPA kernel** that gives you full control over routing, rendering, and navigation — without introducing a JS framework or build step.

It powers your frontend like a *phantom conductor*:

- Declarative JSON routing
- Markdown + CSS content loading
- Custom renderers and plugins

---

## ❓ Why PhantomSPA?

PhantomSPA is ideal when you want:

- ✅ A **fully static** frontend (no Node.js or build tools required)
- ✅ Authoring with **Markdown + CSS**
- ✅ A pluggable kernel with custom renderers + lifecycle plugins
- ✅ Secure, CDN-ready static deployment
- ✅ A simple **edit → save → refresh** workflow

Common use cases:
- Static documentation sites
- Lightweight dashboards
- Microsites & product pages
- Custom SPAs without frameworks

---

## 🔁 Modes & Workflow

PhantomSPA supports three modes:

### 🧪 Kernel Dev
> GitHub clone (for contributors)

- Modify kernel logic (`spa.js`, plugins, renderers)
- Use `file://` or local web server
- No tooling required

### ✍️ Site Dev
> NPM install (for site builders)

```bash
npm install phantomspa
````

* Markdown content + CSS themes
* JSON config: `app-config.json`, `nav.json`
* Use with any HTML shell

### 🚀 Production

> CLI (coming soon) for bundling and deployment

* Output static, optimized bundles
* Ideal for GitHub Pages, Netlify, Cloudflare, or S3
* Built with security headers and route fallbacks

---

## 🏁 Getting Started

### 1. Install or clone

**Option A: GitHub (kernel or production)**

```bash
git clone https://github.com/YOUR-USER/phantomspa.git
```

**Option B: NPM (site builder)**

```bash
npm install phantomspa
```

---

### 2. Add PhantomSPA to your HTML

```html
<main id="app-shell" data-config="/data/app-config.json"></main>
<script type="module" src="/js/core/spa.js"></script>
```

---

### 3. Author Your Content

* Write pages in `/pages/*.md`
* Create `/data/nav.json` with routes
* Customize layout via renderers

---

## ⚙️ Configuration

### `/data/app-config.json`

```json
{
  "root": "#app-shell",
  "nav": "/data/nav.json",
  "header": { "renderer": "/js/renderers/header.js" },
  "footer": { "renderer": "/js/renderers/footer.js" },
  "plugins": ["/js/plugins/telemetry.js"]
}
```

---

### `/data/nav.json`

```json
[
  {
    "label": "About",
    "route": "about",
    "page": ["/pages/about.md"],
    "css": ["/css/about.css"],
    "renderers": ["/js/renderers/about.js"],
    "prefetch": true
  }
]
```

---

## 🧩 Renderers & Plugin API

### 📦 Renderers

```js
export async function render(el, data) {
  el.innerHTML = `<h1>${data.title}</h1>`;
}

export function unmount(el) {
  el.innerHTML = '';
}
```

#### 🔁 Optional Lifecycle:

* `init(el, data)`
* `render(el, data)`
* `unmount(el)`

---

### 🔌 Plugins

```js
export function setup(spa) {
  spa.onRouteChange((route) => {
    console.log('Navigated to', route);
  });
}
```

Plugins receive access to:

* Route config
* DOM API (via kernel)
* Custom hooks

---

## 📄 Markdown Parsing

PhantomSPA supports Markdown via [`snarkdown`](https://github.com/developit/snarkdown).

### 🧪 Usage with Sanitization

```bash
npm install snarkdown dompurify
```

```js
import snarkdown from 'snarkdown';
import DOMPurify from 'dompurify';

export function renderMarkdown(md) {
  const dirty = snarkdown(md);
  return DOMPurify.sanitize(dirty);
}
```

Add this in a custom utility, or inject it into a renderer.

---

## 🧩 Optional Enhancements

| Tool        | Purpose                       | Recommended For                 |
|-------------|-------------------------------|---------------------------------|
| `Prism.js`  | Code syntax highlighting      | Docs, tech sites, dashboards    |
| `DOMPurify` | HTML sanitization             | Public-facing content, security |
| `jsdom`     | Headless DOM for builds/tests | CLI static site generation      |

---

### 🖍 Prism.js — Syntax Highlighting

```html
<link href="https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/prismjs/prism.js"></script>
```

Hook into route changes:

```js
spa.onRouteChange(() => {
  Prism.highlightAll();
});
```

---

### 🧼 DOMPurify — Sanitize Markdown

Install + wrap `snarkdown`:

```bash
npm install dompurify snarkdown
```

```js
DOMPurify.sanitize(snarkdown(markdown));
```

---

### 🧪 jsdom — CLI Support (Future)

For CLI rendering of static HTML snapshots:

```js
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!DOCTYPE html><main id="app-shell"></main>`);
global.window = dom.window;
global.document = dom.window.document;
```

Useful in `phantomspa build` or `phantomspa snapshot` command.

---

## 🔐 Security Model

| Feature         | Description                      |
|-----------------|----------------------------------|
| ✅ HTTPS         | Force HTTPS + HSTS               |
| ✅ CSP           | Configurable per host            |
| ✅ COOP/COEP     | Origin isolation                 |
| ✅ JSON/MD Block | Sensitive file filtering         |
| ✅ SPA Rewrite   | History fallback per base path   |
| ✅ Cache Headers | Route freshness vs asset caching |

### `.htaccess` Example (Apache)

```apache
RewriteEngine On
RewriteBase /

# SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Security Headers
Header set Strict-Transport-Security "max-age=63072000; includeSubDomains"
Header set Content-Security-Policy "default-src 'self'; script-src 'self'"
Header set Cross-Origin-Opener-Policy same-origin
Header set Cross-Origin-Embedder-Policy require-corp
Header set Cache-Control "public, max-age=31536000, immutable"
```

---

## 🗂 Directory Structure

```plaintext
/index.html
/js/
  ├─ core/spa.js
  ├─ renderers/
  └─ plugins/
/css/
  └─ theme.css
/pages/
  └─ about.md
/data/
  ├─ app-config.json
  └─ nav.json
```

---

## 🚀 CLI (Bundler/Deployer)

> **Coming Soon** — The CLI bundles the kernel and preps content for production.

### Planned Commands

```bash
phantomspa bundle     # Minify kernel + renderers
phantomspa build      # Output static pre-rendered content (uses jsdom)
phantomspa deploy     # Prepares deploy-ready folder
```

---

## 🌐 Deployment Guides

### GitHub Pages

* Set `<base href="/your-repo-name/">` in HTML
* Enable Pages via repo settings
* Push built folder to `gh-pages` branch

---

### Netlify

```toml
# netlify.toml
[build]
  publish = "./"
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Cloudflare Pages / S3

* Upload built folder to S3 bucket
* Set `index.html` as root + error page
* Apply cache headers (CloudFront or meta tags)

---

## 🌍 Browser Support

* ✅ Modern ES6+ browsers: Chrome, Safari, Firefox, Edge
* ❌ **No IE11 Support**
* Supports modules, dynamic imports, native promises

---

## 🗺 Roadmap

| Version | Focus                         |
|---------|-------------------------------|
| v0.1    | Kernel MVP                    |
| v0.2    | Prefetch, idle loading        |
| v0.3    | Plugin API + Markdown parser  |
| v0.4    | Security, `.htaccess` support |
| v0.5    | CLI tooling                   |
| v1.0    | Docs, templates, NPM release  |

---

## 📜 License

MIT License © 2025 — PhantomSPA Authors
