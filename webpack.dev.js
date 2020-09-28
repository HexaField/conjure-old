const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack')
module.exports = {
    externals: ['fs-extra', 'fs'],
    entry: {
      index: './src/index.js',
      worker: './src/worker.js',
      app: './src/conjure/index.js',
    },
    output: {
      filename: '[name].js',	
      pathinfo: false,	
      globalObject: "self"
    },
    module: {
      rules: [{
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules)/,
        use: ['babel-loader'],
      }]  
    },
    devtool: 'inline-source-map',
    devServer: {
      port: 3000,
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          default:false
        }
      },
      runtimeChunk: false
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
      }),
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: 'public', to: '' },
        ],
      }),
    ],
    node: {
      module: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'mock',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
};