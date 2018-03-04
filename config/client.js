const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const base = require('./base.js')
const config = require('../lib/userConfig.js')

module.exports = function server (production) {
  const { css, client } = config

  return {
    mode: production ? 'production' : 'development',
    target: 'web',
    devtool: 'cheap-module-source-map',
    entry: [].concat(client.entry).map(e => {
      return path.resolve(process.cwd(), e)
    }).concat([
      !production && require.resolve('webpack-dev-server/client') + '?http://localhost:8080',
      !production && require.resolve('webpack/hot/dev-server')
    ].filter(Boolean)),
    output: {
      path: path.resolve(process.cwd(), client.output.path),
      filename: client.output.filename,
      // publicPath: production ? '/' : 'http://localhost:8080'
    },
    module: {
      rules: base.rules.concat(
        [
          css && {
            test: /\.css$/,
            exclude: /node_modules/,
            use: production ? ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  'css-loader',
                  'postcss-loader'
                ]
            }) : [
              'style-loader',
              'css-loader',
              'postcss-loader'
            ]
          }
        ].filter(Boolean),
        client.rules || []
      )
    },
    resolve: {
      alias: Object.assign(base.alias, client.alias)
    },
    plugins: [].concat(base.plugins, [
      !production && new webpack.HotModuleReplacementPlugin(),
      (production && css) && new ExtractTextPlugin(css.output.filename),
    ]).filter(Boolean).concat(client.plugins || [])
  }
}
