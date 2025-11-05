/**
 * Comprehensive Prism.js Per-Block Configuration Debugger
 * 
 * Run this in the browser console to diagnose why Prism features aren't rendering.
 * 
 * Usage:
 *   1. Navigate to routing.md page
 *   2. Open browser console (F12)
 *   3. Copy and paste this entire file into the console
 *   4. Press Enter
 *   5. Review the detailed diagnostic output
 */

(function() {
    console.log('='.repeat(80));
    console.log('PRISM.JS PER-BLOCK CONFIGURATION DEBUGGER');
    console.log('='.repeat(80));
    console.log('');

    // ========================================================================
    // 1. CHECK PRISM.JS AVAILABILITY
    // ========================================================================
    console.log('1. CHECKING PRISM.JS AVAILABILITY');
    console.log('-'.repeat(80));
    
    if (!window.Prism) {
        console.error('❌ Prism.js is NOT loaded!');
        console.log('   → Check if Prism.js script tags are present in index.html');
        console.log('   → Check browser Network tab for failed script loads');
        return;
    }
    console.log('✅ Prism.js is loaded');
    console.log('   Version:', window.Prism.version || 'unknown');
    
    // Check plugins
    console.log('   Plugins loaded:');
    if (window.Prism.plugins) {
        Object.keys(window.Prism.plugins).forEach(plugin => {
            console.log(`      ✅ ${plugin}`);
        });
    } else {
        console.warn('   ⚠️  No plugins detected');
    }
    console.log('');

    // ========================================================================
    // 2. CHECK PRISM CONFIG UTILITY
    // ========================================================================
    console.log('2. CHECKING PRISM CONFIG UTILITY');
    console.log('-'.repeat(80));
    
    // Try to find the module in the global scope or check if functions exist
    const hasApplyPerBlockConfig = typeof window.applyPerBlockPrismConfig === 'function';
    const hasHighlightCode = typeof window.highlightCode === 'function';
    
    if (!hasApplyPerBlockConfig && !hasHighlightCode) {
        console.warn('⚠️  Prism config functions not found in global scope');
        console.log('   → This is expected if using ES6 modules');
        console.log('   → Functions should be imported in router.js');
    } else {
        console.log('✅ Prism config functions available');
    }
    console.log('');

    // ========================================================================
    // 3. CHECK HTML COMMENT DIRECTIVES
    // ========================================================================
    console.log('3. CHECKING HTML COMMENT DIRECTIVES');
    console.log('-'.repeat(80));
    
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_COMMENT,
        null,
        false
    );
    
    const prismComments = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent.trim().startsWith('prism:')) {
            prismComments.push(node);
        }
    }
    
    if (prismComments.length === 0) {
        console.log('⚠️  No HTML comment directives found in DOM');
        console.log('   → Comments may have been removed during processing (this is expected)');
        console.log('   → Check the markdown source file for <!-- prism: ... --> comments');
    } else {
        console.log(`✅ Found ${prismComments.length} HTML comment directive(s):`);
        prismComments.forEach((comment, i) => {
            console.log(`   ${i + 1}. ${comment.textContent.trim()}`);
            const nextElement = comment.nextElementSibling;
            if (nextElement && nextElement.tagName === 'PRE') {
                console.log(`      → Next element: <pre class="${nextElement.className}">`);
            } else {
                console.warn(`      ⚠️  Next element is NOT a <pre>:`, nextElement?.tagName);
            }
        });
    }
    console.log('');

    // ========================================================================
    // 4. CHECK CODE BLOCKS
    // ========================================================================
    console.log('4. CHECKING CODE BLOCKS');
    console.log('-'.repeat(80));
    
    const allPre = document.querySelectorAll('pre');
    const codeBlocks = Array.from(allPre).filter(pre => 
        pre.className.includes('language-') || pre.querySelector('code[class*="language-"]')
    );
    
    console.log(`Found ${codeBlocks.length} code block(s):`);
    console.log('');
    
    codeBlocks.forEach((pre, index) => {
        console.log(`CODE BLOCK #${index + 1}:`);
        console.log(`   <pre> element:`);
        console.log(`      Classes: ${pre.className || '(none)'}`);
        console.log(`      Has language-* class: ${/language-\w+/.test(pre.className)}`);
        console.log(`      Has line-numbers class: ${pre.classList.contains('line-numbers')}`);
        console.log(`      Has data-line attribute: ${pre.hasAttribute('data-line')}`);
        console.log(`      data-line value: ${pre.getAttribute('data-line') || '(none)'}`);
        console.log(`      Has data-prism-configured: ${pre.hasAttribute('data-prism-configured')}`);
        console.log(`      tabindex: ${pre.getAttribute('tabindex') || '(none)'}`);
        
        const code = pre.querySelector('code');
        if (code) {
            console.log(`   <code> element:`);
            console.log(`      Classes: ${code.className || '(none)'}`);
            console.log(`      Has language-* class: ${/language-\w+/.test(code.className)}`);
        } else {
            console.warn(`   ⚠️  No <code> element found inside <pre>`);
        }
        
        // Check for Prism-generated elements
        const lineNumbersRows = pre.querySelector('.line-numbers-rows');
        console.log(`   Line numbers (.line-numbers-rows):`);
        if (lineNumbersRows) {
            console.log(`      ✅ Present (${lineNumbersRows.children.length} rows)`);
        } else {
            console.log(`      ❌ NOT present`);
            if (pre.classList.contains('line-numbers')) {
                console.warn(`      ⚠️  <pre> has .line-numbers class but no .line-numbers-rows element!`);
                console.log(`      → This means the line-numbers plugin did NOT run`);
            }
        }
        
        // Check parent wrapper
        const parent = pre.parentElement;
        console.log(`   Parent wrapper:`);
        console.log(`      Tag: ${parent?.tagName || '(none)'}`);
        console.log(`      Classes: ${parent?.className || '(none)'}`);
        console.log(`      Is code-toolbar: ${parent?.classList.contains('code-toolbar')}`);
        console.log(`      Has prism-block-configured: ${parent?.classList.contains('prism-block-configured')}`);
        
        if (parent?.classList.contains('code-toolbar')) {
            const toolbar = parent.querySelector('.toolbar');
            console.log(`   Toolbar (.toolbar):`);
            if (toolbar) {
                console.log(`      ✅ Present`);
                const toolbarItems = toolbar.querySelectorAll('.toolbar-item');
                console.log(`      Toolbar items: ${toolbarItems.length}`);
                toolbarItems.forEach((item, i) => {
                    const button = item.querySelector('button');
                    const link = item.querySelector('a');
                    const label = item.querySelector('.language-label');
                    if (button) console.log(`         ${i + 1}. Button: ${button.textContent || button.getAttribute('data-copy-state')}`);
                    if (link) console.log(`         ${i + 1}. Link: ${link.textContent || 'Download'}`);
                    if (label) console.log(`         ${i + 1}. Label: ${label.textContent}`);
                });
            } else {
                console.log(`      ❌ NOT present`);
                console.warn(`      ⚠️  Parent is .code-toolbar but no .toolbar element!`);
            }
        } else {
            console.log(`   Toolbar: ❌ NOT present (no .code-toolbar wrapper)`);
            console.warn(`      ⚠️  The toolbar plugin did NOT run`);
        }
        
        // Check for line-highlight elements
        const lineHighlights = parent?.querySelectorAll('.line-highlight') || [];
        console.log(`   Line highlights (.line-highlight):`);
        if (lineHighlights.length > 0) {
            console.log(`      ✅ Present (${lineHighlights.length} element(s))`);
            lineHighlights.forEach((el, i) => {
                console.log(`         ${i + 1}. Lines ${el.getAttribute('data-start')}-${el.getAttribute('data-end') || el.getAttribute('data-start')}`);
            });
        } else {
            console.log(`      ❌ NOT present`);
            if (pre.hasAttribute('data-line')) {
                console.warn(`      ⚠️  <pre> has data-line="${pre.getAttribute('data-line')}" but no .line-highlight elements!`);
                console.log(`      → This means the line-highlight plugin did NOT run`);
            }
        }
        
        console.log('');
    });

    // ========================================================================
    // 5. CHECK GLOBAL PRISM CONFIG
    // ========================================================================
    console.log('5. CHECKING GLOBAL PRISM CONFIG');
    console.log('-'.repeat(80));
    
    const bodyClasses = document.body.className.split(' ').filter(c => c.startsWith('prism-'));
    if (bodyClasses.length > 0) {
        console.log('Body classes (global config):');
        bodyClasses.forEach(cls => {
            console.log(`   ${cls}`);
        });
    } else {
        console.log('No prism-* body classes found');
    }
    
    // Check localStorage
    const storedConfig = localStorage.getItem('prismConfig');
    if (storedConfig) {
        console.log('LocalStorage config:');
        try {
            const config = JSON.parse(storedConfig);
            console.log('   ', config);
        } catch (e) {
            console.error('   ❌ Failed to parse:', e);
        }
    } else {
        console.log('No config in localStorage');
    }
    console.log('');

    // ========================================================================
    // 6. CHECK CSS LOADING
    // ========================================================================
    console.log('6. CHECKING CSS LOADING');
    console.log('-'.repeat(80));
    
    const prismStylesheets = Array.from(document.styleSheets).filter(sheet => {
        try {
            return sheet.href && (
                sheet.href.includes('prism') || 
                sheet.href.includes('styles.css')
            );
        } catch (e) {
            return false;
        }
    });
    
    console.log(`Found ${prismStylesheets.length} Prism-related stylesheet(s):`);
    prismStylesheets.forEach(sheet => {
        console.log(`   ${sheet.href}`);
    });
    console.log('');

    // ========================================================================
    // 7. DIAGNOSTIC SUMMARY
    // ========================================================================
    console.log('7. DIAGNOSTIC SUMMARY');
    console.log('-'.repeat(80));
    
    const issues = [];
    
    if (!window.Prism) {
        issues.push('❌ Prism.js is not loaded');
    }
    
    if (!window.Prism?.plugins?.toolbar) {
        issues.push('❌ Toolbar plugin is not loaded');
    }
    
    if (!window.Prism?.plugins?.lineNumbers) {
        issues.push('❌ Line Numbers plugin is not loaded');
    }
    
    if (!window.Prism?.plugins?.lineHighlight) {
        issues.push('❌ Line Highlight plugin is not loaded');
    }
    
    codeBlocks.forEach((pre, i) => {
        if (pre.classList.contains('line-numbers') && !pre.querySelector('.line-numbers-rows')) {
            issues.push(`❌ Block #${i + 1}: Has .line-numbers class but no .line-numbers-rows element`);
        }
        
        if (pre.hasAttribute('data-line') && !pre.parentElement?.querySelector('.line-highlight')) {
            issues.push(`❌ Block #${i + 1}: Has data-line attribute but no .line-highlight elements`);
        }
        
        if (!pre.parentElement?.classList.contains('code-toolbar')) {
            issues.push(`❌ Block #${i + 1}: No .code-toolbar wrapper (toolbar plugin didn't run)`);
        }
        
        if (!pre.className.includes('language-')) {
            const code = pre.querySelector('code[class*="language-"]');
            if (code) {
                issues.push(`⚠️  Block #${i + 1}: Language class on <code> but not on <pre>`);
            }
        }
    });
    
    if (issues.length === 0) {
        console.log('✅ No issues detected! Everything looks good.');
        console.log('   If features are still not visible, check:');
        console.log('   1. Browser zoom level (try 100%)');
        console.log('   2. CSS display/visibility properties');
        console.log('   3. Element positioning (check if elements are off-screen)');
    } else {
        console.log('Issues detected:');
        issues.forEach(issue => {
            console.log(`   ${issue}`);
        });
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log('END OF DIAGNOSTIC REPORT');
    console.log('='.repeat(80));
})();

