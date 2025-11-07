# Prism.js Configuration UI

**Date**: 2025-11-03  
**Status**: ✅ Complete  
**Feature**: User-configurable syntax highlighting settings

---

## Overview

A comprehensive configuration UI has been added to the PhantomSPA documentation system, allowing users to customize Prism.js syntax highlighting features in real-time. Users can toggle 7 different code block features on/off, with settings persisting across page loads and navigation.

---

## Features Implemented

### **Configuration Options**

Users can toggle the following features:

1. ✅ **Enable Syntax Highlighting** - Turn Prism.js highlighting on/off completely
2. ✅ **Show Line Numbers** - Toggle line numbers in code block gutter
3. ✅ **Show Copy Button** - Show/hide copy-to-clipboard button
4. ✅ **Show Download Button** - Show/hide download button
5. ✅ **Show Language Label** - Show/hide language name in toolbar
6. ✅ **Enable Line Highlight** - Enable/disable line highlighting feature
7. ✅ **Enable Command Line Prompts** - Enable/disable command-line plugin

---

## User Interface

### **Settings Button**

**Location**: Navigation area (`.nav-controls` container)  
**Icon**: `</>` (code symbol)  
**Label**: "Code block settings"  
**Placement**: Next to navigation settings gear icon (⚙️)

**Visual Design**:
- Panel background with border
- Hover: Accent color border and text
- Focus: Accent outline for accessibility
- Responsive sizing on mobile

---

### **Settings Panel**

**Structure**:
```
┌─────────────────────────────────────┐
│ Code Block Settings                 │
├─────────────────────────────────────┤
│ ☑ Enable syntax highlighting       │
│ ☑ Show line numbers                │
│ ☑ Show copy button                 │
│ ☑ Show download button             │
│ ☑ Show language label              │
│ ☑ Enable line highlighting         │
│ ☑ Enable command-line prompts      │
├─────────────────────────────────────┤
│ [Reset to Defaults]  [Close]        │
└─────────────────────────────────────┘
```

**Behavior**:
- Slides down from settings button with fade animation
- Toggles open/closed on button click
- Closes when "Close" button is clicked
- Settings apply immediately when toggled
- Visual feedback on "Reset to Defaults" (accent color flash)

---

## Implementation Details

### **1. Configuration Manager** (`prism-config.js`)

**File**: `htdocs/src/utilities/prism-config.js` (300 lines)

**Key Functions**:

#### `loadPrismConfig()`
Loads configuration from localStorage with fallback to defaults.

```javascript
const config = loadPrismConfig();
// Returns: { enableHighlighting: true, showLineNumbers: true, ... }
```

#### `savePrismConfig(config)`
Saves configuration to localStorage.

```javascript
savePrismConfig({
    enableHighlighting: true,
    showLineNumbers: false,
    // ... other options
});
```

#### `applyPrismConfig(config)`
Applies configuration by adding/removing body classes.

```javascript
applyPrismConfig(config);
// Adds classes like: .prism-no-line-numbers, .prism-no-copy, etc.
```

#### `highlightCode(container, config)`
Applies Prism highlighting based on configuration.

```javascript
highlightCode(main, config);
// Adds line-numbers class, runs Prism.highlightAllUnder()
```

#### `createPrismSettingsPanel(config, onUpdate)`
Creates the settings panel UI element.

```javascript
const panel = createPrismSettingsPanel(config, (newConfig) => {
    // Called when settings change
    highlightCode(main, newConfig);
});
```

#### `createPrismSettingsButton(panel)`
Creates the settings button that toggles the panel.

```javascript
const button = createPrismSettingsButton(panel);
```

---

### **2. Router Integration** (`router.js`)

**Changes Made**:

**Import Configuration Utilities** (Lines 7-13):
```javascript
import { 
    loadPrismConfig, 
    applyPrismConfig, 
    highlightCode,
    createPrismSettingsPanel,
    createPrismSettingsButton
} from './utilities/prism-config.js';
```

**Load Configuration on Setup** (Lines 26-28):
```javascript
// Load Prism configuration
let prismConfig = loadPrismConfig();
applyPrismConfig(prismConfig);
```

**Apply Configuration When Rendering** (Lines 153-154):
```javascript
// Apply Prism.js syntax highlighting with user configuration
highlightCode(main, prismConfig);
```

**Initialize Settings UI** (Lines 211-254):
```javascript
function initPrismSettingsUI() {
    // Wait for navigation to be rendered
    const checkNav = setInterval(() => {
        const nav = document.querySelector('.site-nav');
        if (nav) {
            clearInterval(checkNav);
            
            // Create settings panel
            const panel = createPrismSettingsPanel(prismConfig, (newConfig) => {
                prismConfig = newConfig;
                // Re-apply highlighting to current page
                const main = document.querySelector(options.main || '#app-shell');
                if (main) {
                    highlightCode(main, prismConfig);
                }
            });
            
            // Create settings button
            const button = createPrismSettingsButton(panel);
            
            // Find or create nav-controls container
            let controlsContainer = nav.querySelector('.nav-controls');
            if (!controlsContainer) {
                controlsContainer = document.createElement('div');
                controlsContainer.classList.add('nav-controls');
                nav.insertBefore(controlsContainer, nav.firstChild);
            }
            
            // Add button and panel to controls
            controlsContainer.appendChild(button);
            controlsContainer.appendChild(panel);
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkNav), 5000);
}
```

---

### **3. CSS Styling** (`styles.css`)

**File**: `htdocs/docs/dev/css/styles.css` (Lines 806-1001)

**Key Styles**:

#### Settings Button
```css
.prism-settings-btn {
    background: var(--panel);
    border: 1px solid var(--line);
    color: var(--fg);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.prism-settings-btn:hover {
    background: var(--card);
    border-color: var(--accent);
    color: var(--accent);
}
```

#### Settings Panel
```css
.prism-settings-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--panel);
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    padding: 1rem;
    margin-top: 0.5rem;
    box-shadow: var(--shadow);
    z-index: 1000;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-8px);
    transition: all 0.3s ease;
}

.prism-settings-panel.open {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
}
```

#### Feature Toggle Classes
```css
/* Disable syntax highlighting */
body.prism-no-highlighting pre[class*="language-"] code {
    color: var(--fg) !important;
    text-shadow: none !important;
}

body.prism-no-highlighting .token {
    color: inherit !important;
    background: none !important;
}

/* Hide line numbers */
body.prism-no-line-numbers .line-numbers-rows {
    display: none !important;
}

/* Hide copy button */
body.prism-no-copy .toolbar-item button[data-copy-state] {
    display: none !important;
}

/* Hide download button */
body.prism-no-download .toolbar-item a[download] {
    display: none !important;
}

/* Hide language label */
body.prism-no-language .toolbar-item .language-label {
    display: none !important;
}

/* Hide line highlight */
body.prism-no-line-highlight .line-highlight {
    display: none !important;
}

/* Hide command-line prompts */
body.prism-no-command-line .command-line-prompt {
    display: none !important;
}
```

---

## How It Works

### **Configuration Flow**

```
1. Page Load
   ↓
2. Router setup() called
   ↓
3. loadPrismConfig() - Load from localStorage
   ↓
4. applyPrismConfig() - Add body classes
   ↓
5. initPrismSettingsUI() - Create UI
   ↓
6. User navigates to page
   ↓
7. highlightCode(main, config) - Apply highlighting
   ↓
8. User toggles setting
   ↓
9. savePrismConfig() - Save to localStorage
   ↓
10. applyPrismConfig() - Update body classes
    ↓
11. highlightCode(main, config) - Re-apply highlighting
```

---

### **Body Classes Applied**

When a feature is **disabled**, the corresponding body class is added:

| Setting | Body Class |
|---------|-----------|
| Enable Syntax Highlighting = false | `prism-no-highlighting` |
| Show Line Numbers = false | `prism-no-line-numbers` |
| Show Copy Button = false | `prism-no-copy` |
| Show Download Button = false | `prism-no-download` |
| Show Language Label = false | `prism-no-language` |
| Enable Line Highlight = false | `prism-no-line-highlight` |
| Enable Command Line Prompts = false | `prism-no-command-line` |

**CSS then uses these classes to hide/disable features**:
```css
body.prism-no-copy .toolbar-item button[data-copy-state] {
    display: none !important;
}
```

---

## LocalStorage Structure

**Key**: `prismConfig`

**Value** (JSON):
```json
{
    "enableHighlighting": true,
    "showLineNumbers": true,
    "showCopyButton": true,
    "showDownloadButton": true,
    "showLanguageLabel": true,
    "enableLineHighlight": true,
    "enableCommandLine": true
}
```

**Default Values**: All features enabled (`true`)

---

## User Experience

### **Toggling a Setting**

1. User clicks `</>` button in navigation
2. Settings panel slides down with fade animation
3. User clicks checkbox to toggle a feature
4. Setting is immediately saved to localStorage
5. Body class is added/removed
6. Code blocks on current page update instantly
7. Setting persists across page navigation and browser sessions

---

### **Resetting to Defaults**

1. User clicks "Reset to Defaults" button
2. All checkboxes are checked (all features enabled)
3. Settings are saved to localStorage
4. Body classes are removed
5. Code blocks return to default appearance
6. Button flashes accent color for visual feedback

---

### **Closing the Panel**

1. User clicks "Close" button
2. Panel slides up with fade animation
3. Settings remain saved
4. User can reopen panel anytime

---

## Files Modified Summary

| File | Lines | Description |
|------|-------|-------------|
| `htdocs/src/utilities/prism-config.js` | 1-300 | Configuration manager (NEW FILE) |
| `htdocs/src/router.js` | 7-13 | Import configuration utilities |
| `htdocs/src/router.js` | 26-28 | Load and apply configuration |
| `htdocs/src/router.js` | 153-154 | Use highlightCode() with config |
| `htdocs/src/router.js` | 211-254 | Initialize settings UI |
| `htdocs/docs/dev/css/styles.css` | 806-1001 | Settings UI styles (196 lines) |

---

## Testing Checklist

### **UI Functionality**

- ✅ Settings button appears in navigation area
- ✅ Button has `</>` icon and proper styling
- ✅ Clicking button opens/closes settings panel
- ✅ Panel slides down with smooth animation
- ✅ Panel contains 7 checkbox options
- ✅ All checkboxes are checked by default
- ✅ "Reset to Defaults" and "Close" buttons present

### **Setting Toggles**

- ✅ **Enable Syntax Highlighting**: Removes all color highlighting when off
- ✅ **Show Line Numbers**: Hides line number gutter when off
- ✅ **Show Copy Button**: Hides copy button in toolbar when off
- ✅ **Show Download Button**: Hides download button in toolbar when off
- ✅ **Show Language Label**: Hides language label when off
- ✅ **Enable Line Highlight**: Hides highlighted lines when off
- ✅ **Enable Command Line Prompts**: Hides command prompts when off

### **Persistence**

- ✅ Settings save to localStorage immediately
- ✅ Settings persist after page refresh
- ✅ Settings persist across page navigation
- ✅ Settings persist across browser sessions
- ✅ "Reset to Defaults" restores all features

### **Real-Time Application**

- ✅ Toggling setting applies immediately (no page refresh)
- ✅ Code blocks on current page update instantly
- ✅ Settings apply to newly navigated pages
- ✅ Multiple toggles work correctly together

### **Responsive Design**

- ✅ Settings button is touch-friendly on mobile
- ✅ Settings panel is readable on mobile
- ✅ Panel doesn't overflow viewport on mobile
- ✅ Checkboxes are easy to tap on mobile

---

## Benefits Achieved

1. ✅ **User Control** - Users can customize their code viewing experience
2. ✅ **Accessibility** - Users can disable features that may be distracting
3. ✅ **Performance** - Users can disable highlighting for better performance
4. ✅ **Persistence** - Settings saved across sessions
5. ✅ **Real-Time** - Changes apply immediately without page refresh
6. ✅ **Intuitive UI** - Simple checkbox interface
7. ✅ **Visual Feedback** - Smooth animations and hover effects
8. ✅ **Defaults** - All features enabled by default (current behavior)
9. ✅ **Reset Option** - Easy way to restore defaults
10. ✅ **Responsive** - Works on all devices

---

## Summary

A comprehensive Prism.js configuration UI has been successfully implemented, providing users with full control over 7 syntax highlighting features:

- ✅ **Settings Button** - `</>` icon in navigation area
- ✅ **Settings Panel** - Slide-down panel with 7 checkboxes
- ✅ **Real-Time Application** - Changes apply immediately
- ✅ **LocalStorage Persistence** - Settings saved across sessions
- ✅ **Reset to Defaults** - One-click restore
- ✅ **Responsive Design** - Works on all devices
- ✅ **CSS-Based Toggling** - Efficient body class system
- ✅ **Smooth Animations** - Professional UX

Users can now customize their code block viewing experience with instant feedback and persistent settings! 🎉

