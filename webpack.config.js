// webpack.config.js
const webpack = require('webpack')
const path = require('path')

const config = {
  context: path.resolve(__dirname, 'src'),
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: "dist"
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['es2015', { modules: false }]
          ]
        }
      }]
    },
    {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
        ]
    },
    {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'url-loader?limit=10000&name=/fonts/[hash].[ext]'
    },
    {
    test: /\.(png|jpg)$/,
    use: [{
      loader: 'url-loader?limit=10000&name=/img/[hash].[ext]'
    }]
    }
    ]
  }
}

module.exports = config