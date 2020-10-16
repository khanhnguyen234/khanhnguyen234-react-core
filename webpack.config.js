const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const packageName = require('./package.json').name;

const env = dotenv.config().parsed;
const envKeys = Object.keys(env || {}).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

function packageToLibrary(str) {
  str = str.replace('/', '-micro-');
  return str.replace(/[^a-zA-Z0-9]/g, '');
}

const exposes = fs
  .readdirSync('./src/components/')
  .reduce(function (exposes, module) {
    exposes[`./${module}`] = `./src/components/${module}`;
    return exposes;
  }, {});

module.exports = {
  entry: './index.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    publicPath: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${process.env.S3_BUCKET_KEY}/`,
  },
  module: {
    rules: [
      {
        test: /bootstrap\.tsx$/,
        loader: 'bundle-loader',
        options: {
          lazy: true,
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
        },
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[local]_[hash:base64:5]',
              },
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devtool: 'inline-source-map',
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: null,
      exclude: [/node_modules/],
      test: /\.ts($|\?)/i,
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed),
    }),
    new CleanWebpackPlugin(),
    new ModuleFederationPlugin({
      name: packageName,
      library: { type: 'var', name: packageToLibrary(packageName) },
      filename: 'remoteEntry.js',
      exposes: exposes,
      shared: ['react', 'react-dom'],
    }),
  ],
  devServer: {
    historyApiFallback: true,
  },
};
