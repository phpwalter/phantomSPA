# ![pSPA.icon.png](/src/assets/images/pSPA.icon.png)  Using the CLI

## Overview

PhantomSPA includes a command-line interface (CLI) for common development tasks. The CLI helps with building, testing, and deploying your SPA applications.

> **Note**: The CLI is currently in development. This documentation describes planned features for future releases.

---

## Installation

The CLI is included when you install PhantomSPA via npm:

```bash
npm install phantomspa
```

For global installation:

```bash
npm install -g phantomspa
```

---

## Available Commands

### `phantomspa build`

Builds your application for production.

```bash
phantomspa build [options]
```

**Options:**
- `--output <dir>` - Output directory (default: `dist`)
- `--minify` - Minify JavaScript and CSS
- `--sourcemap` - Generate source maps

**Example:**
```bash
phantomspa build --output dist --minify
```

---

### `phantomspa dev`

Starts a development server with hot reload.

```bash
phantomspa dev [options]
```

**Options:**
- `--port <number>` - Port number (default: `3000`)
- `--host <address>` - Host address (default: `localhost`)
- `--open` - Open browser automatically

**Example:**
```bash
phantomspa dev --port 8080 --open
```

---

### `phantomspa snapshot`

Generates static HTML snapshots of all routes for SEO and performance.

```bash
phantomspa snapshot [options]
```

**Options:**
- `--config <file>` - Path to app-config.json
- `--output <dir>` - Output directory for snapshots

**Example:**
```bash
phantomspa snapshot --config htdocs/docs/dev/conf/app-config.json
```

---

### `phantomspa validate`

Validates your configuration files and routes.

```bash
phantomspa validate [options]
```

**Options:**
- `--config <file>` - Path to app-config.json
- `--strict` - Enable strict validation mode

**Example:**
```bash
phantomspa validate --config htdocs/docs/dev/conf/app-config.json --strict
```

---

## Configuration

The CLI reads configuration from `phantomspa.config.js` in your project root:

```javascript
// phantomspa.config.js
export default {
  build: {
    outDir: 'dist',
    minify: true,
    sourcemap: true
  },
  dev: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  snapshot: {
    routes: 'auto', // or array of paths
    outDir: 'snapshots'
  }
};
```

---

## Environment Variables

The CLI respects the following environment variables:

- `NODE_ENV` - Set to `production` or `development`
- `PHANTOM_CONFIG` - Path to custom config file
- `PHANTOM_PORT` - Override dev server port

**Example:**
```bash
NODE_ENV=production phantomspa build
```

---

## Programmatic API

You can also use the CLI programmatically in Node.js:

```javascript
import { build, dev, snapshot } from 'phantomspa/cli';

// Build for production
await build({
  outDir: 'dist',
  minify: true
});

// Start dev server
await dev({
  port: 3000,
  open: true
});

// Generate snapshots
await snapshot({
  config: './app-config.json',
  outDir: 'snapshots'
});
```

---

## Troubleshooting

### Build fails with module errors

Make sure all dependencies are installed:
```bash
npm install
```

### Dev server won't start

Check if the port is already in use:
```bash
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Snapshot generation fails

Ensure your routes are properly configured in `nav.json` and all referenced files exist.

---

## Future Features

The following features are planned for future CLI releases:

- [ ] Interactive project scaffolding
- [ ] Plugin management
- [ ] Performance profiling
- [ ] Bundle analysis
- [ ] Deployment helpers for various platforms
- [ ] Testing utilities

---

## Getting Help

For more information:

- Run `phantomspa --help` for command list
- Run `phantomspa <command> --help` for command-specific help
- Visit the [GitHub repository](https://github.com/phpwalter/phantomSPA)
- Check the [API Reference](/docs/dev/api-ref)

---

[← Back to Getting Started](/docs/dev/getting-started) | [Advanced Topics →](/docs/dev/advanced)
