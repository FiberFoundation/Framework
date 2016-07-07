var webpack = require('webpack');
var path = require('path');
var args = require('yargs');
var packageJson = require('./package.json');

  // Webpack plugins
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

  // Build vars
var env = args.argv.mode || 'build';
var libraryName = 'Fiber';
var isProd = env === 'prod-build';
var extension = isProd ? '.min.js' : '.js';
var outputPath = __dirname + '/dist';

// Will chunk Framework and vendor into two separate files.
var plugins = [
  new CommonsChunkPlugin('vendor', 'fiber.vendor.js', Infinity)
];

// Log current build environment.
console.log('Current build Environment: ' + env + '\n');

// Add `Production` plugins
if (isProd) {
  plugins.push(new UglifyJsPlugin({minimize: true}));
}

/**
 * Webpack Configuration
 * @type {Object}
 */
module.exports = {
  // Source map to use
//   devtool: 'source-map',
  // Bundles entry file
  cache: false,
  entry: {
    fiber: path.join(__dirname, '/src/Framework.js'),
    vendor: Object.keys(packageJson.dependencies)
  },
  // Output configuration
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    path: outputPath,
    publicPath: "/bundle/",
    filename: '[name]' + extension,
//    filename: libraryNameLower + extension,
    umdNamedDefine: true
  },
  // Resolve options
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  // Plugins
  plugins: plugins,
  // Modules
  module: {
    loaders: [
      // Code linting
//       {
//         test: /(\.js)$/,
//         loader: 'jscs-loader',
//         exclude: /node_modules/
//       },
      // ES6 support
      {
        test: /(\.js)$/,
        loader: 'babel',
        exclude: /(node_modules)/
      }
    ]
  }
};
