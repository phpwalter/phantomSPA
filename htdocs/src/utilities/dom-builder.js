/**
 * @file dom-builder.js
 * @path htdocs/src/utilities/dom-builder.js
 * @description Utility functions for creating DOM elements
 */

/**
 * Creates a DOM element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} [attributes={}] - Element attributes
 * @param {Array|string|HTMLElement} [children=[]] - Child elements or text
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attributes = {}, children = []) {
    const el = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            return;
        }

        if (key === 'className') {
            el.className = value;
        } else if (key === 'innerHTML') {
            el.innerHTML = value;
        } else if (key === 'textContent') {
            el.textContent = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            // Event listeners
            const eventName = key.substring(2).toLowerCase();
            el.addEventListener(eventName, value);
        } else if (key.startsWith('data')) {
            // Data attributes
            const dataKey = key.substring(4).toLowerCase();
            el.dataset[dataKey] = value;
        } else {
            el.setAttribute(key, value);
        }
    });

    // Add children
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(child => {
        if (!child) return;

        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            el.appendChild(child);
        }
    });

    return el;
}

/**
 * Creates multiple elements from a configuration array
 * @param {Array<Object>} configs - Array of element configurations
 * @returns {DocumentFragment} Fragment containing all elements
 */
export function createElements(configs) {
    const fragment = document.createDocumentFragment();

    configs.forEach(config => {
        const { tag, attributes, children } = config;
        const el = createElement(tag, attributes, children);
        fragment.appendChild(el);
    });

    return fragment;
}

/**
 * Wraps an element with another element
 * @param {HTMLElement} element - Element to wrap
 * @param {string} wrapperTag - Tag name for wrapper
 * @param {Object} [attributes={}] - Wrapper attributes
 * @returns {HTMLElement} Wrapper element
 */
export function wrapElement(element, wrapperTag, attributes = {}) {
    const wrapper = createElement(wrapperTag, attributes);
    element.parentNode?.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
}

/**
 * Removes all children from an element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Replaces an element with another element
 * @param {HTMLElement} oldElement - Element to replace
 * @param {HTMLElement} newElement - New element
 */
export function replaceElement(oldElement, newElement) {
    oldElement.parentNode?.replaceChild(newElement, oldElement);
}

/**
 * Appends multiple children to a parent element
 * @param {HTMLElement} parent - Parent element
 * @param {Array<HTMLElement|string>} children - Children to append
 */
export function appendChildren(parent, children) {
    const fragment = document.createDocumentFragment();

    children.forEach(child => {
        if (typeof child === 'string') {
            fragment.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
            fragment.appendChild(child);
        }
    });

    parent.appendChild(fragment);
}

/**
 * Creates an element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
export function createFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Toggles a class on an element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Force add/remove
 */
export function toggleClass(element, className, force) {
    if (force !== undefined) {
        element.classList.toggle(className, force);
    } else {
        element.classList.toggle(className);
    }
}

/**
 * Adds multiple classes to an element
 * @param {HTMLElement} element - Target element
 * @param {Array<string>} classNames - Class names to add
 */
export function addClasses(element, classNames) {
    element.classList.add(...classNames);
}

/**
 * Removes multiple classes from an element
 * @param {HTMLElement} element - Target element
 * @param {Array<string>} classNames - Class names to remove
 */
export function removeClasses(element, classNames) {
    element.classList.remove(...classNames);
}
