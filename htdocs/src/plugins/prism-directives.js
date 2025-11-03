/**
 * @file PrismJS plugin for PhantomSPA
 * @version 1.2.0
 *
 * Dynamically loads PrismJS core, theme, language dependencies,
 * plugin extensions, and highlights all code blocks.
 * Includes grammar validation and dev warnings for misconfigured blocks.
 */

export function setup(spa, options = {}) {
    const CDN = options.cdn || 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0';
    const theme = options.theme || 'default';
    const languages = normalizeLanguages(options.languages || []);
    const extensions = options.extensions || {};

    const pluginsWithoutCSS = new Set([
        'copy-to-clipboard',
        'normalize-whitespace',
        'autoloader',
        'jsonp-highlight'
    ]);

    const dependencies = {
        javascript: ['clike'],
        typescript: ['clike', 'javascript'],
        php: ['clike', 'markup'],
        jsx: ['markup', 'clike', 'javascript'],
        tsx: ['markup', 'clike', 'typescript'],
        java: ['clike'],
        c: ['clike'],
        cpp: ['clike'],
        go: [],
        ruby: [],
        python: [],
        markup: [],
        css: [],
    };

    loadAll()
        .then(() => {
            console.log('[prism] Initialized');
            highlightOnReady();
            validateCodeBlocks();
        })
        .catch(err => {
            console.error('[prism] Initialization error:', err);
        });

    function normalizeLanguages(langs) {
        return langs.map(lang => (lang === 'html' ? 'markup' : lang));
    }

    async function loadAll() {
        applyTheme(theme);
        await loadScript(`${CDN}/components/prism-core.min.js`);
        await loadLanguagesInOrder(languages);
        verifyLoadedLanguages(languages);
        await loadExtensions(extensions);
    }

    function applyTheme(themeName) {
        const id = 'prism-theme-link';
        const href = `${CDN}/themes/prism-${themeName}.min.css`;
        document.documentElement.setAttribute('data-theme', themeName);

        let link = document.getElementById(id);
        if (!link) {
            link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        link.href = href;
        link.onerror = () => console.error('[prism] theme load failed:', href);
        link.onload = () => console.log('[prism] theme loaded:', themeName);
    }

    async function loadLanguagesInOrder(langs = []) {
        const loaded = new Set();

        for (const lang of langs) {
            const deps = dependencies[lang] || [];
            for (const dep of deps) {
                if (!loaded.has(dep)) {
                    await loadScript(`${CDN}/components/prism-${dep}.min.js`);
                    loaded.add(dep);
                }
            }

            if (!loaded.has(lang)) {
                await loadScript(`${CDN}/components/prism-${lang}.min.js`);
                loaded.add(lang);
            }
        }
    }

    function verifyLoadedLanguages(langs) {
        langs.forEach(lang => {
            if (!window.Prism?.languages?.[lang]) {
                console.warn(`[prism] Prism.languages["${lang}"] is missing`);
            }
        });
    }

    async function loadExtensions(extMap = {}) {
        const entries = Object.entries(extMap).filter(([_, conf]) => conf?.active);
        return Promise.all(
            entries.map(async ([name]) => {
                const base = `${CDN}/plugins/${name}/prism-${name}.min`;
                await loadScript(`${base}.js`);
                if (!pluginsWithoutCSS.has(name)) {
                    await loadStyle(`${base}.css`);
                }
            })
        );
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = src;
            el.defer = true;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error(`[prism] script load failed: ${src}`));
            document.head.appendChild(el);
        });
    }

    function loadStyle(href) {
        return new Promise((resolve, reject) => {
            const el = document.createElement('link');
            el.rel = 'stylesheet';
            el.href = href;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error(`[prism] style load failed: ${href}`));
            document.head.appendChild(el);
        });
    }

    function highlightOnReady() {
        if (window.Prism && typeof Prism.highlightAll === 'function') {
            requestAnimationFrame(() => {
                try {
                    Prism.highlightAll();
                } catch (err) {
                    console.error('[prism] highlightAll failed:', err);
                }
            });
        }
    }

    function validateCodeBlocks() {
        const blocks = document.querySelectorAll('pre code');
        const validLangRE = /^language-[\w-]+$/;

        blocks.forEach(code => {
            const classList = [...code.classList];
            const hasValidLang = classList.some(cls => validLangRE.test(cls));

            if (!hasValidLang) {
                console.warn('[prism] Invalid or missing language-* class:', code);
            }
        });
    }
}
