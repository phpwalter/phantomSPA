#!/usr/bin/env node

/**
 * @file install-vendors.mjs
 * @description Vendor installation script for PhantomSPA
 *
 * This script copies necessary files from node_modules to htdocs/library/vendor/
 * to provide local fallbacks for CDN dependencies.
 *
 * Dependencies:
 *   - marked: Required for Markdown parsing (core dependency)
 *   - dompurify: Optional for HTML sanitization
 *   - prismjs: Optional for syntax highlighting (plugin dependency)
 *
 * To install optional dependencies:
 *   npm install --save-optional prismjs
 *   npm install --save-optional dompurify
 *
 * Usage:
 *   node scripts/install-vendors.mjs
 *   npm run vendor:install
 */

import { readdir, mkdir, copyFile, access, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

/**
 * Vendor configuration - defines what files to copy from node_modules
 */
const VENDOR_CONFIG = [
    {
        name: 'marked',
        description: 'Markdown parser',
        source: 'node_modules/marked/lib/marked.esm.js',
        destination: 'htdocs/library/vendor/marked/marked.esm.js',
        required: true
    },
    {
        name: 'dompurify',
        description: 'HTML sanitizer',
        source: 'node_modules/dompurify/dist/purify.es.js',
        destination: 'htdocs/library/vendor/dompurify/purify.es.js',
        required: false // Optional - only if DOMPurify is used
    },

    // Prism.js files (optional plugin dependency)
    // Note: Install prismjs with: npm install --save-optional prismjs
    {
        name: 'prism-core',
        description: 'Prism.js core library',
        source: 'node_modules/prismjs/prism.js',
        destination: 'htdocs/library/vendor/prism/prism.js',
        required: false
    },
    {
        name: 'prism-theme-tomorrow',
        description: 'Prism.js Tomorrow theme',
        source: 'node_modules/prismjs/themes/prism-tomorrow.min.css',
        destination: 'htdocs/library/vendor/prism/themes/prism-tomorrow.min.css',
        required: false
    },

    // Prism.js language components
    {
        name: 'prism-markup',
        description: 'Prism.js HTML/XML language support',
        source: 'node_modules/prismjs/components/prism-markup.min.js',
        destination: 'htdocs/library/vendor/prism/components/prism-markup.min.js',
        required: false
    },
    {
        name: 'prism-css',
        description: 'Prism.js CSS language support',
        source: 'node_modules/prismjs/components/prism-css.min.js',
        destination: 'htdocs/library/vendor/prism/components/prism-css.min.js',
        required: false
    },
    {
        name: 'prism-javascript',
        description: 'Prism.js JavaScript language support',
        source: 'node_modules/prismjs/components/prism-javascript.min.js',
        destination: 'htdocs/library/vendor/prism/components/prism-javascript.min.js',
        required: false
    },
    {
        name: 'prism-json',
        description: 'Prism.js JSON language support',
        source: 'node_modules/prismjs/components/prism-json.min.js',
        destination: 'htdocs/library/vendor/prism/components/prism-json.min.js',
        required: false
    },
    {
        name: 'prism-markdown',
        description: 'Prism.js Markdown language support',
        source: 'node_modules/prismjs/components/prism-markdown.min.js',
        destination: 'htdocs/library/vendor/prism/components/prism-markdown.min.js',
        required: false
    },
    {
        name: 'prism-python',
        description: 'Prism.js Python language support',
        source: 'node_modules/prismjs/components/prism-python.min.js',
        destination: 'htdocs/library/vendor/prism/components/prism-python.min.js',
        required: false
    },

    // Prism.js plugins
    {
        name: 'prism-line-numbers',
        description: 'Prism.js line numbers plugin',
        source: 'node_modules/prismjs/plugins/line-numbers/prism-line-numbers.min.js',
        destination: 'htdocs/library/vendor/prism/plugins/line-numbers/prism-line-numbers.min.js',
        required: false
    },
    {
        name: 'prism-line-numbers-css',
        description: 'Prism.js line numbers plugin CSS',
        source: 'node_modules/prismjs/plugins/line-numbers/prism-line-numbers.min.css',
        destination: 'htdocs/library/vendor/prism/plugins/line-numbers/prism-line-numbers.min.css',
        required: false
    },
    {
        name: 'prism-line-highlight',
        description: 'Prism.js line highlight plugin',
        source: 'node_modules/prismjs/plugins/line-highlight/prism-line-highlight.min.js',
        destination: 'htdocs/library/vendor/prism/plugins/line-highlight/prism-line-highlight.min.js',
        required: false
    },
    {
        name: 'prism-line-highlight-css',
        description: 'Prism.js line highlight plugin CSS',
        source: 'node_modules/prismjs/plugins/line-highlight/prism-line-highlight.min.css',
        destination: 'htdocs/library/vendor/prism/plugins/line-highlight/prism-line-highlight.min.css',
        required: false
    },
    {
        name: 'prism-toolbar',
        description: 'Prism.js toolbar plugin',
        source: 'node_modules/prismjs/plugins/toolbar/prism-toolbar.min.js',
        destination: 'htdocs/library/vendor/prism/plugins/toolbar/prism-toolbar.min.js',
        required: false
    },
    {
        name: 'prism-toolbar-css',
        description: 'Prism.js toolbar plugin CSS',
        source: 'node_modules/prismjs/plugins/toolbar/prism-toolbar.min.css',
        destination: 'htdocs/library/vendor/prism/plugins/toolbar/prism-toolbar.min.css',
        required: false
    },
    {
        name: 'prism-copy-to-clipboard',
        description: 'Prism.js copy to clipboard plugin',
        source: 'node_modules/prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
        destination: 'htdocs/library/vendor/prism/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
        required: false
    },
    {
        name: 'prism-show-language',
        description: 'Prism.js show language plugin',
        source: 'node_modules/prismjs/plugins/show-language/prism-show-language.min.js',
        destination: 'htdocs/library/vendor/prism/plugins/show-language/prism-show-language.min.js',
        required: false
    },
    {
        name: 'prism-command-line',
        description: 'Prism.js command line plugin',
        source: 'node_modules/prismjs/plugins/command-line/prism-command-line.min.js',
        destination: 'htdocs/library/vendor/prism/plugins/command-line/prism-command-line.min.js',
        required: false
    },
    {
        name: 'prism-command-line-css',
        description: 'Prism.js command line plugin CSS',
        source: 'node_modules/prismjs/plugins/command-line/prism-command-line.min.css',
        destination: 'htdocs/library/vendor/prism/plugins/command-line/prism-command-line.min.css',
        required: false
    }
];

/**
 * Colors for console output
 */
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Console logging utilities
 */
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get file size in a human-readable format
 */
async function getFileSize(filePath) {
    try {
        const stats = await stat(filePath);
        const bytes = stats.size;
        
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
        return 'unknown';
    }
}

/**
 * Ensure directory exists, create if it doesn't
 */
async function ensureDir(dirPath) {
    try {
        await mkdir(dirPath, { recursive: true });
        return true;
    } catch (error) {
        log.error(`Failed to create directory: ${dirPath}`);
        log.error(error.message);
        return false;
    }
}

/**
 * Copy a single vendor file
 * @returns {string} 'success', 'skipped', or 'failed'
 */
async function copyVendorFile(config) {
    const sourcePath = join(ROOT_DIR, config.source);
    const destPath = join(ROOT_DIR, config.destination);
    const destDir = dirname(destPath);

    // Check if source exists
    if (!(await fileExists(sourcePath))) {
        if (config.required) {
            log.error(`Required source file not found: ${config.source}`);
            return 'failed';
        } else {
            log.warning(`Optional source file not found: ${config.source} (skipping)`);
            return 'skipped';
        }
    }

    // Ensure destination directory exists
    if (!(await ensureDir(destDir))) {
        return 'failed';
    }

    // Copy the file
    try {
        await copyFile(sourcePath, destPath);
        const size = await getFileSize(destPath);
        log.success(`${config.name}: ${config.source} → ${config.destination} (${size})`);
        return 'success';
    } catch (error) {
        log.error(`Failed to copy ${config.name}: ${error.message}`);
        return 'failed';
    }
}

/**
 * Check current vendor directory status
 */
async function checkVendorStatus() {
    const vendorDir = join(ROOT_DIR, 'htdocs/library/vendor');
    
    log.header('📋 Current Vendor Directory Status');
    
    if (!(await fileExists(vendorDir))) {
        log.warning('Vendor directory does not exist, will be created');
        return;
    }
    
    try {
        const entries = await readdir(vendorDir, { withFileTypes: true });
        const dirs = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
        
        if (dirs.length === 0) {
            log.info('Vendor directory is empty');
        } else {
            log.info(`Existing vendor directories: ${dirs.join(', ')}`);
        }
    } catch (error) {
        log.warning(`Could not read vendor directory: ${error.message}`);
    }
}

/**
 * Main installation function
 */
async function installVendors() {
    log.header('🚀 PhantomSPA Vendor Installation');

    // Check current status
    await checkVendorStatus();

    // Process each vendor configuration
    log.header('📦 Installing Vendor Files');

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    // Group configs by dependency type for better reporting
    const requiredConfigs = VENDOR_CONFIG.filter(c => c.required);
    const optionalConfigs = VENDOR_CONFIG.filter(c => !c.required);

    // Process required dependencies first
    if (requiredConfigs.length > 0) {
        log.info(`📋 Processing required dependencies (${requiredConfigs.length}):`);
        for (const config of requiredConfigs) {
            log.info(`  Processing ${config.name} (${config.description})...`);
            const result = await copyVendorFile(config);
            if (result === 'success') {
                successCount++;
            } else if (result === 'skipped') {
                skippedCount++;
            } else {
                failureCount++;
            }
        }
    }

    // Process optional dependencies
    if (optionalConfigs.length > 0) {
        log.info(`📋 Processing optional dependencies (${optionalConfigs.length}):`);
        for (const config of optionalConfigs) {
            log.info(`  Processing ${config.name} (${config.description})...`);
            const result = await copyVendorFile(config);
            if (result === 'success') {
                successCount++;
            } else if (result === 'skipped') {
                skippedCount++;
            } else {
                failureCount++;
            }
        }
    }

    // Summary
    log.header('📊 Installation Summary');
    log.info(`Total vendors processed: ${VENDOR_CONFIG.length}`);
    log.success(`Successfully installed: ${successCount}`);

    if (skippedCount > 0) {
        log.warning(`Optional dependencies skipped: ${skippedCount}`);
        log.info('To install optional dependencies:');
        log.info('  npm install --save-optional prismjs  # For syntax highlighting');
        log.info('  npm install --save-optional dompurify  # For HTML sanitization');
    }

    if (failureCount > 0) {
        log.error(`Failed installations: ${failureCount}`);
        process.exit(1);
    } else {
        log.success('Vendor installation completed successfully! 🎉');
    }
}

/**
 * Handle script execution
 */
async function main() {
    try {
        await installVendors();
    } catch (error) {
        log.error('Vendor installation failed:');
        log.error(error.message);
        process.exit(1);
    }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { installVendors, VENDOR_CONFIG };
