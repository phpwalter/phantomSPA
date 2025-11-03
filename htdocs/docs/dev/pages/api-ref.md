# ![pSPA.icon.png](/src/assets/images/pSPA.icon.png) API Reference

## Methods

| Method               | Description                    | Parameters                           |
|----------------------|--------------------------------|--------------------------------------|
| `init()`             | Initialize the application     | _None_                               |
| `navigate(path)`     | Navigate to a specific route   | `path: string`                       |
| `render(markdown)`   | Render Markdown to HTML string | `markdown: string`                   |
| `on(event, handler)` | Add event listener             | `event: string`, `handler: Function` |
| `use(plugin)`        | Register a plugin              | `plugin: Plugin`                     |

---

## `init()`

Bootstraps **PhantomSPA**, mounts into the configured root, and performs the initial render.

```js
// main.js
import PhantomSPA from 'phantom-spa';

const app = new PhantomSPA({ root: '#app', pages: './pages' });
app.init();
````

---

## `navigate(path)`

Pushes a new URL and renders the target page. Uses the History API so back/forward works.

```js
app.navigate('/docs/dev/getting-started'); // loads the page and updates the URL
```

---

## `render(markdown)`

Converts a Markdown string to HTML. Returns a string; you can insert it anywhere in the DOM.

```js
const html = app.render('# Hello **world**');
document.querySelector('#preview').innerHTML = html;
```

---

## `on(event, handler)`

Subscribes to app-level events. Handlers receive an event payload object.

**Events:** `ready`, `route:before`, `route:after`, `error`

```js
app.on('route:after', ({ path }) => {
  console.log('navigated to', path);
});
```

---

## `use(plugin)`

Registers a plugin. A plugin is an object with optional lifecycle hooks:

```js
// example plugin
const analyticsPlugin = {
  onInit({ config }) { /* ... */ },
  onRoute({ route }) { /* ... */ },
  onError(err) { /* ... */ }
};

app.use(analyticsPlugin);
```

---

## Types

```ts
type Handler = (payload: any) => void;

type Plugin = {
  onInit?: (ctx: { config: any }) => void | Promise<void>;
  onRoute?: (ctx: { route: { path: string; params: Record<string, string>; query: Record<string, string | string[]> } }) => void | Promise<void>;
  onError?: (err: unknown) => void;
};
```
