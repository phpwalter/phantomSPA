/**
 * Prism Configuration UI
 * 
 * Handles the settings panel UI for Prism configuration.
 * Creates toggle options and action buttons for user preferences.
 * 
 * @module prism-config-ui
 */

import { 
    getDirectiveConfig, 
    savePrismConfig, 
    resetPrismConfig, 
    applyPrismConfig 
} from './prism-config-storage.js';

/**
 * Create Prism settings UI panel
 * Uses settingsPanel config from prism-config.json for options
 * @param {Object} config - Current configuration
 * @param {Function} onUpdate - Callback when settings change
 * @returns {HTMLElement} Settings panel element
 */
export function createPrismSettingsPanel(config, onUpdate) {
    const directiveConfig = getDirectiveConfig();
    const settingsConfig = directiveConfig.settingsPanel || {};

    const panel = document.createElement('div');
    panel.classList.add('prism-settings-panel');

    const title = document.createElement('h4');
    title.textContent = settingsConfig.title || 'Code Block Settings';
    panel.appendChild(title);

    // Get toggle options from config
    const options = settingsConfig.options || [];

    options.forEach(option => {
        const optionEl = createToggleOption(
            option.key,
            option.label,
            config[option.key],
            (value) => {
                config[option.key] = value;
                savePrismConfig(config);
                applyPrismConfig(config);
                if (onUpdate) onUpdate(config);
            }
        );
        panel.appendChild(optionEl);
    });

    // Action buttons container
    const actions = document.createElement('div');
    actions.classList.add('prism-settings-actions');

    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.classList.add('prism-reset-btn');
    resetBtn.textContent = 'Reset to Defaults';
    resetBtn.addEventListener('click', () => {
        const defaultConfig = resetPrismConfig();

        // Update all checkboxes
        options.forEach(option => {
            const checkbox = panel.querySelector(`#prism-setting-${option.key}`);
            if (checkbox) {
                checkbox.checked = defaultConfig[option.key];
            }
        });

        applyPrismConfig(defaultConfig);
        if (onUpdate) onUpdate(defaultConfig);

        // Visual feedback
        resetBtn.classList.add('clicked');
        setTimeout(() => resetBtn.classList.remove('clicked'), 300);
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('prism-close-btn');
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    actions.appendChild(resetBtn);
    actions.appendChild(closeBtn);
    panel.appendChild(actions);

    return panel;
}

/**
 * Create a toggle option element
 * @param {string} id - Option ID
 * @param {string} label - Option label
 * @param {boolean} checked - Initial checked state
 * @param {Function} onChange - Change callback
 * @returns {HTMLElement} Option element
 */
function createToggleOption(id, label, checked, onChange) {
    const option = document.createElement('div');
    option.classList.add('prism-setting-option');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `prism-setting-${id}`;
    checkbox.checked = checked;
    checkbox.addEventListener('change', (e) => {
        onChange(e.target.checked);
    });

    const labelEl = document.createElement('label');
    labelEl.setAttribute('for', `prism-setting-${id}`);
    labelEl.textContent = label;

    option.appendChild(checkbox);
    option.appendChild(labelEl);

    return option;
}

/**
 * Create Prism settings button
 * @param {HTMLElement} panel - Settings panel element
 * @returns {HTMLElement} Settings button
 */
export function createPrismSettingsButton(panel) {
    const btn = document.createElement('button');
    btn.classList.add('prism-settings-btn');
    btn.innerHTML = '<span class="icon">&lt;/&gt;</span>';
    btn.setAttribute('aria-label', 'Code block settings');
    btn.setAttribute('title', 'Code block settings');

    btn.addEventListener('click', () => {
        panel.classList.toggle('open');
    });

    return btn;
}

