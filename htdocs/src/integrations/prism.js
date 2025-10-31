// Re-highlight after every route change (router dispatches "route:after")
document.addEventListener('route:after', () => {
    if (window.Prism && typeof window.Prism.highlightAllUnder === 'function') {
        const main = document.querySelector('main.site-main') || document.querySelector('main');
        if (main) window.Prism.highlightAllUnder(main);
    }
});

// Also try once on DOM ready (first paint)
document.addEventListener('DOMContentLoaded', () => {
    if (window.Prism && typeof window.Prism.highlightAllUnder === 'function') {
        const main = document.querySelector('main.site-main') || document.querySelector('main');
        if (main) window.Prism.highlightAllUnder(main);
    }
});
