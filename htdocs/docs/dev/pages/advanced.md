# Advanced Topics

*Level up your PhantomSPA with server-side rendering and custom theming.*

---

## ✅ Server-Side Rendering

Pre-render pages to static HTML for faster first paint and improved SEO. Generate your fragments at build time and serve them via `contentRoot`.

### Strategy
1. Read all Markdown files (or HTML sources).
2. Transform to HTML using your parser or pipeline.
3. Emit to the fragment folder used by `contentRoot` (dev: `/docs/dev/pages/`, prod: `/pages/`).
4. Ensure each route in `nav.json` points to the emitted fragment.

### Pseudo build script

```js
// build-ssr.mjs (example)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { globby } from 'globby';
import { marked } from 'marked';

const src = 'content/**/*.md';
const out = 'htdocs/pages';          // prod output (dev: htdocs/docs/dev/pages)
await mkdir(out, { recursive: true });

for (const file of await globby(src)) {
  const md = await readFile(file, 'utf8');
  const html = marked.parse(md);
  const rel = file.replace(/^content\//,'').replace(/\.md$/,'.html');
  await writeFile(`${out}/${rel}`, wrap(html), 'utf8');
}

function wrap(body){
  return `<section class="doc-page">${body}</section>`;
}
