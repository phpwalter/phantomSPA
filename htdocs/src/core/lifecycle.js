/**
 * @file lifecycle.js
 * @path htdocs/src/core/lifecycle.js
 * @description Application lifecycle management
 */

import { eventBus } from './event-bus.js';
import { EVENTS } from '../config/constants.js';

/**
 * Lifecycle hooks for application stages
 */
export class Lifecycle {
    constructor() {
        this.hooks = {
            beforeInit: [],
            afterInit: [],
            beforeDestroy: [],
            afterDestroy: []
        };
    }

    /**
     * Registers a hook for a lifecycle stage
     * @param {string} stage - Lifecycle stage name
     * @param {Function} callback - Hook callback
     * @returns {Function} Unregister function
     */
    on(stage, callback) {
        if (!this.hooks[stage]) {
            console.warn(`[Lifecycle] Unknown stage: ${stage}`);
            return () => {};
        }

        this.hooks[stage].push(callback);

        return () => {
            const index = this.hooks[stage].indexOf(callback);
            if (index !== -1) {
                this.hooks[stage].splice(index, 1);
            }
        };
    }

    /**
     * Executes all hooks for a stage
     * @param {string} stage - Lifecycle stage name
     * @param {any} data - Data to pass to hooks
     * @returns {Promise<void>}
     */
    async execute(stage, data) {
        const hooks = this.hooks[stage] || [];

        for (const hook of hooks) {
            try {
                await hook(data);
            } catch (error) {
                console.error(`[Lifecycle] Error in ${stage} hook:`, error);
            }
        }
    }

    /**
     * Clears all hooks
     */
    clear() {
        Object.keys(this.hooks).forEach(stage => {
            this.hooks[stage] = [];
        });
    }
}

/**
 * Global lifecycle instance
 */
export const lifecycle = new Lifecycle();

/**
 * Convenience functions for common lifecycle hooks
 */

export function onBeforeInit(callback) {
    return lifecycle.on('beforeInit', callback);
}

export function onAfterInit(callback) {
    return lifecycle.on('afterInit', callback);
}

export function onBeforeDestroy(callback) {
    return lifecycle.on('beforeDestroy', callback);
}

export function onAfterDestroy(callback) {
    return lifecycle.on('afterDestroy', callback);
}
