/**
 * @file nav-renderer.js
 * @path htdocs/src/core/nav/nav-renderer.js
 * @description Navigation renderer - handles DOM generation for navigation tree
 */

import { createElement } from '../../utilities/dom-builder.js';
import { AppError } from '../error-handler.js';

/**
 * Renders navigation tree from route data
 */
export class NavRenderer {
    /**
     * Creates a new NavRenderer instance
     * @param {HTMLTemplateElement} template - Template element for navigation structure
     * @param {number} maxDepth - Maximum recursion depth
     */
    constructor(template, maxDepth = 10) {
        this.template = template;
        this.maxDepth = maxDepth;
    }

    /**
     * Renders complete navigation tree
     * @param {Array} routes - Array of route objects
     * @param {number} depth - Current recursion depth
     * @returns {HTMLUListElement} Rendered navigation list
     * @throws {AppError} If max depth exceeded
     */
    renderNavTree(routes, depth = 0) {
        if (depth > this.maxDepth) {
            console.warn(`[NavRenderer] Max navigation depth (${this.maxDepth}) exceeded`);
            return document.createElement('ul');
        }

        const tpl = this.template.content.cloneNode(true);
        const ul = tpl.querySelector('ul') || document.createElement('ul');
        ul.classList.add('nav-list');

        if (!Array.isArray(routes)) {
            console.warn('[NavRenderer] Invalid routes array provided');
            return ul;
        }

        routes.forEach(route => {
            try {
                const li = this.createNavItem(route, depth);
                if (li) {
                    ul.appendChild(li);
                }
            } catch (error) {
                console.error('[NavRenderer] Error creating nav item:', error);
            }
        });

        return ul;
    }

    /**
     * Creates a single navigation item element
     * @param {Object} route - Route configuration object
     * @param {string} route.path - Route path
     * @param {string} route.title - Route title
     * @param {string} [route.icon] - Optional icon HTML or emoji
     * @param {Array} [route.children] - Optional child routes
     * @param {number} depth - Current nesting depth
     * @returns {HTMLLIElement|null} List item element with navigation link
     */
    createNavItem(route, depth) {
        if (!route || typeof route !== 'object') {
            return null;
        }

        // Skip wildcard routes
        if (route.path === '*') {
            return null;
        }

        const li = createElement('li');

        // Create link
        const a = createElement('a', {
            href: route.path || '#',
            className: 'nav-link'
        });

        // Build link content
        const iconHTML = route.icon ? `<span class="icon">${route.icon}</span> ` : '';
        const titleHTML = `<span class="title">${route.title || 'Untitled'}</span>`;
        a.innerHTML = iconHTML + titleHTML;

        li.appendChild(a);

        // Handle children (nested navigation)
        if (route.children && Array.isArray(route.children) && route.children.length > 0) {
            const nested = this.renderNavTree(route.children, depth + 1);
            li.appendChild(nested);
        }

        return li;
    }

    /**
     * Creates a navigation item with details/summary for collapsible sections
     * @param {Object} route - Route configuration
     * @param {number} depth - Current depth
     * @returns {HTMLLIElement|null} List item with details element
     */
    createCollapsibleNavItem(route, depth) {
        if (!route || !route.children || route.children.length === 0) {
            return this.createNavItem(route, depth);
        }

        const li = createElement('li');
        const details = createElement('details');
        const summary = createElement('summary');

        // Build summary content
        const iconHTML = route.icon ? `<span class="icon">${route.icon}</span> ` : '';
        const titleHTML = `<span class="title">${route.title || 'Untitled'}</span>`;
        summary.innerHTML = iconHTML + titleHTML;

        details.appendChild(summary);

        // Add nested navigation
        const nested = this.renderNavTree(route.children, depth + 1);
        details.appendChild(nested);

        // Handle lazy loading
        if (route.lazy) {
            details.dataset.lazy = 'true';
        }

        li.appendChild(details);

        return li;
    }
}
