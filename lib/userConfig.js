const path = require('path')
const args = require('minimist')(process.argv.slice(2))

module.exports = require(path.resolve(process.cwd(), 'unibundle.config.js'))(args.p)
