// spa.js — PhantomSPA Kernel Bootstrapper with fallback path support

import { markdownToHtml } from '../utilities/markdown.js';

async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load config: ${url}`);
    const text = await res.text();
    return JSON.parse(text);  // Fixed: Use JSON.parse instead of eval for security
}

async function loadScript(path) {
    return import(path).catch((err) => {
        console.error(`[spa.js] Failed to load plugin: ${path}`, err);
    });
}

async function bootstrap(configUrl) {
    const rootEl = document.querySelector('[data-config]');
    if (!rootEl) {
        console.error('[spa.js] No <main> element with data-config');
        return;
    }

    // Initialize window.spa object with core functionality
    window.spa = {
        renderMarkdown: async (mdText) => {
            return await markdownToHtml(mdText);
        },
        config: {},
        plugins: [],
        events: new EventTarget()
    };

    const appConfig = await loadJSON(configUrl);
    window.spa.config = appConfig;

    const pluginDefs = appConfig.plugins || {};
    const pluginList = [];

    for (const [name, plugin] of Object.entries(pluginDefs)) {
        const isPathOnly = typeof plugin === 'string';
        const path = isPathOnly
            ? plugin
            : plugin.path || `/src/plugins/${name}.js`; // ✅ Smart fallback

        // Pass both plugin options AND appConfig to plugins
        const options = isPathOnly ? { config: appConfig } : {
            ...plugin.options,
            config: appConfig
        };

        const mod = await loadScript(path);
        if (mod?.setup) {
            mod.setup(window.spa, options);
            pluginList.push({ name, setup: mod.setup });
        } else {
            console.warn(`[spa.js] Plugin "${name}" loaded but has no setup()`);
        }
    }

    window.spa.plugins = pluginList;

    // Optional router/nav bootstrap alignment
    const routerScript = document.querySelector('script[src*="router.js"]');
    if (routerScript && appConfig.nav) {
        routerScript.setAttribute('data-nav', appConfig.nav);
    }

    const navScript = document.querySelector('script[src*="nav.js"]');
    if (navScript && appConfig.nav) {
        navScript.setAttribute('data-nav', appConfig.nav);
    }

    console.info('[spa.js] PhantomSPA boot complete', {
        config: appConfig,
        plugins: pluginList.map(p => p.name)
    });
}

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const configPath = document.querySelector('[data-config]')?.getAttribute('data-config');
    if (configPath) {
        bootstrap(configPath).catch(err => {
            console.error('[spa.js] Failed to initialize app', err);
        });
    }
});
