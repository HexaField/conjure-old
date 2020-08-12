const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src/index'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: ''
    },
    module: {
      rules: [{
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: ['babel-loader']
      }]
    },
    devServer: {
      contentBase:  path.resolve(__dirname, 'dist'),  
      port: 3000,
      watchContentBase: true,
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
    ],
    node: {
      fs: 'empty'
    }
};