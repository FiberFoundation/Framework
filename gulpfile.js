var gulp = require('gulp')
  , _ = require('lodash')
  , shell = require('shelljs')
  , webpack = require('webpack')
  , WebpackDevServer = require("webpack-dev-server")
  , testDir = '/tests/manual'
  , webpackConfig = require('./webpack.config.js');

var compiler = new webpack(_.merge(webpackConfig, {
  output: {path: testDir + '/dist'},
  entry: {app: ["webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server"]}
}));

var server = new WebpackDevServer(compiler, {
  // webpack-dev-server options
  contentBase: "." + testDir,
  // or: contentBase: "http://localhost/",
  hot: true,
  // Enable special support for Hot Module Replacement
  // Page is no longer updated, but a "webpackHotUpdate" message is send to the content
  // Use "webpack/hot/dev-server" as additional module in your entry point
  // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does.

  // Set this as true if you want to access dev server from arbitrary url.
  // This is handy if you are using a html5 router.
  historyApiFallback: false,
  // Set this if you want to enable gzip compression for assets
  compress: true,
  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  lazy: true,
  filename: "bundle.js",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  stats: { colors: true }
});

gulp.task('default', ['rebuild', 'watch'], function() {
  server.listen(8080, "localhost", function() {});
});

gulp.task('watch', function() {
  gulp.watch(['tests/manual/index.js', 'tests/src/**/*.js', 'src/**/*.js'], ['rebuild']);
});

gulp.task('rebuild', function() {
  shell.exec('npm run build:test');
});
