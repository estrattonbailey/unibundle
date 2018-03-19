const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const base = require('./base.js')
const config = require('../lib/userConfig.js')

const userPostcssConfig = fs.existsSync(path.resolve(process.cwd(), 'postcss.config.js'))

module.exports = function server (production) {
  const { css, client, publicDir } = config

  const postcssLoader = userPostcssConfig ? 'postcss-loader' : {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      plugins: [
        require('postcss-import'),
        require('postcss-nested'),
        require('postcss-cssnext')({
          warnForDuplicates: false
        }),
        require('postcss-calc'),
        require('postcss-discard-comments'),
        production && require('cssnano')
      ].filter(Boolean)
    }
  }

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
      path: path.resolve(process.cwd(), publicDir),
      filename: client.output.filename,
    },
    module: {
      rules: base.rules.concat(
        [
          css && {
            test: /\.css$/,
            exclude: /node_modules/,
            use: production ? ExtractTextPlugin.extract({
                fallback: require.resolve('style-loader'),
                use: [
                  require.resolve('css-loader'),
                  postcssLoader
                ]
            }) : [
              require.resolve('style-loader'),
              require.resolve('css-loader'),
              postcssLoader
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
