/**
 * @file nav-tree.js
 * @version 2.1.0
 * @description PhantomSPA navigation tree plugin
 * Renders a recursive sidebar nav from nav.json with no dependencies.
 * Supports basePath-aware links, <details> persistence, lazy-loading, and active highlighting.
 */

/**
 * Plugin initialization function called by the plugin manager
 * @param {PluginManager} pluginManager - The plugin manager instance
 * @param {Object} options - Plugin options from app-config.json
 */
export async function init(pluginManager, options = {}) {
    // The setup function expects a spa object with an events property
    // We'll create a wrapper that provides the necessary interface
    const spa = {
        events: pluginManager.events || {
            addEventListener: (event, handler) => {
                document.addEventListener(event, handler);
            }
        }
    };
    await setup(spa, options);
}

export async function setup(spa, options = {}) {
    // Load saved config from localStorage
    const savedConfig = JSON.parse(localStorage.getItem('navTreeConfig') || '{}');

    const config = {
        nav: '/docs/dev/conf/nav.json',
        container: '#site-nav',
        activeClass: 'active',
        collapseByDefault: savedConfig.collapseByDefault ?? true,        // All sections collapsed on initial load
        autoExpandActive: savedConfig.autoExpandActive ?? true,         // Auto-expand parent of active page
        ...options
    };

    console.group('[nav-tree] init');

    try {
        // Load nav JSON
        const navData = await fetchJSON(config.nav);
        const basePath = navData.basePath || '/';
        const routes = navData.routes || [];

        if (!routes.length) throw new Error('No routes in nav.json');

        // Find target container
        const container = document.querySelector(config.container);
        if (!container) throw new Error(`Container not found: ${config.container}`);

        // Build and inject nav
        const nav = document.createElement('nav');
        nav.classList.add('toc');
        nav.setAttribute('aria-label', 'Table of contents');

        // Add navigation controls (Collapse All button + Settings)
        const navControls = createNavControls(nav, config, spa);
        nav.appendChild(navControls);

        nav.appendChild(buildNavTree(routes, basePath));
        container.innerHTML = '';
        container.appendChild(nav);

        // Enhance UX
        if (!config.collapseByDefault) {
            restoreDetailsState(nav);   // Only restore if not collapsing by default
        }
        persistDetailsState(nav);
        highlightActiveLink(nav, config.activeClass);

        // Auto-expand parent section of active page
        if (config.autoExpandActive) {
            autoExpandActiveParent(nav);
        }

        // Update collapse button state
        updateCollapseButtonState(nav);

        console.info('[nav-tree] rendered successfully');
    } catch (err) {
        console.error('[nav-tree] failed to render:', err.message);
    }

    console.groupEnd();
}

/* ----------------------------
   Recursive nav renderer
----------------------------- */
function buildNavTree(routes = [], basePath = '/') {
    const ul = document.createElement('ul');
    ul.classList.add('nav-list');

    for (const route of routes) {
        if (route.path === '*') continue; // skip wildcard
        const li = document.createElement('li');

        // Subtree (folder)
        if (route.children && route.children.length > 0) {
            const details = document.createElement('details');
            const summary = document.createElement('summary');

            // If parent route has a path, create a clickable link
            if (route.path) {
                // Special case: if route.path is '/', navigate to global home '/'
                // Otherwise, construct path relative to basePath
                let fullPath;
                if (route.path === '/') {
                    fullPath = '/';
                } else {
                    fullPath = `${basePath.replace(/\/$/, '')}${route.path}`;
                }
                console.debug(`[nav-tree] Generated link for "${route.title}": basePath="${basePath}", route.path="${route.path}", fullPath="${fullPath}"`);
                const a = document.createElement('a');
                a.classList.add('nav-link');
                a.href = fullPath;
                a.innerHTML = `<span class="icon">${route.icon || ''}</span><span class="title">${route.title || ''}</span>`;

                // Prevent link click from toggling details
                a.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                summary.appendChild(a);

                // Add toggle marker for expand/collapse
                const marker = document.createElement('span');
                marker.classList.add('toggle-marker');
                marker.setAttribute('aria-label', 'Toggle submenu');
                summary.appendChild(marker);
            } else {
                // No path - just show title (non-clickable parent)
                summary.innerHTML = `<span class="icon">${route.icon || ''}</span><span class="title">${route.title || ''}</span>`;
            }

            details.appendChild(summary);
            details.appendChild(buildNavTree(route.children, basePath));

            // Lazy load optional
            if (route.lazy) {
                details.dataset.lazy = 'true';
                details.addEventListener('toggle', async () => {
                    if (details.open && !details.dataset.loaded) {
                        try {
                            const slug = (route.title || '').toLowerCase().replace(/\s+/g, '-');
                            const html = await fetchText(`/docs/dev/nav-partials/${slug}.html`);
                            const wrapper = document.createElement('div');
                            wrapper.innerHTML = html;
                            details.appendChild(wrapper);
                            details.dataset.loaded = 'true';
                            console.info('[nav-tree] lazy-loaded:', slug);
                        } catch (err) {
                            console.warn('[nav-tree] lazy load failed:', err.message);
                        }
                    }
                });
            }

            li.appendChild(details);
        }

        // Single route
        else if (route.path) {
            const a = document.createElement('a');
            a.classList.add('nav-link');
            // Special case: if route.path is '/', navigate to global home '/'
            // Otherwise, construct path relative to basePath
            let fullPath;
            if (route.path === '/') {
                fullPath = '/';
            } else {
                fullPath = `${basePath.replace(/\/$/, '')}${route.path}`;
            }
            console.debug(`[nav-tree] Generated link for "${route.title}": basePath="${basePath}", route.path="${route.path}", fullPath="${fullPath}"`);
            a.href = fullPath;
            a.innerHTML = `<span class="icon">${route.icon || ''}</span><span class="title">${route.title || ''}</span>`;
            li.appendChild(a);
        }

        ul.appendChild(li);
    }

    return ul;
}

/* ----------------------------
   Active route highlighter
----------------------------- */
function highlightActiveLink(nav, className = 'active') {
    const apply = () => {
        const links = nav.querySelectorAll('a.nav-link');
        links.forEach(link => link.classList.remove(className));

        const match = [...links].find(a => a.pathname === location.pathname);
        if (match) {
            match.classList.add(className);
            match.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    window.addEventListener('popstate', apply);
    apply();
}

/* ----------------------------
   Auto-expand active parent
----------------------------- */
function autoExpandActiveParent(nav) {
    const apply = () => {
        // Find the active link
        const activeLink = nav.querySelector('a.nav-link.active');
        if (!activeLink) return;

        // Check if the active link is inside a <summary> element
        // If it is, it's a parent page link - do NOT expand
        const isParentLink = activeLink.closest('summary') !== null;
        if (isParentLink) {
            return; // Parent page link - keep section collapsed
        }

        // Active link is in submenu (child page) - expand parent sections
        let parent = activeLink.closest('details');

        // Expand all parent <details> elements up the tree
        while (parent) {
            parent.open = true;
            parent = parent.parentElement?.closest('details');
        }
    };

    window.addEventListener('popstate', apply);
    apply();
}

/* ----------------------------
   <details> open state
----------------------------- */
function restoreDetailsState(nav) {
    const state = JSON.parse(localStorage.getItem('navTreeDetails') || '{}');
    nav.querySelectorAll('details').forEach(detail => {
        const summary = detail.querySelector('summary');
        const key = summary?.textContent?.trim();
        if (key && state[key] !== undefined) {
            detail.open = state[key];
        }
    });
}

function persistDetailsState(nav) {
    const state = JSON.parse(localStorage.getItem('navTreeDetails') || '{}');
    nav.querySelectorAll('details').forEach(detail => {
        const summary = detail.querySelector('summary');
        const key = summary?.textContent?.trim();
        if (!key) return;

        detail.addEventListener('toggle', () => {
            state[key] = detail.open;
            localStorage.setItem('navTreeDetails', JSON.stringify(state));

            // Update collapse button state
            updateCollapseButtonState(nav);
        });
    });
}

// Helper to get detail key (used by collapse button)
function getDetailKey(detail) {
    const summary = detail.querySelector('summary');
    return summary?.textContent?.trim();
}

/* ----------------------------
   Navigation Controls (Collapse All + Settings)
----------------------------- */
function createNavControls(nav, config, spa) {
    const container = document.createElement('div');
    container.classList.add('nav-controls');

    // Collapse All button
    const collapseBtn = document.createElement('button');
    collapseBtn.classList.add('collapse-all-btn');
    collapseBtn.innerHTML = '<span class="icon">⊟</span><span class="text">Collapse All</span>';
    collapseBtn.setAttribute('aria-label', 'Collapse all navigation sections');
    collapseBtn.setAttribute('title', 'Collapse all sections');

    collapseBtn.addEventListener('click', () => {
        const details = nav.querySelectorAll('details[open]');

        if (details.length === 0) return; // Nothing to collapse

        // Collapse all sections
        details.forEach(detail => {
            detail.open = false;
        });

        // Save collapsed state to localStorage
        const state = {};
        nav.querySelectorAll('details').forEach(detail => {
            const key = getDetailKey(detail);
            if (key) state[key] = false;
        });
        localStorage.setItem('navTreeDetails', JSON.stringify(state));

        // Update button state
        updateCollapseButtonState(nav);

        // Visual feedback
        collapseBtn.classList.add('clicked');
        setTimeout(() => collapseBtn.classList.remove('clicked'), 300);
    });

    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.classList.add('settings-btn');
    settingsBtn.innerHTML = '<span class="icon">⚙️</span>';
    settingsBtn.setAttribute('aria-label', 'Navigation settings');
    settingsBtn.setAttribute('title', 'Navigation settings');

    // Settings panel
    const settingsPanel = createSettingsPanel(config, nav, spa);

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
    });

    container.appendChild(collapseBtn);
    container.appendChild(settingsBtn);
    container.appendChild(settingsPanel);

    return container;
}

function updateCollapseButtonState(nav) {
    const btn = nav.querySelector('.collapse-all-btn');
    if (!btn) return;

    const openDetails = nav.querySelectorAll('details[open]');

    if (openDetails.length === 0) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
    } else {
        btn.disabled = false;
        btn.setAttribute('aria-disabled', 'false');
    }
}

/* ----------------------------
   Settings Panel
----------------------------- */
function createSettingsPanel(config, nav, spa) {
    const panel = document.createElement('div');
    panel.classList.add('settings-panel');

    const title = document.createElement('h4');
    title.textContent = 'Navigation Settings';
    panel.appendChild(title);

    // Collapse by default option
    const collapseOption = createToggleOption(
        'collapseByDefault',
        'Collapse sections on page load',
        config.collapseByDefault,
        (value) => {
            config.collapseByDefault = value;
            saveConfig(config);
        }
    );

    // Auto-expand active option
    const autoExpandOption = createToggleOption(
        'autoExpandActive',
        'Auto-expand active page\'s parent',
        config.autoExpandActive,
        (value) => {
            config.autoExpandActive = value;
            saveConfig(config);

            // Re-apply auto-expand logic
            if (value) {
                autoExpandActiveParent(nav);
            }
        }
    );

    panel.appendChild(collapseOption);
    panel.appendChild(autoExpandOption);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('settings-close-btn');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
    });
    panel.appendChild(closeBtn);

    return panel;
}

function createToggleOption(id, label, checked, onChange) {
    const option = document.createElement('div');
    option.classList.add('setting-option');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `nav-setting-${id}`;
    checkbox.checked = checked;
    checkbox.addEventListener('change', (e) => {
        onChange(e.target.checked);
    });

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', `nav-setting-${id}`);
    labelEl.textContent = label;

    option.appendChild(checkbox);
    option.appendChild(labelEl);

    return option;
}

function saveConfig(config) {
    const configToSave = {
        collapseByDefault: config.collapseByDefault,
        autoExpandActive: config.autoExpandActive
    };
    localStorage.setItem('navTreeConfig', JSON.stringify(configToSave));
    console.info('[nav-tree] config saved:', configToSave);
}

/* ----------------------------
   Fetch helpers
----------------------------- */
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.json();
}

async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.text();
}
