const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {SuperMinifyPlugin} = require("./webpack-super-minify-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new SuperMinifyPlugin(),
    new CopyPlugin({
      patterns: [
        {
          context: './static-assets',
          from: '*',
          to: './',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /.spec.ts/],
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
