const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/env', // This compiles es6, 7, 8, 9, 10 down to es5 - Supports lates javascript standard given in ecma script.
                {
                  useBuiltIns: 'usage', // alternative mode: "entry"
                  corejs: 3, // default would be 2
                  targets: '> 0.25%, not dead',
                // set your own target environment here (see Browserslist)
                },
              ],
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties', // This is for using features like class properties for the ability to directly declare properties inside the class and not the constructor. It is used by react.
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', // Adds the style to the DOM
          'css-loader', // Reads the CSS
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // Cleans the dist folder before the build
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }), // Generates HTML file along with the other files
  ],
};
