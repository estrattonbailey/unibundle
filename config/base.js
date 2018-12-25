const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const userBabelConfig = fs.existsSync(path.resolve(process.cwd(), '.babelrc'))

module.exports = function base (production, server, userConfig) {
  return {
    rules: [
      userConfig.lint !== false && {
        enforce: 'pre',
        test: /\.js?$/,
        loader: require.resolve('standard-loader'),
        exclude: /node_modules/,
        options: {
          parser: 'babel-eslint'
        }
      },
      Object.assign(
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader')
        },
        userBabelConfig ? {} : {
          options: {
            babelrc: false,
            plugins: [
              require.resolve('babel-plugin-lodash'),
              require.resolve('@babel/plugin-syntax-object-rest-spread'),
              require.resolve('@babel/plugin-proposal-class-properties')
            ],
            presets: [
              [require.resolve('@babel/preset-env'), server ? {
                targets: {
                  node: 'current'
                }
              } : {
                targets: {
                  ie: '11'
                }
              }],
              require.resolve('@babel/preset-react')
            ]
          }
        }
      )
    ].filter(Boolean),
    alias: {},
    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    ]
  }
}
