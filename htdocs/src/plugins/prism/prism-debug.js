/**
 * Prism.js Debugging Utility
 * Helps diagnose issues with Prism.js plugin rendering
 */

export function debugPrismBlock(pre) {
    console.group('🔍 Prism Block Debug');
    console.log('Element:', pre);
    console.log('Classes:', pre.className);
    console.log('Data attributes:', {
        'data-line': pre.getAttribute('data-line'),
        'data-prism-configured': pre.getAttribute('data-prism-configured'),
        'data-prism-copy': pre.getAttribute('data-prism-copy'),
        'data-prism-download': pre.getAttribute('data-prism-download'),
        'data-prism-language': pre.getAttribute('data-prism-language')
    });
    
    // Check for Prism-generated elements
    console.log('Has line-numbers-rows:', !!pre.querySelector('.line-numbers-rows'));
    console.log('Has toolbar:', !!pre.parentElement?.classList.contains('code-toolbar'));
    console.log('Has line-highlight:', !!pre.parentElement?.querySelector('.line-highlight'));
    
    // Check parent wrapper
    if (pre.parentElement) {
        console.log('Parent element:', pre.parentElement.tagName, pre.parentElement.className);
    }
    
    // Check for code element
    const code = pre.querySelector('code');
    if (code) {
        console.log('Code element:', code.className);
        console.log('Code length:', code.textContent.length);
    }
    
    // Check global Prism state
    console.log('Prism available:', !!window.Prism);
    if (window.Prism) {
        console.log('Prism plugins:', window.Prism.plugins ? Object.keys(window.Prism.plugins) : 'none');
    }
    
    // Check body classes
    const bodyClasses = Array.from(document.body.classList).filter(c => c.startsWith('prism-'));
    console.log('Body Prism classes:', bodyClasses);
    
    console.groupEnd();
}

export function debugAllPrismBlocks(container = document) {
    const blocks = container.querySelectorAll('pre[class*="language-"]');
    console.log(`Found ${blocks.length} code blocks`);
    blocks.forEach((block, index) => {
        console.log(`\n--- Block ${index + 1} ---`);
        debugPrismBlock(block);
    });
}

// Auto-attach to window for console access
if (typeof window !== 'undefined') {
    window.debugPrism = debugPrismBlock;
    window.debugAllPrism = debugAllPrismBlocks;
}

