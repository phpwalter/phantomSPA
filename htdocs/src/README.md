
# PhantomSPA Source Code Documentation

**Version:** 0.0.1  
**License:** MIT

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Module Reference](#module-reference)
    - [Core Modules](#core-modules)
    - [Configuration](#configuration)
    - [Utilities](#utilities)
    - [Navigation System](#navigation-system)
- [Configuration Schemas](#configuration-schemas)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Development](#development)
- [Testing](#testing)
- [Build & Deploy](#build--deploy)

---

## Overview

PhantomSPA is a lightweight, configuration-driven SPA (Single Page Application) framework built with vanilla JavaScript. It provides a robust foundation for building modern web applications without the complexity of heavy frameworks.

### Key Features

- **Zero Dependencies**: Pure vanilla JavaScript with no external runtime dependencies
- **Modular Architecture**: Clean separation of concerns with well-defined modules
- **Event-Driven**: Centralized event system for loose coupling between components
- **Plugin System**: Extensible architecture for adding custom functionality
- **Router**: Client-side routing with history API support
- **Error Handling**: Comprehensive error handling with custom error types
- **Configuration Management**: Centralized configuration with validation
- **Performance Optimized**: Built-in utilities for debouncing, throttling, and caching

---

## Directory Structure

```tree
src/
├── assets/    # Static assets 
│   └── images/
│       ├── prog.lang-icons/
│       │   ├── prog.lang-icons.css     # CSS sprite sheet
│       │   └── prog.lang-icons.png     # PNG sprite sheet
│       ├── social-icons/
│       │   ├── social-icons.css        # CSS sprite sheet
│       │   └── social-icons.png        # PNG sprite sheet
│       ├── favicon.ico                 # Favicon
│       ├── md.png
│       ├── pSPA.banner.png
│       ├── pSPA.icon.png
│       ├── pSPA.title-banner.png
│       └──  pSPA.title.png
├── config/  # Configuration layer
│   ├── schemas/              # JSON schema definitions
│   │   └── plugins.schema.json5
│   ├── app-config.js         # Application configuration manager
│   └── constants.js          # Application-wide constants
├── core/  # Core application modules
│   ├── nav/  # Navigation subsystem
│   │   ├── nav-controller.js # Navigation orchestration
│   │   ├── nav-renderer.js   # DOM rendering
│   │   └── nav-service.js    # Data fetching
│   ├── error-handler.js      # Error handling system
│   ├── event-bus.js          # Centralized event system
│   ├── lifecycle.js          # Application lifecycle management
│   ├── plugin-manager.js     # Plugin system
│   ├── router.js             # Client-side routing
│   └── spa.js                # Core application class
├── enhancers/                # UI enhancers
│   └── panels.js             # Panel layout enhancer
├── integrations/             # Third-party integrations
│   ├── prism-loader.js       # Prism.js plugin loader
│   └── prism.js              # Prism.js integration
├── plugins/                  # Plugin modules
│   └── prism/                # Prism.js syntax highlighting plugin
│       ├── prism-config.js
│       ├── prism-debug.js
│       ├── prism-plugin-loader.js
│       ├── prism-syntax-highlighter.css
│       └── prism-syntax-highlighter.js
├── tests/                    # Internal tests
│   ├── README.md
│   ├── debug-prism-per-block.js
│   ├── quick-prism-diagnostic.js
│   └── test-prism.html
├── utilities/                # Utility modules
│   ├── dom-builder.js        # DOM manipulation
│   ├── fetch-helper.js       # Fetch  with retry
│   ├── markdown.js           # Markdown rendering
│   ├── performance.js        # Performance optimization
│   ├── resource-loader.js    # Resource loading
│   ├── schema-validator.js   # JSON schema validation
│   └── validation.js         # General validation
├── README.md
└── index.js
```

---

## Module Reference

### Core Modules

#### `spa.js`
Main application class that orchestrates initialization and manages application lifecycle.

**Exports:**
- `SPA` - Main application class
- `createApp(config)` - Factory function for creating SPA instances

**Example:**

```javascript
import { createApp } from './core/spa.js';
const app = await createApp(config);
```
---

#### `router.js`
Client-side routing system with history API support and route matching.

**Exports:**
- `Router` - Router class

**Features:**
- History API integration
- Route parameter extraction
- Wildcard route support
- Link interception
- Navigation events

**Example:**
```javascript
 import { Router } from './core/router.js';
const router = new Router([
    { path: '/', handler: homeHandler },
    { path: '/about', handler: aboutHandler }
]);
```

---

#### `event-bus.js`
Centralized pub/sub event system for inter-module communication.

**Exports:**
- `EventBus` - Event bus class
- `eventBus` - Global singleton instance

**Methods:**
- `on(event, handler)` - Subscribe to event
- `off(event, handler)` - Unsubscribe from event
- `emit(event, data)` - Emit event
- `once(event, handler)` - Subscribe once
- `clear(event)` - Clear event handlers
- `clearAll()` - Clear all handlers

**Example:**
```javascript
import { eventBus } from './core/event-bus.js';
// Subscribe
const unsubscribe = eventBus.on('route:change', (data) => {
    console.log('Route changed:', data);
});

// Emit
eventBus.emit('route:change', { path: '/new-route' });

// Unsubscribe
unsubscribe();
```

---

#### `plugin-manager.js`
Plugin registration and lifecycle management system.

**Exports:**
- `PluginManager` - Plugin manager class
- `pluginManager` - Global singleton instance

**Methods:**
- `register(name, plugin, options)` - Register plugin
- `get(name)` - Get plugin instance
- `has(name)` - Check if plugin exists
- `enable(name)` - Enable plugin
- `disable(name)` - Disable plugin
- `hook(hookName, callback, priority)` - Register hook
- `trigger(hookName, data)` - Trigger hook

**Example:**
```javascript
import { pluginManager } from './core/plugin-manager.js';
const myPlugin = {
    async init(manager, options) {
        console.log('Plugin initialized');
    }
};
await pluginManager.register('my-plugin', myPlugin, { enabled: true, priority: 10 });
```
---

#### `resource-loader.js`
Dynamic resource loading utilities for scripts, stylesheets, and assets.

**Exports:**
 - loadScript(url, options) - Load external script
 - loadStylesheet(url, options) - Load external stylesheet
 - preloadResource(url, type) - Preload resource
 - loadMultipleResources(resources) - Load multiple resources
 - isResourceLoaded(url) - Check if resource is loaded

**Example:**
```javascript
import { loadScript, loadStylesheet } from './utilities/resource-loader.js';

// Load external script
await loadScript('https://cdn.example.com/library.js', {
    defer: true,
    id: 'external-lib'
});

// Load stylesheet
await loadStylesheet('/assets/styles/theme.css', {
    id: 'theme-css'
});

// Check if loaded
if (isResourceLoaded('external-lib')) {
    console.log('Library is ready');
}
```

---

#### `markdown.js`
Markdown rendering utilities using Snarkdown library.

**Exports:**
 - renderMarkdown(markdown) - Convert markdown to HTML
 - sanitizeHTML(html) - Sanitize HTML content
 - parseMarkdownMeta(markdown) - Extract frontmatter metadata

**Example:**
```javascript
import { renderMarkdown, sanitizeHTML } from './utilities/markdown.js';

const markdown = '# Hello **World**\n\nThis is *markdown*.';
const html = renderMarkdown(markdown);
const safe = sanitizeHTML(html);

document.getElementById('content').innerHTML = safe;
```

---

#### `error-handler.js`
Comprehensive error handling with custom error types.

**Exports:**
- `AppError` - Custom error class
- `ErrorHandler` - Error handler utility class

**Example:**
```javascript
import { AppError, ErrorHandler } from './core/error-handler.js';

try {
    throw new AppError('Something went wrong', 'CUSTOM_ERROR', {
        context: 'additional data'
    });
} catch (error) {
    await ErrorHandler.handle(error, (err) => {
        // Fallback function
        console.error('Handling error:', err);
    });
}
```

---

#### `lifecycle.js`
Application lifecycle hooks for managing initialization and destruction stages.

**Exports:**
- `Lifecycle` - Lifecycle class
- `lifecycle` - Global singleton instance
- `onBeforeInit(callback)` - Before initialization hook
- `onAfterInit(callback)` - After initialization hook
- `onBeforeDestroy(callback)` - Before destruction hook
- `onAfterDestroy(callback)` - After destruction hook

**Example:**
```javascript
import { onAfterInit } from './core/lifecycle.js';
onAfterInit(async () => {
    console.log('App initialized!');
    // Perform post-initialization tasks
});
```
---

### Configuration

#### `app-config.js`
Centralized configuration management with external file loading and validation.

**Exports:**
- `AppConfig` - Configuration manager class
- `createAppConfig(userConfig, loadExternal)` - Factory function
- `getDefaultConfig()` - Get singleton instance

---
### Navigation System

#### `nav-controller.js`
Orchestrates navigation initialization and manages navigation state.

**Exports:**
 - NavController - Navigation controller class
 - initNavigation(config) - Initialize navigation system

**Methods:**
 - `init()` - Initialize navigation
 - `update()` - Update navigation state
 - `handleRouteChange(route)` - Handle route changes
 - `expandPath(path)` - Expand navigation to path

**Example:**
```javascript
import { initNavigation } from './core/nav/nav-controller.js';

const nav = await initNavigation({
    container: '#site-nav',
    navPath: '/conf/nav.json',
    templatePath: '/pages/nav.html',
    maxDepth: 10,
    autoExpand: true
});

// Listen for navigation events
nav.on('item:click', (item) => {
    console.log('Clicked:', item.title);
});
```

---

#### `nav-service.js`
Handles fetching and caching of navigation data.

**Exports:**
 - `NavService` - Navigation service class

**Methods:**
 - `fetchNavData()` - Fetch navigation JSON
 - `fetchTemplate()` - Fetch navigation template
 - `fetchAll()` - Fetch all navigation resources
 - `getCached()` - Get cached navigation data
 - `invalidateCache()` - Clear navigation cache

**Example:**
```javascript
import { NavService } from './core/nav/nav-service.js';

const service = new NavService({
    navPath: '/conf/nav.json',
    templatePath: '/pages/nav.html'
});

const { navData, template } = await service.fetchAll();
console.log('Navigation routes:', navData.routes.length);
```

---

#### `nav-renderer.js`
Renders navigation DOM structure from route data.

**Exports:**
 - `NavRenderer` - Navigation renderer class

**Methods:**
 - `renderNavTree(routes, depth)` - Render navigation tree
 - `renderNavItem(route, level)` - Render single navigation item
 - `updateActiveState(path)` - Update active navigation item
 - `collapseAll()` - Collapse all navigation sections
 - `expandAll()` - Expand all navigation sections

**Example:**
```javascript
import { NavRenderer } from './core/nav/nav-renderer.js';

const template = document.querySelector('#nav-template');
const renderer = new NavRenderer(template, 10);

const navTree = renderer.renderNavTree(routes);
document.querySelector('#site-nav').appendChild(navTree);

// Update active state on route change
renderer.updateActiveState('/docs/api');
```

---

## Configuration Schemas
JSON schemas are located in src/config/schemas/ and define validation rules for configuration objects.

#### Plugin Schema (plugins.schema.json5)
Defines the structure for plugin configurations.

**Schema Structure:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Plugin name"
    },
    "enabled": {
      "type": "boolean",
      "default": true
    },
    "priority": {
      "type": "number",
      "default": 10
    },
    "options": {
      "type": "object",
      "description": "Plugin-specific options"
    }
  },
  "required": ["name"]
}
```

**Usage in Configuration:**
```json
{
  "$schema": "/src/config/schemas/plugins.schema.json5",
  "plugins": {
    "prism-syntax-highlighter": {
      "enabled": true,
      "priority": 10,
      "theme": "tomorrow",
      "languages": ["javascript", "css", "html"]
    }
  }
}
```

**Validation:**
```javascript
import { validatePluginConfig, assertValidPluginConfig } from './utilities/schema-validator.js';

// Validate with result
const result = validatePluginConfig(config);
if (!result.isValid) {
    console.error('Schema validation errors:', result.errors);
}

// Validate and throw on error
try {
    assertValidPluginConfig(config);
    console.log('Configuration is valid');
} catch (error) {
    console.error('Invalid plugin configuration:', error.message);
}
```

## Usage Examples
### Complete Application Initialization
```javascript
import { initPhantom } from './src/index.js';
import { eventBus } from './src/core/event-bus.js';
import { EVENTS } from './src/config/constants.js';

// Listen for app events
eventBus.on(EVENTS.APP_READY, () => {
    console.log('Application is ready!');
});

eventBus.on(EVENTS.ROUTE_CHANGE, ({ path }) => {
    console.log('Navigated to:', path);
});

// Initialize application
const app = await initPhantom({
    paths: {
        navConfig: '/docs/dev/conf/nav.json',
        contentRoot: '/docs/dev/pages/'
    },
    nav: {
        maxDepth: 10,
        autoExpand: true,
        collapseByDefault: false
    },
    features: {
        validateSchemas: true
    }
});

console.log('App initialized:', app);
```

---

#### Creating a Custom Plugin
```javascript
// my-plugin.js
export const MyPlugin = {
    name: 'my-plugin',
    version: '1.0.0',

    async init(pluginManager, options) {
        console.log('Initializing MyPlugin with options:', options);

        // Register hooks
        pluginManager.hook('before:render', this.beforeRender.bind(this), 10);
        pluginManager.hook('after:render', this.afterRender.bind(this), 10);

        // Subscribe to events
        pluginManager.events.on('custom:event', this.handleEvent.bind(this));
    },

    beforeRender(data) {
        console.log('Before render:', data);
        // Modify data if needed
        return data;
    },

    afterRender(data) {
        console.log('After render:', data);
    },

    handleEvent(eventData) {
        console.log('Custom event received:', eventData);
    },

    destroy() {
        console.log('Cleaning up MyPlugin');
    }
};

// Register the plugin
import { pluginManager } from './src/core/plugin-manager.js';

await pluginManager.register('my-plugin', MyPlugin, {
    enabled: true,
    customOption: 'value'
});
```

#### Working with the Router
```javascript
import { Router } from './src/core/router.js';
import { eventBus } from './src/core/event-bus.js';
import { EVENTS } from './src/config/constants.js';

// Define route handlers
const routes = [
    {
        path: '/',
        handler: async () => {
            console.log('Home page');
            document.getElementById('content').innerHTML = 'Home';
        }
    },
    {
        path: '/about',
        handler: async () => {
            console.log('About page');
            document.getElementById('content').innerHTML = 'About';
        }
    },
    {
        path: '/user/:id',
        handler: async (params) => {
            console.log('User page:', params.id);
            document.getElementById('content').innerHTML = `<h1>User ${params.id}</h1>`;
        }
    },
    {
        path: '*',
        handler: async () => {
            console.log('404 Not Found');
            document.getElementById('content').innerHTML = '404 Not Found';
        }
    }
];

// Create router
const router = new Router(routes, {
    base: '/docs/dev',
    mode: 'history'
});

// Listen for route changes
eventBus.on(EVENTS.ROUTE_CHANGE, ({ path, route }) => {
    console.log('Route changed:', path);
    updateActiveNavLink(path);
});

// Programmatic navigation
router.navigate('/about');
router.replace('/user/123');
router.back();
```

#### Error Handling Pattern
```javascript
import { AppError, ErrorHandler } from './src/core/error-handler.js';
import { ERROR_CODES } from './src/config/constants.js';

async function loadUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);

        if (!response.ok) {
            throw new AppError(
                `Failed to load user data`,
                ERROR_CODES.FETCH_HTTP_ERROR,
                {
                    userId,
                    status: response.status,
                    statusText: response.statusText
                }
            );
        }

        return await response.json();

    } catch (error) {
        await ErrorHandler.handle(error, async (err) => {
            // Fallback: show cached data or error message
            console.error('Loading user data failed, showing fallback');
            return getCachedUserData(userId);
        });
    }
}
```

#### Using Configuration
```javascript
import { createAppConfig } from './src/config/app-config.js';

// Create configuration with overrides
const config = await createAppConfig({
    paths: {
        navConfig: '/custom/nav.json'
    },
    nav: {
        maxDepth: 15,
        autoExpand: true
    }
}, true); // Load external config

// Get values
const navPath = config.get('paths.navConfig');
const maxDepth = config.get('nav.maxDepth', 10); // With default

// Set values
config.set('features.darkMode', true);

// Save to localStorage
config.saveToStorage('userPreferences', {
    theme: 'dark',
    language: 'en'
});

// Load from localStorage
const prefs = config.loadFromStorage('userPreferences', {});
```


**Configuration Structure:**
```json
{
  "paths": {
    "docsBase": "/docs",
    "devDocs": "/docs/dev",
    "navConfig": "/docs/dev/conf/nav.json",
    "appConfig": "/docs/dev/conf/app-config.json",
    "navTemplate": "/docs/dev/pages/nav.html",
    "contentRoot": "/docs/dev/pages/",
    "schemasDir": "/src/config/schemas"
  },
  "storage": {
    "prefix": "phantom.",
    "keys": {
      "docsSpace": "docs.space",
      "navTreeDetails": "navTreeDetails",
      "navTreeConfig": "navTreeConfig"
    }
  },
  "nav": {
    "maxDepth": 10,
    "autoExpand": false,
    "collapseByDefault": true,
    "activeClass": "active"
  },
  "features": {
    "autoRedirect": false,
    "centerBadges": true,
    "validateSchemas": true
  },
  "plugins": { }
}

```

**Example:**
```javascript
import { createAppConfig } from './config/app-config.js';
const config = await createAppConfig({ nav: { maxDepth: 15 }, features: { autoRedirect: true } });
const docsBase = config.get('paths.docsBase');
config.set('nav.autoExpand', true);
```

---

#### `constants.js`
Application-wide constants including error codes, events, paths, and feature flags.

**Exports:**
- `APP` - Application metadata
- `ERROR_CODES` - Error code constants
- `HTTP_STATUS` - HTTP status codes
- `STORAGE_KEYS` - LocalStorage key constants
- `PATHS` - Default path constants
- `EVENTS` - Event name constants
- `CSS_CLASSES` - CSS class name constants
- `TIMEOUTS` - Default timeout values
- `FEATURES` - Feature flag constants

**Example:**
```javascript
import { EVENTS, ERROR_CODES, PATHS } from './config/constants.js';
eventBus.emit(EVENTS.APP_READY);
throw new AppError('Error', ERROR_CODES.NAV_FETCH_ERROR);
const navPath = PATHS.NAV_CONFIG;
```

---

### Utilities

#### `fetch-helper.js`
HTTP request utilities with consistent error handling and retry logic.

**Exports:**
- `fetchJSON(url, options)` - Fetch and parse JSON
- `fetchHTML(url, options)` - Fetch HTML/text
- `fetchText(url, options)` - Fetch text (alias)
- `fetchWithRetry(fetchFn, maxRetries, delay)` - Retry failed requests
- `fetchMultiple(urls, fetchFn)` - Fetch multiple resources

**Example:**
```javascript
import { fetchJSON, fetchWithRetry } from './utilities/fetch-helper.js';

// Simple fetch
const data = await fetchJSON('/api/data');

// With retry
const config = await fetchWithRetry(
    () => fetchJSON('/api/config.json'),
    3,  // max retries
    1000  // delay in ms
);
```

---

#### `dom-builder.js`
DOM manipulation helpers for creating and managing elements.

**Exports:**
- `createElement(tag, attributes, children)` - Create element
- `createElements(configs)` - Create multiple elements
- `wrapElement(element, wrapperTag, attributes)` - Wrap element
- `clearElement(element)` - Remove all children
- `replaceElement(oldElement, newElement)` - Replace element
- `appendChildren(parent, children)` - Append multiple children
- `createFromHTML(html)` - Create from HTML string
- `toggleClass(element, className, force)` - Toggle class
- `addClasses(element, classNames)` - Add multiple classes
- `removeClasses(element, classNames)` - Remove multiple classes

**Example:**
```javascript
import { createElement, addClasses } from './utilities/dom-builder.js';

const button = createElement('button', {
    className: 'btn',
    textContent: 'Click me',
    onclick: () => console.log('Clicked!')
});

addClasses(button, ['btn-primary', 'btn-lg']);
```

---

#### `performance.js`
Performance optimization utilities including debouncing, throttling, and caching.

**Exports:**
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `ResourceCache` - Simple cache with expiration
- `lazyLoad(importFn)` - Lazy load modules
- `preload(url, as)` - Preload resources
- `measureTime(fn, label)` - Measure execution time
- `requestIdleCallback(callback, options)` - Idle callback with fallback
- `cancelIdleCallback(id)` - Cancel idle callback

**Example:**
```javascript
import { debounce, ResourceCache, measureTime } from './utilities/performance.js';

// Debounce
const debouncedSearch = debounce((query) => { performSearch(query); }, 300);

// Cache
const cache = new ResourceCache(5 * 60 * 1000); // 5 minutes TTL
cache.set('key', data);
const cached = cache.get('key');

// Measure performance
await measureTime(async () => {
    await expensiveOperation();
}, 'Expensive Operation');
```

---

#### `validation.js`
Data validation functions for common use cases.

**Exports:**
- `isString(value)` - Check if string
- `isNonEmptyString(value)` - Check if non-empty string
- `isNumber(value)` - Check if number
- `isObject(value)` - Check if plain object
- `isArray(value)` - Check if array
- `isNonEmptyArray(value)` - Check if non-empty array
- `isFunction(value)` - Check if function
- `isValidURL(value)` - Validate URL
- `isValidPath(value)` - Validate path
- `isDOMElement(element)` - Check if DOM element
- `hasMatchingElements(selector)` - Check if selector matches
- `validateRoute(route)` - Validate route object
- `validateConfig(config, schema)` - Validate configuration

**Example:**
```javascript
import { isNonEmptyString, validateRoute } from './utilities/validation.js';

if (isNonEmptyString(userInput)) {
    processInput(userInput);
}

const result = validateRoute(routeObject);
if (!result.isValid) {
    console.error('Route errors:', result.errors);
}

```

---

#### `schema-validator.js`
JSON schema validation utilities for configuration validation.

**Exports:**
- `SCHEMAS` - Schema path constants
- `validatePluginConfig(config)` - Validate plugin configuration
- `assertValidPluginConfig(config)` - Validate and throw if invalid
- `getSchemaUrl(schemaName)` - Get schema URL

**Example:**
```javascript
import { validatePluginConfig, assertValidPluginConfig } from './utilities/schema-validator.js';

// Validate with result
const result = validatePluginConfig(config);
if (!result.isValid) {
    console.error('Errors:', result.errors);
}

// Validate and throw
try {
    assertValidPluginConfig(config);
} catch (error) {
    console.error('Invalid config:', error);
}
```

---

### Navigation System

#### `nav-controller.js`
Orchestrates navigation initialization and manages updates.

**Exports:**
- `NavController` - Navigation controller class
- `initNavigation(config)` - Initialize navigation

**Example:**
```javascript
import { initNavigation } from './core/nav/nav-controller.js';

const nav = await initNavigation({
    container: '#site-nav',
    navPath: '/conf/nav.json',
    templatePath: '/pages/nav.html'
});
```

---

#### `nav-service.js`
Handles fetching and processing navigation data.

**Exports:**
- `NavService` - Navigation service class

**Example:**
```javascript
import { NavService } from './core/nav/nav-service.js';
const service = new NavService({ navPath: '/conf/nav.json', templatePath: '/pages/nav.html' });
const { navData, template } = await service.fetchAll();
```

---

#### `nav-renderer.js`
Renders navigation DOM structure from route data.

**Exports:**
- `NavRenderer` - Navigation renderer class

**Example:**
```javascript
import { NavRenderer } from './core/nav/nav-renderer.js';

const renderer = new NavRenderer(templateElement, maxDepth);
const navTree = renderer.renderNavTree(routes);
```

---

## Configuration Schemas

JSON schemas are located in `src/config/schemas/`:

### Plugin Schema (`plugins.schema.json5`)

Defines the structure for plugin configurations.

**Usage in JSON:**
```json
{
    "$schema": "/src/config/schemas/plugins.schema.json5",
    "plugins": {
        "prism": {
            "theme": "tomorrow",
            "languages": [
                "javascript",
                "css",
                "html"
            ],
            "extensions": {
                "toolbar": {
                    "active": true
                },
                "line-numbers": {
                    "active": true
                },
                "copy-to-clipboard": {
                    "active": true
                }
            }
        }
    }
}
```

**Validation:**
```javascript
import { validatePluginConfig } from './utilities/schema-validator.js';

const result = validatePluginConfig(config);
if (!result.isValid) {
    console.error('Schema validation errors:', result.errors);
}
```

---

## Usage Examples

### Complete Application Initialization
```javascript
import { initPhantom } from './src/index.js';
import { eventBus } from './src/core/event-bus.js';
import { EVENTS } from './src/config/constants.js';

// Listen for app events
eventBus.on(EVENTS.APP_READY, () => { console.log('Application is ready!'); });
eventBus.on(EVENTS.ROUTE_CHANGE, ({ path }) => { console.log('Navigated to:', path); });
// Initialize application
const app = await initPhantom({ paths: { navConfig: '/docs/dev/conf/nav.json', contentRoot: '/docs/dev/pages/' }, nav: { maxDepth: 10, autoExpand: true, collapseByDefault: false }, features: { validateSchemas: true } });
console.log('App initialized:', app);
```

---

### Creating a Custom Plugin
```javascript
// my-plugin.js export
// my-plugin.js
export const MyPlugin = {
    name: 'my-plugin',
    version: '1.0.0',
async init(pluginManager, options) {
    console.log('Initializing MyPlugin with options:', options);

    // Register hooks
    pluginManager.hook('before:render', this.beforeRender.bind(this), 10);
    pluginManager.hook('after:render', this.afterRender.bind(this), 10);

    // Subscribe to events
    pluginManager.events.on('custom:event', this.handleEvent.bind(this));
},

beforeRender(data) {
    console.log('Before render:', data);
    return data; // Modified data
},

afterRender(data) {
    console.log('After render:', data);
},

handleEvent(eventData) {
    console.log('Custom event received:', eventData);
},

destroy() {
    console.log('Cleaning up MyPlugin');
}
};
// Register the plugin import { pluginManager } from './src/core/plugin-manager.js';
await pluginManager.register('my-plugin', MyPlugin, { enabled: true, customOption: 'value' });

```

---

### Working with the Router
```javascript
import { Router } from './src/core/router.js'; import { eventBus } from './src/core/event-bus.js'; import { EVENTS } from './src/config/constants.js';
    
// Define route handlers
import { Router } from './src/core/router.js';
import { eventBus } from './src/core/event-bus.js';
import { EVENTS } from './src/config/constants.js';

// Define route handlers
const routes = [
    {
        path: '/',
        handler: async () => {
            console.log('Home page');
            document.getElementById('content').innerHTML = 'Home';
        }
    },
    {
        path: '/about',
        handler: async () => {
            console.log('About page');
            document.getElementById('content').innerHTML = 'About';
        }
    },
    {
        path: '/user/:id',
        handler: async (params) => {
            console.log('User page:', params.id);
            document.getElementById('content').innerHTML = `<h1>User ${params.id}</h1>`;
        }
    },
    {
        path: '*',
        handler: async () => {
            console.log('404 Not Found');
            document.getElementById('content').innerHTML = '404 Not Found';
        }
    }
];

```

---

### Error Handling Pattern
```javascript
import { AppError, ErrorHandler } from './src/core/error-handler.js'; import { ERROR_CODES } from './src/config/constants.js';
    
async function loadUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);

    if (!response.ok) {
        throw new AppError(
            `Failed to load user data`,
            ERROR_CODES.FETCH_HTTP_ERROR,
            {
                userId,
                status: response.status,
                statusText: response.statusText
            }
        );
    }

    return await response.json();

} catch (error) {
    await ErrorHandler.handle(error, async (err) => {
        // Fallback: show cached data or error message
        console.error('Loading user data failed, showing fallback');
        return getCachedUserData(userId);
    });
}    
    
    
```

---

### Using Configuration
```javascript
import { createAppConfig } from './src/config/app-config.js';

// Create configuration with overrides
const config = await createAppConfig({ paths: { navConfig: '/custom/nav.json' }, nav: { maxDepth: 15, autoExpand: true } }, true); // Load external config

// Get values
const navPath = config.get('paths.navConfig');
const maxDepth = config.get('nav.maxDepth', 10); // With default

// Set values
config.set('features.darkMode', true);

// Save to localStorage
config.saveToStorage('userPreferences', { theme: 'dark', language: 'en' });

// Load from localStorage
const prefs = config.loadFromStorage('userPreferences', {});
```

---

## Best Practices

### 1. Module Organization

✅ **DO:**
```javascript
// Import from main entry point
import { initPhantom, eventBus, Router } from './src/index.js';
```

❌ **DON'T:**
```javascript
// Don't import from deep paths unnecessarily
import { eventBus } from './src/core/event-bus.js';
```

### 2. Event-Driven Communication

✅ **DO:** Use event bus for cross-module communication
```javascript
eventBus.emit('data:loaded', { data });
```

❌ **DON'T:** Create tight coupling between modules
```javascript
otherModule.handleDataLoaded(data); // Tight coupling
```

### 3. Error Handling

✅ **DO:** Always use try-catch with ErrorHandler
```javascript
try {
    /* Code that might throw */
} catch (error) {
    await ErrorHandler.handle(error);
}
```

❌ **DON'T:** Let errors propagate uncaught
```javascript
await riskyOperation(); // No error handling
```

### 4. Configuration

✅ **DO:** Use constants and configuration
```javascript
import { EVENTS } from './config/constants.js';
const navPath = config.get('paths.navConfig');
```

❌ **DON'T:** Hardcode values
```javascript
eventBus.emit('route:change'); // Magic strin
const navPath = '/docs/dev/conf/nav.json'; // Hardcoded
```

### 5. Validation

✅ **DO:** Validate inputs before processing
```javascript
import { isNonEmptyString } from './utilities/validation.js';

if (!isNonEmptyString(input)) {
    throw new Error('Invalid input');
}
```

❌ **DON'T:** Assume data is valid
```javascript
processData(input); // No validation
```

---

### 6. Performance

✅ **DO:** Use performance utilities
```javascript
import { debounce, ResourceCache } from './utilities/performance.js';

const handleSearch = debounce(search, 300);
const cache = new ResourceCache();
```

❌ **DON'T:** Create performance bottlenecks
```javascript
input.addEventListener('input', expensiveOperation); // No debouncing
```

### 7. Plugin Development

✅ **DO:** Follow plugin interface
```javascript
export const MyPlugin = {
    async init(manager, options) {
        // Implementation
    },
    destroy() {
        // Cleanup
    }
};
```

❌ **DON'T:** Pollute global scope
```javascript
window.myPlugin = {}; // Global pollution
```

---

## Development

### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/phpwalter/phantomSPA.git
cd phantomSPA

# Install dependencies
npm install

# Start development server
npx serve htdocs
```

### File Watching

For development, use a file watcher or live reload server:
```bash
# Using VS Code Live Server extension
# or
npx live-server htdocs
# or
npx browser-sync start --server htdocs --files "htdocs/**/*"
```

### Code Style

Follow ESLint configuration in `.eslintrc.json`:
```bash
# Lint code
npx eslint src/**/*.js

# Auto-fix issues
npx eslint src/**/*.js --fix
```

### Documentation

Document all public APIs with JSDoc:
```javascript
/**
 /**
 * Fetches user data from API
 * @param {string} userId - User identifier
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<Object>} User data
 * @throws {AppError} If fetch fails
 */
async function fetchUser(userId, options = {}) {
    /* Implementation */
}
```

---

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- utilities/validation.test.js

# Run tests in watch mode
npm test -- --watch
```

### Test Structure
```javascript
import { describe, it, expect } from 'vitest';
import { validateRoute } from '../utilities/validation.js';

describe('validateRoute', () => {
    it('should validate valid route', () => {
        const route = {
            path: '/home',
            title: 'Home'
        };

        const result = validateRoute(route);
        expect(result.isValid).toBe(true);
    });

    it('should reject invalid route', () => {
        const route = {};

        const result = validateRoute(route);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
```

### Manual Testing

Use test HTML files in `src/tests/`:
```bash
# Open in browser
open htdocs/src/tests/test-prism.html
```

---

## Build & Deploy

### Building for Production
```bash
# Clean previous build
npm run clean

# Build optimized bundles
npm run build
```

This generates:
- `dist/esm/` - ES modules
- Source maps for debugging
- Minified code for production

### Build Configuration

Edit `build.mjs` to customize build:
```javascript
import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['htdocs/src/index.js'],
    bundle: true,
    format: 'esm',
    outfile: 'dist/esm/index.js',
    minify: true,
    sourcemap: true
});
```

### Deployment

#### Static Hosting

Deploy `htdocs/` directory to any static host:
```bash
# Deploy to Netlify
netlify deploy --dir=htdocs --prod

# Deploy to Vercel
vercel --prod htdocs

# Deploy to GitHub Pages
# (configure in repository settings)
```

#### Server Configuration

For SPA routing, configure server to serve `index.html` for all routes:

**Nginx:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache Configuration
**Apache (`.htaccess`):**
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Contributing

See main project README for contribution guidelines.

---

## License

MIT License - see LICENSE file for details.

---

## Support

- **Documentation**: [https://phantomspa.dev/docs](https://phantomspa.dev/docs)
- **Issues**: [https://github.com/phpwalter/phantomSPA/issues](https://github.com/phpwalter/phantomSPA/issues)
- **Discussions**: [https://github.com/phpwalter/phantomSPA/discussions](https://github.com/phpwalter/phantomSPA/discussions)

---

**Last Updated:** 2025-11-06  
**Maintainer:** phpwalter
