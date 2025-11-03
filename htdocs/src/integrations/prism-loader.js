// File: /src/integrations/prism-loader.js

export async function loadPrismBase(theme = 'prism-tomorrow') {
    const base = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0";

    const css = `${base}/themes/${theme}.min.css`;
    const js = `${base}/prism.min.js`;

    loadCSS(css);
    await loadJS(js);
}

export async function loadPrismLanguages(langs = ['javascript', 'css', 'json']) {
    const base = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components";
    await Promise.all(langs.map(lang => loadJS(`${base}/prism-${lang}.min.js`)));
}

export async function loadPrismPlugins(plugins = ['toolbar', 'line-numbers', 'line-highlight']) {
    const base = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins";
    for (const p of plugins) {
        await Promise.all([
            loadCSS(`${base}/${p}/prism-${p}.min.css`).catch(() => {}),
            loadJS(`${base}/${p}/prism-${p}.min.js`).catch(() => {})
        ]);
    }
}

function loadCSS(href) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`link[href="${href}"]`)) return resolve();
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        l.onload = resolve;
        l.onerror = reject;
        document.head.appendChild(l);
    });
}

function loadJS(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
