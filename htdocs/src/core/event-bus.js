/**
 * @file event-bus.js
 * @path htdocs/src/core/event-bus.js
 * @description Centralized event system for component communication
 */

/**
 * Event bus for pub/sub communication between modules
 */
export class EventBus {
    constructor() {
        this.events = new Map();
        this.onceHandlers = new WeakMap();
    }

    /**
     * Subscribes to an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, handler) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }

        this.events.get(event).add(handler);

        // Return unsubscribe function
        return () => this.off(event, handler);
    }

    /**
     * Unsubscribes from an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    off(event, handler) {
        const handlers = this.events.get(event);
        if (handlers) {
            handlers.delete(handler);

            // Clean up empty event sets
            if (handlers.size === 0) {
                this.events.delete(event);
            }
        }
    }

    /**
     * Emits an event to all subscribers
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        const handlers = this.events.get(event);
        if (!handlers || handlers.size === 0) {
            return;
        }

        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`[EventBus] Error in event handler for "${event}":`, error);
            }
        });
    }

    /**
     * Subscribes to an event once (auto-unsubscribes after first emission)
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     * @returns {Function} Unsubscribe function
     */
    once(event, handler) {
        const wrapper = (data) => {
            handler(data);
            this.off(event, wrapper);
        };

        this.onceHandlers.set(wrapper, handler);
        return this.on(event, wrapper);
    }

    /**
     * Clears all handlers for a specific event
     * @param {string} event - Event name
     */
    clear(event) {
        this.events.delete(event);
    }

    /**
     * Clears all handlers for all events
     */
    clearAll() {
        this.events.clear();
    }

    /**
     * Gets count of handlers for an event
     * @param {string} event - Event name
     * @returns {number} Number of handlers
     */
    listenerCount(event) {
        const handlers = this.events.get(event);
        return handlers ? handlers.size : 0;
    }

    /**
     * Gets all event names
     * @returns {Array<string>} Array of event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
}

/**
 * Global event bus instance (singleton)
 */
export const eventBus = new EventBus();
