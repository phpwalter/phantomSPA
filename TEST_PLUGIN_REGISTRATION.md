# Critical Test: Are Plugins Actually Registered?

Please run this in console and share the EXACT output:

```javascript
// Test 1: Check if plugins object exists and what's in it
console.log('=== PLUGIN REGISTRATION TEST ===');
console.log('typeof Prism.plugins:', typeof window.Prism.plugins);
console.log('Prism.plugins:', window.Prism.plugins);
console.log('Object.keys(Prism.plugins):', Object.keys(window.Prism.plugins));

// Test 2: Check for specific plugins
console.log('\n=== SPECIFIC PLUGINS ===');
console.log('toolbar:', window.Prism.plugins.toolbar);
console.log('lineNumbers:', window.Prism.plugins.lineNumbers);
console.log('lineHighlight:', window.Prism.plugins.lineHighlight);
console.log('copyToClipboard:', window.Prism.plugins.copyToClipboard);

// Test 3: Check Prism hooks
console.log('\n=== PRISM HOOKS ===');
console.log('Prism.hooks:', window.Prism.hooks);
console.log('Prism.hooks.all:', window.Prism.hooks?.all);

// Test 4: Manually load toolbar plugin to see what happens
console.log('\n=== MANUAL PLUGIN LOAD TEST ===');
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/toolbar/prism-toolbar.min.js';
script.onload = () => {
    console.log('✅ Toolbar script loaded');
    console.log('After load - Prism.plugins:', window.Prism.plugins);
    console.log('After load - toolbar:', window.Prism.plugins.toolbar);
};
script.onerror = (e) => {
    console.error('❌ Failed to load toolbar:', e);
};
document.head.appendChild(script);
```

**IMPORTANT**: Look at the console output and tell me:

1. What does `Prism.plugins:` show? (An object `{}` or something else?)
2. What does `Object.keys(Prism.plugins):` show? (An array like `[]` or `['toolbar', ...]`?)
3. After the manual load test, does it show `toolbar:` with an object?

This will tell us if plugins are registering themselves or not.

