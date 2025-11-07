/**
 * @file nav-service.js
 * @path htdocs/src/core/nav/nav-service.js
 * @description Navigation service - handles fetching and processing navigation data
 */

import { fetchJSON, fetchHTML } from '../../utilities/fetch-helper.js';
import { AppError } from '../error-handler.js';

/**
 * Navigation service for managing navigation data and templates
 */
export class NavService {
    /**
     * Creates a new NavService instance
     * @param {Object} config - Configuration object
     * @param {string} config.navPath - Path to navigation JSON file
     * @param {string} config.templatePath - Path to navigation template HTML
     */
    constructor(config = {}) {
        this.config = {
            navPath: config.navPath || '/docs/dev/conf/nav.json',
            templatePath: config.templatePath || '/docs/dev/pages/nav.html',
            maxDepth: config.maxDepth || 10
        };
    }

    /**
     * Fetches navigation data from configured path
     * @returns {Promise<Object>} Navigation data with routes
     * @throws {AppError} If fetch fails or data is invalid
     */
    async fetchNavData() {
        try {
            const navData = await fetchJSON(this.config.navPath);

            if (!navData.routes || !Array.isArray(navData.routes)) {
                throw new AppError(
                    'Invalid navigation data: missing or invalid routes array',
                    'NAV_INVALID_DATA',
                    { navPath: this.config.navPath }
                );
            }

            return navData;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                `Failed to fetch navigation data: ${error.message}`,
                'NAV_FETCH_ERROR',
                { navPath: this.config.navPath, originalError: error }
            );
        }
    }

    /**
     * Fetches navigation template HTML
     * @returns {Promise<string>} Template HTML content
     * @throws {AppError} If fetch fails
     */
    async fetchTemplate() {
        try {
            return await fetchHTML(this.config.templatePath);
        } catch (error) {
            throw new AppError(
                `Failed to fetch navigation template: ${error.message}`,
                'NAV_TEMPLATE_ERROR',
                { templatePath: this.config.templatePath, originalError: error }
            );
        }
    }

    /**
     * Fetches both navigation data and template in parallel
     * @returns {Promise<{navData: Object, template: string}>}
     */
    async fetchAll() {
        try {
            const [navData, template] = await Promise.all([
                this.fetchNavData(),
                this.fetchTemplate()
            ]);

            return { navData, template };
        } catch (error) {
            throw error instanceof AppError ? error : new AppError(
                `Failed to fetch navigation resources: ${error.message}`,
                'NAV_FETCH_ALL_ERROR',
                { originalError: error }
            );
        }
    }

    /**
     * Validates route structure
     * @param {Object} route - Route object to validate
     * @returns {boolean} True if valid
     */
    validateRoute(route) {
        if (!route || typeof route !== 'object') {
            return false;
        }

        const hasPath = typeof route.path === 'string';
        const hasChildren = Array.isArray(route.children) && route.children.length > 0;

        return hasPath || hasChildren;
    }

    /**
     * Gets the maximum depth setting
     * @returns {number} Maximum allowed navigation depth
     */
    getMaxDepth() {
        return this.config.maxDepth;
    }
}
