/**
 * Prism Plugin Utilities
 * 
 * Shared utility functions for the PhantomSPA Prism plugin.
 * This module provides common functionality used across multiple plugin files
 * to avoid code duplication while maintaining plugin self-containment.
 * 
 * @module prism-utils
 */

/**
 * Load a stylesheet dynamically
 * @param {string} href - CSS file URL
 * @param {string} id - Link element ID (used to prevent duplicate loading)
 * @returns {Promise<void>} Resolves when stylesheet loads, rejects on error
 */
export function loadStylesheet(href, id) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
        document.head.appendChild(link);
    });
}

/**
 * Load a script dynamically
 * @param {string} src - Script URL
 * @param {string} id - Script element ID (used to prevent duplicate loading)
 * @returns {Promise<void>} Resolves when script loads, rejects on error
 */
export function loadScript(src, id) {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        // Don't use defer for dynamically loaded scripts - it doesn't work as expected
        // after document is already loaded. Use async=false to ensure execution order.
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}
