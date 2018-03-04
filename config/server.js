const path = require('path')
const webpack = require('webpack')
const externals = require('webpack-node-externals')
const base = require('./base.js')
const config = require('../lib/userConfig.js')

module.exports = function server (production) {
  const { server } = config

  return {
    mode: production ? 'production' : 'development',
    target: 'node',
    devtool: 'cheap-source-map',
    externals: externals({
      whitelist: [
        !production && 'webpack/hot/poll?300'
      ].filter(Boolean)
    }),
    node: { console: true, __filename: true, __dirname: true },
    entry: [].concat(server.entry).map(e => {
      return path.resolve(process.cwd(), e)
    }).concat([
      !production && 'webpack/hot/poll?300'
    ]).filter(Boolean),
    output: {
      path: path.resolve(process.cwd(), server.output.path),
      filename: server.output.filename
    },
    module: {
      rules: base.rules.concat(server.rules || [])
    },
    resolve: {
      alias: Object.assign(base.alias, server.alias)
    },
    plugins: [
      !production && new webpack.HotModuleReplacementPlugin({ quiet: true })
    ].filter(Boolean).concat(base.plugins, server.plugins || [])
  }
}
