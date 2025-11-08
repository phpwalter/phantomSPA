// /src/utilitiesmarkdown.js
// Lightweight Markdown rendering helper (lazy-loads marked.js once)

let _marked = null;
const LOCAL_LIB = '/library/vendor/marked/marked.esm.js';
const CDN_LIB   = 'https://cdn.jsdelivr.net/npm/marked@14.1.3/lib/marked.esm.js';
const USE_SANITIZE = false; // set to true if you add DOMPurify and CSP allows it

async function loadMarked() {
    if (_marked) return _marked;
    try {
        const module = await import(LOCAL_LIB);
        _marked = module.marked;
        return _marked;
    } catch {
        const module = await import(CDN_LIB); // fallback
        _marked = module.marked;
        return _marked;
    }
}

export async function markdownToHtml(mdText) {
    const marked = await loadMarked();
    const html = marked(mdText || '');

    if (!USE_SANITIZE) return html;

    // Optional sanitize (add DOMPurify to /library/vendor and import here)
    const DOMPurify = (await import('/library/vendor/purify.es.js')).default;
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
