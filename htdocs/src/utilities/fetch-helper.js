/**
 * @file fetch-helper.js
 * @path htdocs/src/utilities/fetch-helper.js
 * @description Centralized fetch utilities with consistent error handling
 */

import { AppError } from '../core/error-handler.js';

/**
 * Fetches and parses JSON from URL
 * @param {string} url - URL to fetch from
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<any>} Parsed JSON data
 * @throws {AppError} If fetch or parse fails
 */
export async function fetchJSON(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new AppError(
                `HTTP ${response.status}: ${response.statusText}`,
                'FETCH_HTTP_ERROR',
                { url, status: response.status, statusText: response.statusText }
            );
        }

        const data = await response.json();
        return data;

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        // Handle JSON parse errors
        if (error instanceof SyntaxError) {
            throw new AppError(
                `Invalid JSON response from ${url}`,
                'FETCH_PARSE_ERROR',
                { url, originalError: error }
            );
        }

        // Handle network errors
        throw new AppError(
            `Failed to fetch JSON from ${url}: ${error.message}`,
            'FETCH_NETWORK_ERROR',
            { url, originalError: error }
        );
    }
}

/**
 * Fetches HTML/text content from URL
 * @param {string} url - URL to fetch from
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<string>} Response text
 * @throws {AppError} If fetch fails
 */
export async function fetchHTML(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'text/html,text/plain',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new AppError(
                `HTTP ${response.status}: ${response.statusText}`,
                'FETCH_HTTP_ERROR',
                { url, status: response.status, statusText: response.statusText }
            );
        }

        return await response.text();

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            `Failed to fetch HTML from ${url}: ${error.message}`,
            'FETCH_NETWORK_ERROR',
            { url, originalError: error }
        );
    }
}

/**
 * Fetches text content from URL (alias for fetchHTML)
 * @param {string} url - URL to fetch from
 * @param {RequestInit} [options={}] - Fetch options
 * @returns {Promise<string>} Response text
 */
export async function fetchText(url, options = {}) {
    return fetchHTML(url, options);
}

/**
 * Fetches data with retry logic
 * @param {Function} fetchFn - Fetch function to retry
 * @param {number} [maxRetries=3] - Maximum number of retries
 * @param {number} [delay=1000] - Delay between retries in ms
 * @returns {Promise<any>} Result from fetch function
 */
export async function fetchWithRetry(fetchFn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fetchFn();
        } catch (error) {
            lastError = error;
            console.warn(`[fetchWithRetry] Attempt ${attempt}/${maxRetries} failed:`, error.message);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    throw lastError;
}

/**
 * Fetches multiple resources in parallel
 * @param {Array<string>} urls - Array of URLs to fetch
 * @param {Function} fetchFn - Fetch function to use (fetchJSON or fetchHTML)
 * @returns {Promise<Array>} Array of fetched results
 */
export async function fetchMultiple(urls, fetchFn = fetchJSON) {
    return Promise.all(urls.map(url => fetchFn(url)));
}
