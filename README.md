# unibundle
simple universal application bundler

## features
1. hmr server & client bundles
2. live-reload browser
2. minimal config
3. byo directory structure
4. stardard js linting
5. postcss

## install
```bash
npm i unibundle --save-dev
```

# usage
`unibundle` consists of two commands, a config file, and a tiny snippet of server
code

## dev
```
unibundle
```
- watch + compile + HMR server & client bundles
- watch + compile + HMR css, if provided

## production
```
unibundle -p
```
- compile + minify server & client bundles
- compile + minify css, if provided

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
the `server.js` file in this example should export a function with the signature
`(request, response) => {}` *a la* `connect`-based libraries
```javascript
// server.js
import connect from 'connect'
import router from 'router'

const app = connect()
const routes = router()

routes.get('*', (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/plain'
  })
  response.write('tacos')
  response.end()
})

app.use(routes)

export default app
```

## client set-up
in your client be sure to add the usual, or similar:
```javascript
if (module.hot) module.hot.accept()
```

## client bundle
`unibundle` serves the client bundle at `http://localhost:8080/index.js`, so be
sure to link to that during dev. For production, point it to your configured
public path.

## babel
include a `.babelrc` in your root and install presets/plugins to your project

## css
if you opt to use the built in postcss compilation, you'll need to add a
  `postcss.config.js` to the root of your project, and import your stylesheet
  into your client bundle, as per usual

## run your dev server
you still need to run your server during dev:
```bash
node dist/server.js # or wherever
```
