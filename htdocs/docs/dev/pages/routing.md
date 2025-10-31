# # ![pSPA.icon.png](../../../assets/images/pSPA.icon.png) Routing

PhantomSPA provides flexible routing with support for static paths, dynamic parameters, and a catch-all fallback.


## Quick Example

<!-- prism: toolbar line-numbers highlight=2,4-6 copy-to-clipboard download-button show-language -->
```json
// nav.json (excerpt)
{
  "basePath": "/docs/dev/",
  "contentRoot": "/docs/dev/pages/",
  "routes": [
    { "path": "/",            "file": "intro.md",          "title": "Introduction" },
    { "path": "/about",       "file": "about.md",          "title": "About" },
    { "path": "/blog/:slug",  "file": "blog/[slug].md",    "title": "Blog Post" },
    { "path": "*",            "file": "404.html",          "title": "Not found" }
  ]
}
```

---

## Route Patterns

* `/` — Static root path
* `/about` — Static page
* `/users/:id` — Dynamic segment (captures one path part)
* `*` — Catch-all (404) route; keep it last

Each route’s `file` is resolved relative to `contentRoot` in `nav.json`. In production you can point `contentRoot` to `/pages/`.

---

## Parameters

Dynamic segments like `:id` are decoded and exposed to your renderers or any script listening to router events.

```js
// URL: /docs/dev/users/42
// Matched route: { "path": "/users/:id", "file": "users/detail.md" }
const params = { "id": "42" };
```

---

## Query Strings

Queries are parsed into an object. Repeated keys may be collected as arrays depending on the router’s `queryMode` (default: `array`).

```js
// URL: /docs/dev/search?q=spa&q=router&page=2
// queryMode = "array"
const query = { "q": ["spa", "router"], "page": "2" };
```

---

## Base Path

The router normalizes and strips `basePath` (e.g., `/docs/dev/`) before matching routes so the same fragments work in dev and prod.

```json
// nav.json
{ "basePath": "/docs/dev/", "contentRoot": "/docs/dev/pages/", "...": "..." }
```

---

## Linking

Use normal anchors; the router intercepts internal links and updates the History API.

```html
<a href="/docs/dev/getting-started">Getting Started</a>
```

* Modifier clicks (Cmd/Ctrl), `target` other than `_self`, `download`, and `rel="external"` bypass interception.
* `mailto:` / `tel:` are left alone.

---

## Navigation API

You can trigger navigation programmatically or preload fragments for snappier UX.

```js
// navigate to a route
window.PicoRouter?.navigate('/docs/dev/api');

// preload on hover (example)
document.querySelectorAll('a[data-preload]').forEach(a => {
  a.addEventListener('mouseenter', () => window.PicoRouter?.preload(a.href));
});
```

---

## 404 Fallback

If a path does not match any route, or a matched route’s file is missing, the router renders the `*` route’s fragment (your `404.html`).

```json
// nav.json
{ "path": "*", "title": "Not found", "file": "404.html" }
```

---

## Tips

* Keep the wildcard route last.
* Use relative `file` names; switch only `contentRoot` between dev and prod.
* Add `data-preload` to important links for instant navigation.
