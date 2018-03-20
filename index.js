#! /usr/bin/env node
'use strict'

const pkg = require('./package.json')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const devServer = require('webpack-dev-server')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const gzip = require('gzip-size')
const loading = require('loading-indicator')

const { _: args } = require('minimist')(process.argv.slice(2))
const userConfig = require('./lib/userConfig.js')

const clientConfig = require('./config/client.js')(args[0])
const serverConfig = require('./config/server.js')(args[0])
const clientCompiler = webpack(clientConfig)
const serverCompiler = webpack(serverConfig)

let loader = null
let clientComplete = false
let serverComplete = false

if (args[0]) {
  console.log(chalk.green(`unibundle`), chalk.gray('production'))

  loader = loading.start()

  fs.emptyDir(path.resolve(process.cwd(), userConfig.buildDir), () => {
    clientCompiler.run((err, stats) => done('client', err, stats, true)),
    serverCompiler.run((err, stats) => done('server', err, stats, true))
  })
} else {
  console.log(chalk.green(`unibundle`), chalk.gray('development'))

  clientCompiler.hooks.done.tap({ name: 'unibundle stats' }, stats => {
    done('client', null, stats)
  })

  userConfig.css && fs.remove(path.resolve(userConfig.publicDir, userConfig.css.output.filename))
  fs.remove(path.resolve(userConfig.publicDir, userConfig.client.output.filename))

  const server = new devServer(clientCompiler, {
    // hot: true, // breaks, never gets update
    publicPath: '/',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    noInfo: true,
    clientLogLevel: 'none',
    quiet: true
  })

  server.listen(8080, 'localhost', e => {
    console.log(
      chalk.green(`unibundle`),
      chalk.gray('client bundle served at'),
      `localhost:8080/${userConfig.client.output.filename}`
    )
  })

  ;['SIGINT', 'SIGTERM'].forEach(function(sig) {
    process.on(sig, function() {
      server.close()
      process.exit()
    })
  })

  serverCompiler.watch(
    { quiet: true },
    (err, stats) => done('server', err, stats)
  )
}

function done (which, err, stats, production) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const msgs = stats.toJson({}, true)

  if (msgs.errors.length) {
    console.log(chalk.red('\t', 'errors'))
    console.log()

    msgs.errors.map(e => {
      console.log('\t', e.message || e)
      console.log()
    })
  }

  if (msgs.warnings.length) {
    console.log(chalk.yellow('\t', 'warnings'))
    console.log()

    msgs.warnings.map(e => {
      console.log('\t', e.message || e)
      console.log()
    })
  }

  loading.stop(loader)

  if (msgs.errors.length || msgs.warnings.length) return

  let size = (msgs.assets[0].size / 1024).toFixed(2) + ' kb'

  if (production && which === 'client') {
    const file = fs.readFileSync(
      path.resolve(userConfig.publicDir, userConfig.client.output.filename)
    ).toString('utf8')
    size = (gzip.sync(file) / 1024).toFixed(2) + ' kb gzipped'
  } else if (production) {
    size += ' minified'
  }

  console.log(
    chalk.green(`unibundle`),
    chalk.gray(which),
    size
  )

  if (which === 'client') {
    clientComplete = true
  } else if (which === 'server') {
    serverComplete = true
  }

  if (production && clientComplete && serverComplete) copy()
}

function copy () {
  fs.copy(userConfig.publicDir, path.join(userConfig.buildDir, userConfig.publicDir), () => {
    console.log(
      chalk.green(`unibundle`),
      chalk.gray('copy'),
      `copied compiled files to /${userConfig.buildDir}`
    )
  })
}
