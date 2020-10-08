const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    externals: ['fs-extra', 'fs', '@grpc/grpc-js'],
    entry: './src/conjure/index.js',
    target: "web",
    output: {
      path: path.resolve('dist'),
      filename: 'bundle.js',
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
      open: true,
      port: 3000,
    },
    plugins: [
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
      child_process: 'empty'
    },
};