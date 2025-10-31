// Turns the next <ul> after <!-- as:panels --> into a grid of “panel” cards.
// Optional counterpart: <!-- as:list --> forces the next list back to normal.
//
// Idempotent and re-runs after each navigation (router emits "route:after").

function markPanels(root) {
    // Walk comment nodes and act on the *next* element sibling that is a UL/OL
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null);
    let n;
    while ((n = walker.nextNode())) {
        const text = (n.nodeValue || '').trim().toLowerCase();

        if (text !== 'as:panels' && text !== 'as:list') continue;

        // Find the next non-empty sibling
        let next = n.nextSibling;
        while (next && next.nodeType === Node.TEXT_NODE && !next.textContent.trim()) {
            next = next.nextSibling;
        }

        if (!next || next.nodeType !== Node.ELEMENT_NODE) continue;

        // Only act on lists
        const isList = next.tagName === 'UL' || next.tagName === 'OL';
        if (!isList) continue;

        if (text === 'as:panels') {
            next.classList.add('as-panels');
            next.setAttribute('data-as', 'panels');
        } else if (text === 'as:list') {
            next.classList.remove('as-panels');
            next.removeAttribute('data-as');
        }
    }
}

function enhanceCurrentPage() {
    const main = document.querySelector('main.site-main, main') || document;
    const page = main.querySelector('.doc-page');
    if (!page) return;
    markPanels(page);
}

// Run on initial load and after SPA navigations
document.addEventListener('DOMContentLoaded', enhanceCurrentPage);
document.addEventListener('route:after', enhanceCurrentPage);
