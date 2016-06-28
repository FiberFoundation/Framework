let webpack = require('webpack');
let path = require('path');
let args = require('yargs');
let packageJson = require('./package.json');

  // Webpack plugins
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

  // Build vars
let env = args.argv.mode || 'build';
let libraryName = 'Fiber';
let isProd = env === 'prod-build';
let extension = isProd ? '.min.js' : '.js';
let outputPath = __dirname + '/dist';

// Will chunk Framework and vendor into two separate files.
let plugins = [
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
