/**
 * @file nav-controller.js
 * @path htdocs/src/core/nav/nav-controller.js
 * @description Navigation controller - orchestrates navigation initialization and updates
 */

import { NavService } from './nav-service.js';
import { NavRenderer } from './nav-renderer.js';
import { ErrorHandler, AppError } from '../error-handler.js';

/**
 * Main navigation controller
 */
export class NavController {
    /**
     * Creates a new NavController instance
     * @param {Object} config - Configuration object
     * @param {string} config.container - CSS selector for navigation container
     * @param {string} config.navPath - Path to navigation JSON
     * @param {string} config.templatePath - Path to navigation template
     * @param {number} [config.maxDepth=10] - Maximum navigation depth
     */
    constructor(config = {}) {
        this.config = {
            container: config.container || '#site-nav',
            navPath: config.navPath || '/docs/dev/conf/nav.json',
            templatePath: config.templatePath || '/docs/dev/pages/nav.html',
            maxDepth: config.maxDepth || 10
        };

        this.service = new NavService({
            navPath: this.config.navPath,
            templatePath: this.config.templatePath,
            maxDepth: this.config.maxDepth
        });

        this.renderer = null;
        this.container = null;
    }

    /**
     * Initializes navigation
     * @returns {Promise<void>}
     */
    async init() {
        try {
            this.container = document.querySelector(this.config.container);
            if (!this.container) {
                throw new AppError(
                    `Navigation container not found: ${this.config.container}`,
                    'NAV_CONTAINER_MISSING',
                    { selector: this.config.container }
                );
            }

            const { navData, template } = await this.service.fetchAll();

            this.container.innerHTML = template;

            const navElement = this.container.querySelector('nav');
            const templateEl = navElement.querySelector('template#navList');

            if (!templateEl) {
                throw new AppError(
                    'Navigation template element not found',
                    'NAV_TEMPLATE_ELEMENT_MISSING'
                );
            }

            this.renderer = new NavRenderer(templateEl, this.config.maxDepth);

            const ul = this.renderer.renderNavTree(navData.routes);
            const placeholder = navElement.querySelector('.nav-list');

            if (placeholder) {
                placeholder.replaceWith(ul);
            } else {
                navElement.appendChild(ul);
            }

            console.info('[NavController] Navigation initialized successfully');

        } catch (error) {
            await ErrorHandler.handle(error, () => {
                if (this.container) {
                    this.container.innerHTML = '<p class="error">Failed to load navigation</p>';
                }
            });
        }
    }

    /**
     * Updates navigation (useful for dynamic route changes)
     * @returns {Promise<void>}
     */
    async update() {
        await this.init();
    }
}

/**
 * Convenience function to initialize navigation
 * @param {Object} config - Configuration object
 * @returns {Promise<NavController>}
 */
export async function initNavigation(config = {}) {
    const controller = new NavController(config);
    await controller.init();
    return controller;
}
