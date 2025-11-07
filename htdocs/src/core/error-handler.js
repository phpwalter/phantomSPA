/**
 * @file error-handler.js
 * @path htdocs/src/core/error-handler.js
 * @description Centralized error handling system
 */

import { eventBus } from './event-bus.js';
import { EVENTS, ERROR_CODES } from '../config/constants.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
    /**
     * Creates a new AppError
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} [context={}] - Additional context
     */
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
    }

    /**
     * Converts error to JSON
     * @returns {Object} Error object as JSON
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
    /**
     * Handles an error with optional fallback
     * @param {Error} error - Error to handle
     * @param {Function} [fallback=null] - Fallback function to execute
     * @returns {Promise<any>} Result of fallback function if provided
     */
    static async handle(error, fallback = null) {
        const errorData = error instanceof AppError ? error.toJSON() : {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: new Date()
        };

        console.error('[ErrorHandler]', errorData);

        // Emit error event
        eventBus.emit(EVENTS.APP_ERROR, errorData);

        // Log to external service (optional)
        if (this.shouldLogToService(error)) {
            await this.logToService(errorData).catch(err => {
                console.error('[ErrorHandler] Failed to log to service:', err);
            });
        }

        // Execute fallback if provided
        if (fallback && typeof fallback === 'function') {
            try {
                return await fallback(error);
            } catch (fallbackError) {
                console.error('[ErrorHandler] Fallback execution failed:', fallbackError);
            }
        }

        // Re-throw if critical
        if (error instanceof AppError && error.code?.startsWith('CRITICAL_')) {
            throw error;
        }
    }

    /**
     * Determines if error should be logged to external service
     * @param {Error} error - Error to check
     * @returns {boolean} True if should log
     */
    static shouldLogToService(error) {
        // Only log critical errors or in production
        return error instanceof AppError &&
               (error.code?.startsWith('CRITICAL_') || this.isProduction());
    }

    /**
     * Checks if running in production
     * @returns {boolean} True if production
     */
    static isProduction() {
        return location.hostname !== 'localhost' &&
               location.hostname !== '127.0.0.1';
    }

    /**
     * Logs error to external service (placeholder)
     * @param {Object} errorData - Error data to log
     * @returns {Promise<void>}
     */
    static async logToService(errorData) {
        // Implement actual logging service integration here
        // Example: await fetch('/api/log-error', { method: 'POST', body: JSON.stringify(errorData) });
        console.info('[ErrorHandler] Would log to service:', errorData);
    }

    /**
     * Creates a user-friendly error message
     * @param {Error} error - Error object
     * @returns {string} User-friendly message
     */
    static getUserMessage(error) {
        if (error instanceof AppError) {
            const messages = {
                [ERROR_CODES.NAV_CONTAINER_MISSING]: 'Navigation container not found. Please check your page setup.',
                [ERROR_CODES.NAV_FETCH_ERROR]: 'Failed to load navigation. Please refresh the page.',
                [ERROR_CODES.FETCH_NETWORK_ERROR]: 'Network error occurred. Please check your connection.',
                [ERROR_CODES.PLUGIN_LOAD_ERROR]: 'Failed to load plugin. Some features may be unavailable.'
            };

            return messages[error.code] || 'An unexpected error occurred.';
        }

        return 'An unexpected error occurred. Please try again.';
    }

    /**
     * Displays error to user
     * @param {Error} error - Error to display
     * @param {HTMLElement} [container=null] - Container to display error in
     */
    static displayToUser(error, container = null) {
        const message = this.getUserMessage(error);

        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <span class="icon">⚠️</span>
                    <span class="text">${message}</span>
                </div>
            `;
        } else {
            // Fallback to console if no container
            console.error(message);
        }
    }
}

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
    ErrorHandler.handle(new AppError(
        event.message,
        'UNCAUGHT_ERROR',
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
    ));
});

/**
 * Global handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(new AppError(
        event.reason?.message || 'Unhandled promise rejection',
        'UNHANDLED_REJECTION',
        { reason: event.reason }
    ));
});
