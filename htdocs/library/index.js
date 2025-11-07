/**
 * @file index.js
 * @path htdocs/library/index.js
 * @description Landing page initialization - docs space tracking and badge ordering
 */

import { STORAGE_KEYS } from '../src/config/constants.js';

/**
 * Configuration
 */
const CONFIG = {
    AUTO_REDIRECT: false,
    STORAGE_KEY: STORAGE_KEYS.PREFIX + STORAGE_KEYS.DOCS_SPACE,
    ALLOWED_SPACES: ['user', 'dev'],
    BADGES_HOLDER_ID: 'badges'
};

/**
 * Initializes docs space auto-redirect
 */
function initDocsRedirect() {
    if (!CONFIG.AUTO_REDIRECT) {
        return;
    }

    const params = new URLSearchParams(location.search);
    const space = params.get('space') || localStorage.getItem(CONFIG.STORAGE_KEY);

    if (CONFIG.ALLOWED_SPACES.includes(space)) {
        location.replace(`/phantom/docs/${space}/`);
    }
}

/**
 * Initializes docs space selection tracking
 */
function initDocsSpaceTracking() {
    addEventListener('click', (e) => {
        const link = e.target.closest('a[data-space]');

        if (link) {
            const space = link.dataset.space;
            localStorage.setItem(CONFIG.STORAGE_KEY, space);
            console.info('[Landing] Docs space saved:', space);
        }
    }, { capture: true });
}

/**
 * Reorders badges in center-outward pattern
 * First badge becomes center, then alternates right/left
 * @param {string} holderId - ID of badges container
 */
function reorderBadgesCenterOut(holderId) {
    const holder = document.getElementById(holderId);

    if (!holder) {
        console.warn('[Landing] Badges holder not found:', holderId);
        return;
    }

    const nodes = Array.from(holder.children);

    if (nodes.length <= 1) {
        return; // Nothing to reorder
    }

    const [center, ...rest] = nodes;
    const left = [];
    const right = [];

    // Distribute remaining badges: right, left, right, left...
    rest.forEach((node, index) => {
        if (index % 2 === 0) {
            right.push(node);
        } else {
            left.push(node);
        }
    });

    // Build final order: [...left reversed, center, ...right]
    const frag = document.createDocumentFragment();

    left.reverse().forEach(node => frag.appendChild(node));
    frag.appendChild(center);
    right.forEach(node => frag.appendChild(node));

    // Clear and re-append
    holder.innerHTML = '';
    holder.appendChild(frag);

    console.info('[Landing] Badges reordered:', {
        total: nodes.length,
        left: left.length,
        center: 1,
        right: right.length
    });
}

/**
 * Initialize all landing page features
 */
(function init() {
    console.info('[Landing] Initializing...');

    try {
        initDocsRedirect();
        initDocsSpaceTracking();
        reorderBadgesCenterOut(CONFIG.BADGES_HOLDER_ID);

        console.info('[Landing] Initialization complete');
    } catch (error) {
        console.error('[Landing] Initialization error:', error);
    }
}());
