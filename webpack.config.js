var webpack = require('webpack')
  , path = require('path')
  , args = require('yargs')

  // Webpack plugins
  , UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
  , CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

  // Build vars
  , env = args.argv.mode || 'build'
  , chunkVendor = true
  , libraryName = 'Fiber'
  , isProd = env === 'build'
  , extension = isProd ? '.min.js' : '.js'
  , outputPath = __dirname + (env === 'test' ? '/tests/manual/dist' : '/dist')
  , plugins = [];

// Log current build environment.
console.log('Current build Environment: ' + env + '\n');

// Add `Production` plugins
if (env === 'build') {
  plugins.push(new UglifyJsPlugin({minimize: true}));
}

// Will chunk Framework and vendor into two separate files.
if (chunkVendor) {
  plugins.push(new CommonsChunkPlugin('vendor', libraryName.toLowerCase() + '.bundle.js'));
}

/**
 * Webpack Configuration
 * @type {Object}
 */
var config = {
  // Source map to use
  devtool: 'source-map',
  // Bundles entry file
  entry: {
    app: __dirname + '/src/Framework.js',
    vendor: ['lodash', 'superagent', 'ractive']
  },
  // Output configuration
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    path: outputPath,
    filename: libraryName.toLowerCase() + extension,
    umdNamedDefine: true
  },
  // Resolve options
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  // Modules
  module: {
    loaders: [
      // ES6 support
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel',
        exclude: /(node_modules)/
      },
      // Code linting
      {
        test: /(\.jsx|\.js)$/,
        loader: 'jscs-loader',
        exclude: /node_modules/
      }
    ]
  },
  // Plugins
  plugins: plugins
};

module.exports = config;
