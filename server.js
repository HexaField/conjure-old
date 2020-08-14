'use strict'

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const config = require('./webpack.config')

const wds = new WebpackDevServer(webpack(config), {
  hot: true,
  historyApiFallback: true,
  open: true,
  stats: "errors-only",
  overlay: true,
//   historyApiFallback: true,
//   proxy: {
//     '/*': {
//       target: 'http://localhost:3000',
//     },
//   },
//   watchOptions: {
//     aggregateTimeout: 300,
//     poll: 1000,
//   },
})

wds.listen(3000, 'localhost', (err) => {
  if (err) {
    throw err
  }

  console.log('Listening at localhost:3000')
})