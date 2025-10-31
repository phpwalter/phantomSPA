// /src/integrations/prism-directives.js
// Robust Prism directive processor for PhantomSPA.
//
// Author syntax (place DIRECTLY BEFORE the code fence):
//   1) ;prism toolbar line-numbers highlight=2,4-6 show-language copy-to-clipboard download-button
//   2) `[prism: toolbar line-numbers highlight=2,4-6 …]`
//   3) [prism: toolbar line-numbers highlight=2,4-6 …]    (if your MD engine leaves as text)
//   4) <!-- prism: toolbar line-numbers highlight=2,4-6 … --> (if comments preserved)
//
// Requires Prism core, chosen languages, and desired plugins loaded in <head> (permanent).

const DBG = false; // set to true to see debug logs
const log = (...a) => DBG && console.debug('[prism-dir]', ...a);

// Defaults applied to *every* block unless overridden by a directive
const DEFAULTS = {
    lineNumbers: false,
    showLanguage: false
};

// ------------------------- parsing helpers -------------------------

function parseKeyVals(s) {
    const out = { flags: new Set(), kv: {} };
    const re = /([a-z-]+)(?:\s*=\s*("(?:[^"]*)"|'(?:[^']*)'|[^\s"']+))?/gi;
    let m;
    while ((m = re.exec(s))) {
        const key = m[1].toLowerCase();
        if (m[2] == null) out.flags.add(key);
        else out.kv[key] = m[2].replace(/^['"]|['"]$/g, '');
    }
    return out;
}

function matchDirectiveText(text) {
    const t = (text || '').trim().replace(/\u00a0/g, ' '); // normalize nbsp
    let m;
    if ((m = /^prism:(.*)$/i.exec(t)))             return parseKeyVals(m[1].trim());   // comment inner text
    if ((m = /^\[prism:(.*)\]$/i.exec(t)))         return parseKeyVals(m[1].trim());   // [prism: ...]
    if ((m = /^;prism\s+(.*)$/i.exec(t)))          return parseKeyVals(m[1].trim());   // ;prism ...
    if ((m = /^`?\[?prism:(.*)\]?`?$/i.exec(t)))   return parseKeyVals(m[1].trim());   // backticked
    return null;
}

const isWS = (n) => n && n.nodeType === Node.TEXT_NODE && !n.textContent.trim();
const isEmptyEl = (el) => el && el.nodeType === Node.ELEMENT_NODE && el.textContent.trim() === '';

// Find the next PRE/CODE after "start", skipping whitespace and empty wrappers,
// and peeking inside a few sibling wrappers if needed.
function findNextCodeBlock(start) {
    let n = start.nextSibling;
    while (isWS(n) || isEmptyEl(n)) n = n?.nextSibling;

    const asCode = (el) => {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;
        if (el.tagName === 'PRE') {
            const code = el.querySelector('code');
            if (code) return { pre: el, code };
        }
        if (el.tagName === 'CODE' && el.parentElement?.tagName === 'PRE') {
            return { pre: el.parentElement, code: el };
        }
        return null;
    };

    let hit = asCode(n);
    if (hit) return hit;

    // Search a few siblings and descend into common wrappers
    let steps = 0, cur = n;
    while (cur && steps++ < 10) {
        if (cur.nodeType === Node.ELEMENT_NODE) {
            const found = cur.querySelector('pre code');
            if (found) return { pre: found.parentElement, code: found };
        }
        cur = cur.nextSibling;
    }
    return null;
}

// ----------------------- application to a block -----------------------

function applyTo({ pre, code }, d) {
    // Avoid re-processing the same block
    if (pre.hasAttribute('data-prism-dir')) return;
    pre.setAttribute('data-prism-dir', '1');

    const { flags, kv } = d;

    // language (override only if provided; else keep fence language; else default)
    const lang = kv.lang || kv.language;
    if (lang) {
        code.classList.forEach((c) => { if (c.startsWith('language-')) code.classList.remove(c); });
        code.classList.add(`language-${lang}`);
    } else if (![...code.classList].some((c) => c.startsWith('language-'))) {
        code.classList.add('language-plaintext');
    }

    // line numbers
    if (flags.has('line-numbers') || kv['line-numbers'] || DEFAULTS.lineNumbers) {
        pre.classList.add('line-numbers');
    }

    // highlight lines (Prism line-highlight uses data-line)
    if (kv.highlight) pre.setAttribute('data-line', kv.highlight);
    else pre.removeAttribute('data-line');

    // language pill
    if (flags.has('show-language') || kv['show-language'] || DEFAULTS.showLanguage) {
        pre.classList.add('show-language');
    }

    // toolbar + buttons
    if (flags.has('toolbar') || kv.toolbar) pre.classList.add('toolbar');
    if (flags.has('copy-to-clipboard')) pre.classList.add('copy-to-clipboard');
    if (flags.has('download-button'))   pre.classList.add('download-button');

    // optional title shown by some plugins/themes
    if (kv.title) pre.setAttribute('data-label', kv.title);
}

// Process directives within a root (the current page content)
function upgrade(root) {
    const handled = new Set();
    const toRemove = [];
    let applied = 0;

    // A) HTML comment directives
    const cwalker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null);
    let c;
    while ((c = cwalker.nextNode())) {
        const d = matchDirectiveText(c.nodeValue);
        if (!d) continue;
        const target = findNextCodeBlock(c);
        if (target) {
            applyTo(target, d);
            handled.add(target.pre);
            applied++;
        }
    }

    // B) Broad scan for element/text-node directives
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_ALL, null);
    let node;
    while ((node = tw.nextNode())) {
        if (node.nodeType === Node.COMMENT_NODE) continue; // already handled

        if (node.nodeType === Node.TEXT_NODE) {
            const d = matchDirectiveText(node.textContent);
            if (!d) continue;
            const target = findNextCodeBlock(node);
            if (target && !handled.has(target.pre)) {
                applyTo(target, d);
                handled.add(target.pre);
                applied++;
                if (node.parentElement) toRemove.push(node.parentElement); // remove display container
            }
            continue;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            // skip inside code/pre for performance
            if (node.tagName === 'PRE' || node.tagName === 'CODE') { tw.currentNode = node; continue; }

            // ignore anchors (when bracket form became a link)
            if (node.tagName === 'A') continue;

            const txt = node.textContent?.trim();
            if (!txt) continue;
            const d = matchDirectiveText(txt);
            if (!d) continue;

            const target = findNextCodeBlock(node);
            if (target && !handled.has(target.pre)) {
                applyTo(target, d);
                handled.add(target.pre);
                applied++;
                toRemove.push(node); // clean directive display node
            }
        }
    }

    toRemove.forEach((n) => { try { n.remove(); } catch {} });
    if (applied && DBG) log(`applied to ${applied} block(s)`);
}

// ----------------------- stable runner & observer -----------------------

let isRunning = false;
let queued = false;
let lastPageSrc = null;

function runOnce() {
    if (isRunning) { queued = true; return; }
    isRunning = true;
    try {
        const main = document.querySelector('main.site-main, main') || document;
        const page = main.querySelector('.doc-page') || main;

        // If the page has a data-src and it's unchanged, skip heavy work
        const src = page.getAttribute && page.getAttribute('data-src');
        const same = src && src === lastPageSrc;

        if (!same) {
            upgrade(page);
            lastPageSrc = src || null;
        } else {
            if (DBG) log('skip upgrade: same page src', src);
        }

        // Always re-highlight (idempotent)
        if (window.Prism?.highlightAllUnder) {
            window.Prism.highlightAllUnder(page);
            if (DBG) log('Prism highlightAllUnder() called');
        }
    } finally {
        isRunning = false;
        if (queued) { queued = false; Promise.resolve().then(runOnce); }
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', runOnce);

// Preferred SPA hook (your router emits this)
document.addEventListener('route:after', runOnce);

// MutationObserver: watch ONLY direct child changes of <main> to avoid loops
const mainEl = document.querySelector('main.site-main, main');
if (mainEl && window.MutationObserver) {
    const obs = new MutationObserver((mutList) => {
        const changed = mutList.some(m =>
            m.type === 'childList' &&
            ( [...m.addedNodes].some(n => n.nodeType === 1 && n.matches?.('.doc-page, section.doc-page')) ||
                m.removedNodes.length > 0 )
        );
        if (changed) Promise.resolve().then(runOnce); // debounce to next microtask
    });
    obs.observe(mainEl, { childList: true, subtree: false });
    if (DBG) log('MutationObserver armed on <main> (childList only)');
} else {
    if (DBG) log('No <main> observer');
}
