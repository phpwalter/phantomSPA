/**
 * Quick Prism.js Diagnostic Script
 * 
 * Copy this entire file and paste into browser console to diagnose
 * why Prism.js plugins are not rendering visual features.
 * 
 * Usage:
 * 1. Navigate to the page with the code block
 * 2. Open browser console (F12)
 * 3. Copy this entire file
 * 4. Paste into console and press Enter
 * 5. Review the diagnostic output
 */

console.log('='.repeat(80));
console.log('PRISM.JS DIAGNOSTIC SCRIPT');
console.log('='.repeat(80));
console.log('');

// ============================================================================
// 1. CHECK IF PRISM IS LOADED
// ============================================================================
console.log('1. CHECKING IF PRISM.JS IS LOADED...');
console.log('-'.repeat(80));

if (typeof window.Prism === 'undefined') {
    console.error('❌ CRITICAL: window.Prism is undefined!');
    console.error('   Prism.js is NOT loaded.');
    console.error('   Check network tab for failed CDN requests.');
    console.log('');
} else {
    console.log('✅ window.Prism exists');
    console.log('   Prism.manual:', window.Prism.manual);
    console.log('   Prism.version:', window.Prism.version || 'unknown');
    console.log('   Prism.highlightElement:', typeof window.Prism.highlightElement);
    console.log('   Prism.highlightAll:', typeof window.Prism.highlightAll);
    console.log('');
}

// ============================================================================
// 2. CHECK IF PLUGINS ARE LOADED
// ============================================================================
console.log('2. CHECKING IF PLUGINS ARE LOADED...');
console.log('-'.repeat(80));

if (window.Prism && window.Prism.plugins) {
    const plugins = Object.keys(window.Prism.plugins);
    console.log('✅ Prism.plugins exists');
    console.log('   Loaded plugins:', plugins);
    console.log('');
    
    const requiredPlugins = [
        'toolbar',
        'copy-to-clipboard',
        'download-button',
        'show-language',
        'line-numbers',
        'line-highlight'
    ];
    
    requiredPlugins.forEach(plugin => {
        if (plugins.includes(plugin)) {
            console.log(`   ✅ ${plugin} plugin loaded`);
        } else {
            console.error(`   ❌ ${plugin} plugin NOT loaded`);
        }
    });
    console.log('');
} else {
    console.error('❌ CRITICAL: Prism.plugins is undefined!');
    console.error('   No plugins are loaded.');
    console.log('');
}

// ============================================================================
// 3. CHECK CODE BLOCK STRUCTURE
// ============================================================================
console.log('3. CHECKING CODE BLOCK STRUCTURE...');
console.log('-'.repeat(80));

const pre = document.querySelector('pre[data-prism-configured]');

if (!pre) {
    console.error('❌ No <pre> element with data-prism-configured found!');
    console.error('   Per-block configuration was not applied.');
    console.log('');
} else {
    console.log('✅ Found <pre> element with data-prism-configured');
    console.log('   Classes:', pre.className);
    console.log('   Attributes:');
    console.log('     data-line:', pre.getAttribute('data-line'));
    console.log('     data-prism-configured:', pre.getAttribute('data-prism-configured'));
    console.log('     data-prism-copy:', pre.getAttribute('data-prism-copy'));
    console.log('     data-prism-download:', pre.getAttribute('data-prism-download'));
    console.log('     data-prism-language:', pre.getAttribute('data-prism-language'));
    console.log('');
    
    const code = pre.querySelector('code');
    if (!code) {
        console.error('   ❌ No <code> element inside <pre>!');
        console.log('');
    } else {
        console.log('   ✅ Found <code> element');
        console.log('     Classes:', code.className);
        console.log('     data-highlighted:', code.getAttribute('data-highlighted'));
        console.log('');
    }
}

// ============================================================================
// 4. CHECK FOR PLUGIN-GENERATED ELEMENTS
// ============================================================================
console.log('4. CHECKING FOR PLUGIN-GENERATED ELEMENTS...');
console.log('-'.repeat(80));

if (pre) {
    // Check for line-numbers-rows
    const lineNumbersRows = pre.querySelector('.line-numbers-rows');
    if (lineNumbersRows) {
        console.log('✅ .line-numbers-rows element exists');
        console.log('   Line numbers plugin ran successfully');
    } else {
        console.error('❌ .line-numbers-rows element NOT found');
        console.error('   Line numbers plugin did NOT run');
    }
    
    // Check for code-toolbar wrapper
    const wrapper = pre.parentElement;
    if (wrapper && wrapper.classList.contains('code-toolbar')) {
        console.log('✅ .code-toolbar wrapper exists');
        console.log('   Toolbar plugin ran successfully');
        console.log('   Wrapper classes:', wrapper.className);
        
        // Check for toolbar
        const toolbar = wrapper.querySelector('.toolbar');
        if (toolbar) {
            console.log('   ✅ .toolbar element exists');
            
            // Check for toolbar items
            const copyBtn = toolbar.querySelector('[data-copy-state]');
            const downloadBtn = toolbar.querySelector('a[download]');
            const languageLabel = toolbar.querySelector('.language-label');
            
            console.log('   Toolbar items:');
            console.log('     Copy button:', copyBtn ? '✅ exists' : '❌ missing');
            console.log('     Download button:', downloadBtn ? '✅ exists' : '❌ missing');
            console.log('     Language label:', languageLabel ? '✅ exists' : '❌ missing');
        } else {
            console.error('   ❌ .toolbar element NOT found');
        }
        
        // Check for line-highlight spans
        const lineHighlights = wrapper.querySelectorAll('.line-highlight');
        if (lineHighlights.length > 0) {
            console.log(`   ✅ ${lineHighlights.length} .line-highlight element(s) exist`);
            lineHighlights.forEach((span, i) => {
                console.log(`     Highlight ${i + 1}:`, {
                    'data-start': span.getAttribute('data-start'),
                    'data-end': span.getAttribute('data-end'),
                    'style.top': span.style.top
                });
            });
        } else {
            console.error('   ❌ .line-highlight elements NOT found');
            console.error('   Line highlight plugin did NOT run');
        }
    } else {
        console.error('❌ .code-toolbar wrapper NOT found');
        console.error('   Toolbar plugin did NOT run');
        console.error('   Parent element:', wrapper ? wrapper.nodeName : 'none');
        console.error('   Parent classes:', wrapper ? wrapper.className : 'n/a');
    }
    console.log('');
}

// ============================================================================
// 5. CHECK GLOBAL PRISM CONFIG (BODY CLASSES)
// ============================================================================
console.log('5. CHECKING GLOBAL PRISM CONFIG (BODY CLASSES)...');
console.log('-'.repeat(80));

const bodyClasses = document.body.className;
console.log('Body classes:', bodyClasses || '(none)');

const prismBodyClasses = [
    'prism-no-toolbar',
    'prism-no-line-numbers',
    'prism-no-line-highlight',
    'prism-no-copy',
    'prism-no-download',
    'prism-no-language',
    'prism-no-command-line'
];

prismBodyClasses.forEach(cls => {
    if (document.body.classList.contains(cls)) {
        console.log(`  ⚠️  ${cls} is SET (feature disabled globally)`);
    } else {
        console.log(`  ✅ ${cls} is NOT set (feature enabled globally)`);
    }
});
console.log('');

// ============================================================================
// 6. TRY MANUAL HIGHLIGHTING
// ============================================================================
console.log('6. ATTEMPTING MANUAL HIGHLIGHTING...');
console.log('-'.repeat(80));

if (pre && window.Prism && window.Prism.highlightElement) {
    const code = pre.querySelector('code');
    if (code) {
        console.log('Calling Prism.highlightElement(code, false)...');
        try {
            window.Prism.highlightElement(code, false);
            console.log('✅ Prism.highlightElement() executed without errors');
            console.log('   Check DOM to see if elements were created');
            
            // Re-check for plugin elements
            setTimeout(() => {
                console.log('');
                console.log('Re-checking after manual highlight...');
                const lineNumbersRows = pre.querySelector('.line-numbers-rows');
                const wrapper = pre.parentElement;
                const toolbar = wrapper?.querySelector('.toolbar');
                
                console.log('  .line-numbers-rows:', lineNumbersRows ? '✅ NOW exists' : '❌ still missing');
                console.log('  .code-toolbar wrapper:', wrapper?.classList.contains('code-toolbar') ? '✅ NOW exists' : '❌ still missing');
                console.log('  .toolbar:', toolbar ? '✅ NOW exists' : '❌ still missing');
                console.log('  data-highlighted:', code.getAttribute('data-highlighted') || '❌ not set');
                console.log('');
            }, 200);
        } catch (err) {
            console.error('❌ Prism.highlightElement() threw an error:');
            console.error(err);
            console.log('');
        }
    } else {
        console.error('❌ No <code> element to highlight');
        console.log('');
    }
} else {
    console.error('❌ Cannot attempt manual highlighting');
    if (!pre) console.error('   No <pre> element found');
    if (!window.Prism) console.error('   Prism not loaded');
    if (!window.Prism?.highlightElement) console.error('   Prism.highlightElement not available');
    console.log('');
}

// ============================================================================
// 7. SUMMARY
// ============================================================================
console.log('='.repeat(80));
console.log('DIAGNOSTIC SUMMARY');
console.log('='.repeat(80));

const issues = [];

if (typeof window.Prism === 'undefined') {
    issues.push('❌ CRITICAL: Prism.js is not loaded');
}

if (!window.Prism?.plugins || Object.keys(window.Prism.plugins).length === 0) {
    issues.push('❌ CRITICAL: No Prism plugins are loaded');
}

if (!pre) {
    issues.push('❌ No code block with per-block configuration found');
}

if (pre && !pre.querySelector('.line-numbers-rows')) {
    issues.push('❌ Line numbers plugin did not create .line-numbers-rows');
}

if (pre && (!pre.parentElement || !pre.parentElement.classList.contains('code-toolbar'))) {
    issues.push('❌ Toolbar plugin did not create .code-toolbar wrapper');
}

if (pre) {
    const code = pre.querySelector('code');
    if (code && !code.getAttribute('data-highlighted')) {
        issues.push('❌ Code was not highlighted (no data-highlighted attribute)');
    }
}

if (issues.length === 0) {
    console.log('✅ No critical issues found!');
    console.log('   All plugins appear to have run successfully.');
    console.log('   If visual features are still not appearing, check CSS.');
} else {
    console.log('Found', issues.length, 'issue(s):');
    console.log('');
    issues.forEach(issue => console.log(issue));
}

console.log('');
console.log('='.repeat(80));
console.log('END OF DIAGNOSTIC');
console.log('='.repeat(80));

