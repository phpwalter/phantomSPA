/**
 * @file validation.js
 * @path htdocs/src/utilities/validation.js
 * @description Validation utility functions
 */

/**
 * Validates if value is a string
 * @param {any} value - Value to check
 * @returns {boolean} True if string
 */
export function isString(value) {
    return typeof value === 'string';
}

/**
 * Validates if value is a non-empty string
 * @param {any} value - Value to check
 * @returns {boolean} True if non-empty string
 */
export function isNonEmptyString(value) {
    return isString(value) && value.trim().length > 0;
}

/**
 * Validates if value is a number
 * @param {any} value - Value to check
 * @returns {boolean} True if number
 */
export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * Validates if value is a plain object
 * @param {any} value - Value to check
 * @returns {boolean} True if plain object
 */
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validates if value is an array
 * @param {any} value - Value to check
 * @returns {boolean} True if array
 */
export function isArray(value) {
    return Array.isArray(value);
}

/**
 * Validates if value is a non-empty array
 * @param {any} value - Value to check
 * @returns {boolean} True if non-empty array
 */
export function isNonEmptyArray(value) {
    return isArray(value) && value.length > 0;
}

/**
 * Validates if value is a function
 * @param {any} value - Value to check
 * @returns {boolean} True if function
 */
export function isFunction(value) {
    return typeof value === 'function';
}

/**
 * Validates if value is a valid URL
 * @param {string} value - URL string to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validates if value is a valid path
 * @param {string} value - Path to validate
 * @returns {boolean} True if valid path
 */
export function isValidPath(value) {
    return isNonEmptyString(value) && value.startsWith('/');
}

/**
 * Validates if element is a DOM element
 * @param {any} element - Element to check
 * @returns {boolean} True if DOM element
 */
export function isDOMElement(element) {
    return element instanceof HTMLElement;
}

/**
 * Validates if selector matches any elements
 * @param {string} selector - CSS selector
 * @returns {boolean} True if selector matches elements
 */
export function hasMatchingElements(selector) {
    return document.querySelectorAll(selector).length > 0;
}

/**
 * Validates route configuration object
 * @param {Object} route - Route object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateRoute(route) {
    const errors = [];

    if (!isObject(route)) {
        errors.push('Route must be an object');
        return { isValid: false, errors };
    }

    if (!route.path && !route.children) {
        errors.push('Route must have either path or children');
    }

    if (route.path && !isString(route.path)) {
        errors.push('Route path must be a string');
    }

    if (route.children && !isArray(route.children)) {
        errors.push('Route children must be an array');
    }

    if (route.title && !isString(route.title)) {
        errors.push('Route title must be a string');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validates configuration object
 * @param {Object} config - Configuration to validate
 * @param {Object} schema - Expected schema
 * @returns {Object} Validation result with isValid and errors
 */
export function validateConfig(config, schema) {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
        const value = config[key];

        if (rules.required && (value === undefined || value === null)) {
            errors.push(`Missing required config: ${key}`);
            continue;
        }

        if (value === undefined || value === null) {
            continue;
        }

        if (rules.type === 'string' && !isString(value)) {
            errors.push(`Config "${key}" must be a string`);
        }

        if (rules.type === 'number' && !isNumber(value)) {
            errors.push(`Config "${key}" must be a number`);
        }

        if (rules.type === 'object' && !isObject(value)) {
            errors.push(`Config "${key}" must be an object`);
        }

        if (rules.type === 'array' && !isArray(value)) {
            errors.push(`Config "${key}" must be an array`);
        }

        if (rules.validator && !rules.validator(value)) {
            errors.push(`Config "${key}" failed custom validation`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
