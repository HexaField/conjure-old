const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    entry: [
      path.resolve(__dirname, 'src/index.js'),
      'webpack-dev-server/client?http://localhost:3000',
    ],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    module: {
      rules: [{
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: ['babel-loader']
      }]
    },
    devServer: {
      contentBase: 'dist',
      port: 3000,
      open: true,
      stats: "errors-only",
      // overlay: true,
      historyApiFallback: true,
      proxy: {
        '/*': {
          target: 'http://localhost:3000',
        },
      },
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html" //source html
      }),
      new CopyPlugin({
        patterns: [
          { from: 'public', to: '' },
        ],
      }),
      new webpack.WatchIgnorePlugin([
        path.join(__dirname, "node_modules")
      ]),
    ],
    node: {
      fs: 'empty'
    }
};