/**
 * Prism.js Debugging Utility
 * Helps diagnose issues with Prism.js plugin rendering
 *
 * This utility dynamically discovers all Prism-related attributes and elements
 * without hardcoding plugin-specific names, following the config-driven architecture.
 */

export function debugPrismBlock(pre) {
    console.group('🔍 Prism Block Debug');
    console.log('Element:', pre);
    console.log('Classes:', pre.className);

    // Dynamically collect all data-* attributes
    const dataAttrs = {};
    for (const attr of pre.attributes) {
        if (attr.name.startsWith('data-')) {
            dataAttrs[attr.name] = attr.value;
        }
    }
    console.log('Data attributes:', dataAttrs);

    // Dynamically discover Prism-generated child elements
    // Look for elements with classes that suggest Prism plugin output
    const prismElements = {};
    const allChildren = pre.querySelectorAll('*');
    allChildren.forEach(child => {
        const classes = Array.from(child.classList);
        classes.forEach(cls => {
            // Track elements with Prism-related class patterns
            if (cls.includes('line') || cls.includes('token') || cls.includes('prism')) {
                if (!prismElements[cls]) {
                    prismElements[cls] = 0;
                }
                prismElements[cls]++;
            }
        });
    });
    console.log('Prism-generated elements:', prismElements);

    // Check parent wrapper (code-toolbar is Prism's standard wrapper)
    console.log('Has toolbar wrapper:', !!pre.parentElement?.classList.contains('code-toolbar'));
    if (pre.parentElement) {
        console.log('Parent element:', pre.parentElement.tagName, pre.parentElement.className);

        // Check for sibling elements added by Prism plugins
        const siblings = Array.from(pre.parentElement.children).filter(el => el !== pre);
        if (siblings.length > 0) {
            console.log('Sibling elements:', siblings.map(el => ({
                tag: el.tagName,
                classes: el.className
            })));
        }
    }

    // Check for code element
    const code = pre.querySelector('code');
    if (code) {
        console.log('Code element:', code.className);
        console.log('Code length:', code.textContent.length);

        // Collect code element's data-* attributes
        const codeDataAttrs = {};
        for (const attr of code.attributes) {
            if (attr.name.startsWith('data-')) {
                codeDataAttrs[attr.name] = attr.value;
            }
        }
        if (Object.keys(codeDataAttrs).length > 0) {
            console.log('Code data attributes:', codeDataAttrs);
        }
    }

    // Check global Prism state
    console.log('Prism available:', !!window.Prism);
    if (window.Prism) {
        console.log('Prism plugins:', window.Prism.plugins ? Object.keys(window.Prism.plugins) : 'none');
    }

    // Check body classes (prism-* is PhantomSPA's convention for global toggles)
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
