# Prism.js Per-Block Configuration - Text-Based Execution Flow

**Date**: 2025-11-04

---

## Complete Execution Flow (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: PAGE LOAD (Synchronous)                                           │
└─────────────────────────────────────────────────────────────────────────────┘

1. Browser loads index.html
   ↓
2. Execute: <script>window.Prism = window.Prism || {}; window.Prism.manual = true;</script>
   ├─ Location: htdocs/docs/dev/index.html (lines 23-27)
   └─ Result: Prism automatic highlighting DISABLED ✅
   ↓
3. Load Prism.js core from CDN
   ├─ URL: https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js
   └─ Result: window.Prism object created
   ↓
4. Load Prism.js plugins from CDN (in order):
   ├─ toolbar.js (MUST load first)
   ├─ copy-to-clipboard.js
   ├─ download-button.js
   ├─ show-language.js
   ├─ line-numbers.js
   ├─ line-highlight.js
   └─ command-line.js
   └─ Result: Plugins register hooks but DON'T execute yet
   ↓
5. Load router.js module
   └─ Location: htdocs/src/router.js


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: INITIALIZATION (Asynchronous)                                     │
└─────────────────────────────────────────────────────────────────────────────┘

6. DOMContentLoaded event fires
   ↓
7. Router auto-initialization
   ├─ Location: htdocs/src/router.js (lines 230-258)
   └─ Calls: setup(window.spa, options)
   ↓
8. setup() function executes
   ├─ Location: htdocs/src/router.js (line 16)
   └─ Inside setup():
      ↓
      9. prismConfig = loadPrismConfig()
         ├─ Location: htdocs/src/utilities/prism-config.js (lines 11-30)
         ├─ Reads: localStorage.getItem('prismConfig')
         └─ Returns: { showToolbar: true, showLineNumbers: true, ... }
         ↓
      10. applyPrismConfig(prismConfig)
          ├─ Location: htdocs/src/utilities/prism-config.js (lines 32-78)
          ├─ Adds body classes based on config:
          │  ├─ If showToolbar === false → body.prism-no-toolbar
          │  ├─ If showLineNumbers === false → body.prism-no-line-numbers
          │  ├─ If showLineHighlight === false → body.prism-no-line-highlight
          │  └─ etc.
          └─ Result: Global CSS rules can hide features


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: NAVIGATION (Asynchronous)                                         │
└─────────────────────────────────────────────────────────────────────────────┘

11. fetchRoutes()
    ├─ Location: htdocs/src/router.js (line 169)
    └─ Loads: /docs/dev/conf/nav.json
    ↓
12. handleNavigation()
    ├─ Location: htdocs/src/router.js (line 107)
    └─ Determines which page to load
    ↓
13. fetch('/docs/dev/pages/routing.md')
    └─ Returns: Raw markdown content
    ↓
14. spa.renderMarkdown(content)
    ├─ Uses: Snarkdown library
    ├─ Converts: Markdown → HTML
    └─ Output: <pre class="code json"><code class="language-json">...</code></pre>
    ↓
15. main.innerHTML = html
    ├─ Location: htdocs/src/router.js (line 145)
    └─ Result: HTML injected into DOM
       ├─ Code blocks exist
       ├─ HTML comments exist (<!-- prism: ... -->)
       └─ NOT highlighted yet ⚠️


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: PER-BLOCK CONFIGURATION (Synchronous)                             │
└─────────────────────────────────────────────────────────────────────────────┘

16. applyPerBlockPrismConfig(main)
    ├─ Location: htdocs/src/router.js (line 156)
    ├─ Function: htdocs/src/utilities/prism-config.js (lines 342-418)
    └─ Process:
       ↓
       17. Create TreeWalker to find HTML comments
           ├─ document.createTreeWalker(container, NodeFilter.SHOW_COMMENT)
           └─ Returns: All HTML comment nodes
           ↓
       18. For each comment:
           ├─ Check if matches: /^prism:\s*(.+)$/i
           ├─ If not a prism directive → skip
           └─ If is a prism directive:
              ↓
              19. parseDirectiveOptions(directiveText)
                  ├─ Input: "toolbar line-numbers highlight=2,4-6 copy-to-clipboard download-button show-language"
                  └─ Output: {
                       lineNumbers: true,
                       highlight: "2,4-6",
                       copyToClipboard: true,
                       downloadButton: true,
                       showLanguage: true,
                       toolbar: true
                     }
                  ↓
              20. Find next <pre> element
                  ├─ Skip whitespace text nodes
                  └─ Get next sibling that is a PRE element
                  ↓
              21. Copy language class from <code> to <pre>
                  ├─ Snarkdown puts: <pre class="code json"><code class="language-json">
                  ├─ We need: <pre class="code json language-json"><code class="language-json">
                  └─ Result: pre.classList.add('language-json') ✅
                  ↓
              22. applyDirectiveOptions(pre, options)
                  ├─ Location: htdocs/src/utilities/prism-config.js (lines 504-537)
                  └─ Applies:
                     ├─ pre.classList.add('line-numbers')
                     ├─ pre.setAttribute('data-line', '2,4-6')
                     ├─ pre.setAttribute('data-prism-configured', 'true')
                     ├─ pre.setAttribute('data-prism-copy', 'true')
                     ├─ pre.setAttribute('data-prism-download', 'true')
                     └─ pre.setAttribute('data-prism-language', 'true')
                  ↓
              23. Remove HTML comment from DOM
                  └─ comment.remove()

       Result: <pre> element now has ALL classes and attributes ✅


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: HIGHLIGHTING & PLUGIN EXECUTION (Synchronous + Hooks) 🔥 CRITICAL │
└─────────────────────────────────────────────────────────────────────────────┘

24. highlightCode(main, prismConfig)
    ├─ Location: htdocs/src/router.js (line 159)
    ├─ Function: htdocs/src/utilities/prism-config.js (lines 80-174)
    └─ Process:
       ↓
       25. Find all <pre> elements
           ├─ container.querySelectorAll('pre')
           └─ Filter for elements with language-* classes
           ↓
       26. For each code block:
           ├─ Check: pre.hasAttribute('data-prism-configured')
           ├─ If YES → Skip global config (per-block takes precedence)
           └─ If NO → Apply global config
           ↓
       27. Clear highlighting markers
           ├─ code.removeAttribute('data-highlighted')
           └─ code.classList.remove('highlighted')
           ↓
       28. 🔥 CRITICAL CALL: Prism.highlightElement(code, false)
           ├─ Location: htdocs/src/utilities/prism-config.js (line 155)
           └─ This is where ALL the magic happens!

           ┌─────────────────────────────────────────────────────────────────┐
           │ INSIDE Prism.highlightElement() - Prism Core                   │
           └─────────────────────────────────────────────────────────────────┘
           
           29. Prism parses code content
               ├─ Reads: code.textContent
               └─ Tokenizes based on language grammar
               ↓
           30. Prism applies syntax highlighting
               ├─ Wraps tokens in <span class="token ..."> elements
               └─ Example: <span class="token punctuation">{</span>
               ↓
           31. Prism sets data-highlighted attribute
               └─ code.setAttribute('data-highlighted', 'yes')

           ┌─────────────────────────────────────────────────────────────────┐
           │ PLUGIN HOOKS EXECUTE (This is where visual features are created)│
           └─────────────────────────────────────────────────────────────────┘
           
           32. Line Numbers Plugin Hook
               ├─ Checks: pre.classList.contains('line-numbers')
               └─ If TRUE:
                  ├─ Creates: <span class="line-numbers-rows"></span>
                  ├─ Adds child <span> for each line
                  ├─ Inserts: Inside <pre> after <code>
                  └─ Result: Line numbers appear in gutter ✅
               ↓
           33. Toolbar Plugin Hook
               ├─ Checks: Is toolbar plugin loaded?
               └─ If TRUE:
                  ├─ Creates: <div class="code-toolbar"></div>
                  ├─ Moves: <pre> inside wrapper
                  ├─ Creates: <div class="toolbar"></div>
                  ├─ Inserts: Toolbar as sibling of <pre> inside wrapper
                  └─ Result: Toolbar wrapper created ✅
                  ↓
                  34. Copy-to-Clipboard Plugin Hook
                      ├─ Checks: Is copy plugin loaded?
                      └─ If TRUE:
                         ├─ Creates: <button data-copy-state="copy">Copy</button>
                         ├─ Adds: To toolbar
                         └─ Result: Copy button appears ✅
                      ↓
                  35. Download-Button Plugin Hook
                      ├─ Checks: Is download plugin loaded?
                      └─ If TRUE:
                         ├─ Creates: <a download="file.json">Download</a>
                         ├─ Adds: To toolbar
                         └─ Result: Download button appears ✅
                      ↓
                  36. Show-Language Plugin Hook
                      ├─ Checks: Is language plugin loaded?
                      └─ If TRUE:
                         ├─ Creates: <span class="language-label">JSON</span>
                         ├─ Adds: To toolbar
                         └─ Result: Language badge appears ✅
               ↓
           37. Line Highlight Plugin Hook
               ├─ Checks: pre.hasAttribute('data-line')
               └─ If TRUE:
                  ├─ Parses: data-line="2,4-6"
                  ├─ Creates: <span class="line-highlight" data-start="2" data-end="2">
                  ├─ Creates: <span class="line-highlight" data-start="4" data-end="6">
                  ├─ Inserts: As siblings of <pre> (inside wrapper if it exists)
                  ├─ Calculates: CSS top position for each span
                  └─ Result: Highlighted lines appear ✅

       Result: All visual features should now be visible! ✅


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: POST-PROCESSING (Asynchronous)                                    │
└─────────────────────────────────────────────────────────────────────────────┘

38. setTimeout(callback, 100)
    ├─ Location: htdocs/src/utilities/prism-config.js (line 163)
    └─ Purpose: Wait for Prism plugins to finish creating DOM elements
    ↓
39. After 100ms, callback executes:
    └─ For each <pre> with data-prism-configured="true":
       ├─ Get parent element
       ├─ Check if parent.classList.contains('code-toolbar')
       └─ If YES:
          ├─ wrapper.classList.add('prism-block-configured')
          └─ Purpose: Mark wrapper so CSS can exclude it from global hiding rules


┌─────────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: FINAL DOM STATE                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Expected DOM Structure:

<div class="code-toolbar prism-block-configured">
  <pre class="code json line-numbers language-json" 
       data-line="2,4-6" 
       data-prism-configured="true" 
       data-prism-copy="true" 
       data-prism-download="true" 
       data-prism-language="true" 
       tabindex="0">
    <code class="language-json" data-highlighted="yes">
      <span class="token punctuation">{</span>
      <span class="token property">"basePath"</span>
      <span class="token operator">:</span>
      <span class="token string">"/docs/dev/"</span>
      ...
    </code>
    <span class="line-numbers-rows">
      <span></span>  <!-- Line 1 -->
      <span></span>  <!-- Line 2 -->
      <span></span>  <!-- Line 3 -->
      ...
    </span>
  </pre>
  <span class="line-highlight" data-start="2" data-end="2" style="top: 38px;"></span>
  <span class="line-highlight" data-start="4" data-end="6" style="top: 76px; height: 57px;"></span>
  <div class="toolbar">
    <div class="toolbar-item">
      <button data-copy-state="copy">Copy</button>
    </div>
    <div class="toolbar-item">
      <a download="file.json">Download</a>
    </div>
    <div class="toolbar-item">
      <span class="language-label">JSON</span>
    </div>
  </div>
</div>
```

---

## Key Takeaways

1. **Prism.manual = true** is CRITICAL - Without this, Prism highlights code before our config is applied
2. **Plugin execution happens inside Prism.highlightElement()** - This is the single most important call
3. **Classes and attributes must be set BEFORE highlighting** - That's why Phase 4 comes before Phase 5
4. **Plugins check for specific classes/attributes** - They won't run if these aren't present
5. **If plugins don't run, NO visual elements are created** - This is your current issue

---

## Diagnostic Question

**Where is the process failing for you?**

Run this in console to find out:

```javascript
console.log('Phase 5 Check:', {
    prismLoaded: !!window.Prism,
    highlightElementExists: typeof window.Prism?.highlightElement === 'function',
    pluginsLoaded: Object.keys(window.Prism?.plugins || {}),
    codeHighlighted: document.querySelector('code[data-highlighted]') !== null,
    lineNumbersCreated: document.querySelector('.line-numbers-rows') !== null,
    toolbarCreated: document.querySelector('.code-toolbar') !== null
});
```

This will tell us if Phase 5 (the critical phase) is executing correctly.

