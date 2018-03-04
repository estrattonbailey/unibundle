# fab
simple universal application bundler for `connect`-based servers

## features
1. hmr server & client bundles
2. minimal config
3. byo directory structure
4. stardard js linting
5. compiles css w/ postcss

## install
```bash
npm i fabjs --save-dev
```

# usage
```
fab
```
- watch + compile + HMR server & client bundles
- watch + compile + HMR css, if provided

```
fab -p
```
- compile + minify server & client bundles
- compile + minify css, if provided
## server set-up
your server should use the following as an entry point, just copy and paste:
```javascript
const http = require('http')
let app = require('./server.js').default // YOUR APP
const server = http.createServer((req, res) => app(req, res))
const PORT = process.env.PORT || 3000

server.listen(PORT, e => {
  if (e) console.error(e)
  console.log(`node server listening at port ${PORT}`)
})

if (module.hot) {
  module.hot.accept('./server.js', () => {
    app = require('./server.js').default
  })
}
```
## client set-up
in your client be sure to add the following, or similar:
```javascript
if (module.hot) module.hot.accept()
```
## config
```javascript
module.exports = production => ({
  css: {
    output: {
      filename: 'style.css',
      path: 'public'
    }
  },
  client: {
    entry: 'app/index.js',
    output: {
      path: 'public',
      filename: 'index.js',
    },
    rules: [],
    alias: {},
    plugins: []
  },
  server: {
    entry: 'server/index.js',
    output: {
      path: 'dist',
      filename: 'server.js',
    },
    rules: [],
    alias: {},
    plugins: []
  }
})
```
## running your server
you still need to run your server:
```bash
node dist/server.js # or wherever
```
