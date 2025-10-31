// /src/markdown.js
// Lightweight Markdown rendering helper (lazy-loads snarkdown once)

let _snarkdown = null;
const LOCAL_LIB = '/library/vendor/snarkdown/snarkdown.es.js';
const CDN_LIB   = 'https://cdn.jsdelivr.net/npm/snarkdown@2.0.0/dist/snarkdown.es.js';
const USE_SANITIZE = false; // set to true if you add DOMPurify and CSP allows it

async function loadSnarkdown() {
    if (_snarkdown) return _snarkdown;
    try {
        _snarkdown = (await import(LOCAL_LIB)).default;
        return _snarkdown;
    } catch {
        _snarkdown = (await import(CDN_LIB)).default; // fallback
        return _snarkdown;
    }
}

export async function markdownToHtml(mdText) {
    const snark = await loadSnarkdown();
    const html = snark(mdText || '');

    if (!USE_SANITIZE) return html;

    // Optional sanitize (add DOMPurify to /library/vendor and import here)
    const DOMPurify = (await import('/library/vendor/purify.es.js')).default;
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
