/**
 * @file performance.js
 * @path htdocs/src/utilities/performance.js
 * @description Performance optimization utilities
 */

import { TIMEOUTS } from '../config/constants.js';

/**
 * Debounces a function
 * @param {Function} func - Function to debounce
 * @param {number} [wait=300] - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = TIMEOUTS.DEBOUNCE) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttles a function
 * @param {Function} func - Function to throttle
 * @param {number} [limit=150] - Throttle limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = TIMEOUTS.THROTTLE) {
    let inThrottle;

    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Simple resource cache with expiration
 */
export class ResourceCache {
    /**
     * Creates a new ResourceCache
     * @param {number} [maxAge=300000] - Maximum age in milliseconds (default 5 minutes)
     */
    constructor(maxAge = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxAge = maxAge;
    }

    /**
     * Sets a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     */
    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    /**
     * Gets a value from cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached value or null if expired/not found
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        if (Date.now() - entry.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Checks if key exists and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} True if exists and valid
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Deletes a cache entry
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clears all cache entries
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Gets cache size
     * @returns {number} Number of cached items
     */
    size() {
        return this.cache.size;
    }

    /**
     * Cleans up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.maxAge) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * Lazy loads a module
 * @param {Function} importFn - Dynamic import function
 * @returns {Promise<any>} Loaded module
 */
export async function lazyLoad(importFn) {
    try {
        return await importFn();
    } catch (error) {
        console.error('[Performance] Lazy load failed:', error);
        throw error;
    }
}

/**
 * Preloads a resource
 * @param {string} url - URL to preload
 * @param {string} [as='fetch'] - Resource type
 */
export function preload(url, as = 'fetch') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
}

/**
 * Measures execution time of a function
 * @param {Function} fn - Function to measure
 * @param {string} [label=''] - Label for console output
 * @returns {Promise<any>} Function result
 */
export async function measureTime(fn, label = '') {
    const start = performance.now();

    try {
        const result = await fn();
        const end = performance.now();
        console.info(`[Performance] ${label || 'Function'} took ${(end - start).toFixed(2)}ms`);
        return result;
    } catch (error) {
        const end = performance.now();
        console.error(`[Performance] ${label || 'Function'} failed after ${(end - start).toFixed(2)}ms`);
        throw error;
    }
}

/**
 * Request idle callback with fallback
 * @param {Function} callback - Callback function
 * @param {Object} [options] - Options for requestIdleCallback
 * @returns {number} Callback ID
 */
export function requestIdleCallback(callback, options) {
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(callback, options);
    }

    // Fallback to setTimeout
    return setTimeout(() => {
        callback({
            didTimeout: false,
            timeRemaining: () => 50
        });
    }, 1);
}

/**
 * Cancel idle callback with fallback
 * @param {number} id - Callback ID
 */
export function cancelIdleCallback(id) {
    if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(id);
    } else {
        clearTimeout(id);
    }
}
