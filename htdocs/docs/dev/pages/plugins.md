# Plugins

Extend MarkdownSPA with custom plugins.

```js
class MyPlugin {
  install(app) {
    app.on('ready', () => {
      console.log('App is ready!');
    });
  }
}

app.use(new MyPlugin());
