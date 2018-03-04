const path = require('path')
const webpack = require('webpack')

module.exports = {
  rules: [
    {
      enforce: 'pre',
      test: /\.js?$/,
      loader: 'standard-loader',
      exclude: /node_modules/,
      options: {
        parser: 'babel-eslint'
      }
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loaders: ['babel-loader']
    }
  ],
  alias: {},
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
  ]
}
