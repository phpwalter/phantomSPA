# 👻 PhantomSPA

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)](#)
[![Framework-Agnostic](https://img.shields.io/badge/framework-agnostic-lightgrey)](#)

> **PhantomSPA** – A pure JavaScript, configuration-driven SPA kernel with zero assumptions. Invisible, flexible, and framework-agnostic.

---

## 📚 Table of Contents

- [What is PhantomSPA?](#-what-is-phantomspa)
- [Features](#-features)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Navigation Model](#-navigation-model)
- [Renderers](#-renderers)
- [Folder Structure](#-folder-structure)
- [Testing](#-testing)
- [Security Notes](#-security-notes)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧩 What is PhantomSPA?

PhantomSPA is a **lightweight kernel** for building Single Page Applications (SPAs) with **no assumptions** about your UI, components, or file structure.

It doesn’t ship with a router, UI library, or hardcoded conventions. Instead, it reads a **single configuration source** and orchestrates:

- Navigation and routes
- Headers and footers
- Page shells and renderers
- Data fetching and asset prefetching
- On-demand CSS loading

PhantomSPA is the **phantom conductor** of your frontend: invisible, silent, but powerful.

---

## ✨ Features

- **🕳 Zero-Knowledge Core** – Knows nothing about your app until you configure it.
- **⚙️ Config-First** – Drive everything via `app-config.json` + `nav.json`.
- **🔌 Pluggable Renderers** – Drop in headers, footers, or custom page renderers.
- **🚀 Performance-Aware** – Idle prefetching, concurrency control, and CSS-on-demand.
- **🧼 Safe & Clean** – Scoped side effects, escape utilities, and renderer contracts.
- **📦 Portable** – Runs on any static server. No frameworks or bundlers required.

---

## 🏗️ Installation

Clone PhantomSPA into your project:

```sh
git clone https://github.com/YOUR-USER/phantomspa.git
````

Then include it in your `index.html`:

```html
<main id="app-shell" data-config="/data/app-config.json"></main>
<script type="module" src="/js/core/spa.js"></script>
```

---

## ⚙️ Configuration

PhantomSPA supports config from:

1. `window.SPA_CONFIG` (highest priority)
2. `data-config` attribute on `#app-shell`
3. Inline `data-*` attributes

**Example: `/data/app-config.json`**

```json
{
  "root": "#app-shell",
  "nav": "/data/nav.json",
  "header": { "renderer": "/js/renderers/header.js" },
  "footer": { "renderer": "/js/renderers/footer.js" }
}
```

---

## 🧭 Navigation Model

Define routes in `nav.json`:

```json
[
  {
    "label": "About",
    "route": "about",
    "page": ["/pages/about.html"],
    "css": ["/css/about.css"],
    "data": ["/data/about.json"],
    "renderers": ["/js/renderers/about.js"],
    "prefetch": true
  }
]
```

---

## 🎨 Renderers

A renderer is a simple ES module with lifecycle methods:

```js
export async function render(rootEl, data) {
  rootEl.innerHTML = `<h1>${data.title}</h1>`;
}

export function unmount(rootEl) {
  rootEl.innerHTML = '';
}

export function updateActive(rootEl, currentRoute) {
  // Optional: update active nav link
}
```

---

## 🗂 Folder Structure

Here’s a minimal suggested layout:

```plaintext
/index.html
/js/
  └─ core/spa.js
  └─ renderers/
      ├─ header.js
      ├─ footer.js
      └─ about.js
/data/
  ├─ app-config.json
  ├─ nav.json
  └─ about.json
/pages/
  └─ about.html
/css/
  └─ about.css
```

---

## 🧪 Testing

PhantomSPA encourages three levels of testing:

* **Unit** – Utility functions (`escapeHTML`, `slug`, etc.)
* **Integration** – Config merging, route resolution, render lifecycle
* **E2E** – Clicks, back/forward navigation, initial loads

**Example unit test:**

```js
import { escapeHTML } from '/js/utils.js';

test('escapeHTML should sanitize script tags', () => {
  expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
});
```

---

## 🔐 Security Notes

* Only inject **trusted HTML shells**.
* Escape dynamic content with `escapeHTML`.
* Never inject untrusted scripts.
* Uses same-origin fetches by default.

---

## 🗺️ Roadmap

PhantomSPA is evolving in planned phases:

| Version | Focus                         |
|---------|-------------------------------|
| v0.1    | MVP: Routing, CSS, Shells     |
| v0.2    | Prefetch, Idle Scheduling     |
| v0.3    | Testing, Schema Validation    |
| v0.4    | Lifecycle Hooks, Plugins      |
| v0.5    | Hash Routing, 404s, Guards    |
| v0.6    | Shadow DOM, Route Cache       |
| v0.7    | CSP, Trusted HTML, Sandboxing |
| v0.8    | Devtools, Telemetry           |
| v0.9    | CLI, Preflights, Templates    |
| v1.0    | Docs, Examples, Stable APIs   |

👉 Full roadmap with criteria: [ROADMAP.md](./ROADMAP.md)

---

## 📜 License

MIT License © 2025 – PhantomSPA Authors
