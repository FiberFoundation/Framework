import * as _ from 'lodash';

/**
 * Fiber Log.
 * @class
 **/
export default class Log {

  /**
   * Supported Console API Methods.
   * @type {Object}
   * @static
   */
  static ConsoleApi = {
    log: 'log',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: ['debug', 'log'],
    dir: 'dir',
    time: 'time',
    timeEnd: 'timeEnd',
    trace: 'trace',
    assert: 'assert'
  };

  /**
   * String representing who is logging the messages.
   * @type {string}
   */
  as = '[Fiber.Log]';

  /**
   * Current log level.
   * @type {string}
   * @private
   */
  level = 'info';

  /**
   * Available log levels.
   * @type {Object}
   */
  levels = {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
  };

  /**
   * Templates storage.
   * @type {Object}
   */
  templates = {
    timestamp: '<%= timestamp %>',
    as: '<%= as %>:',
    level: '`<%= level %>`',
    delimiter: '>>',
    msg: '<%= msg %>'
  };

  /**
   * Constructs Log.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this._timers = [];
    this._cachedApi = {};
    _.extend(this, options);
    this._cacheConsoleApi();
    this._handleTemplatesExtend(options);
  }

  /**
   * Logs using current level.
   * @param {...any} args
   * @returns {any|Log}
   */
  log(...args) {
    return this.write(this.level, args);
  }

  /**
   * Logs using `trace` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  trace(...args) {
    return this.write('trace', args);
  }

  /**
   * Logs using `debug` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  debug(...args) {
    return this.write('debug', args);
  }

  /**
   * Logs using `info` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  info(...args) {
    return this.write('info', args);
  }

  /**
   * Logs using `warn` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  warn(...args) {
    return this.write('warn', args);
  }

  /**
   * Logs using `error` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  error(...args) {
    return this.write('error', args);
  }

  /**
   * Writes using `writer` function.
   * @param {string} level
   * @param {Array|Arguments} args
   * @return {Log}
   */
  write(level, args) {
    level = _.includes(Log.ConsoleApi, level) ? level : 'log';
    if (! this.isAllowedLevel(level)) return this;
    return this.callWriter(level, args);
  }

  /**
   * Logs using current level.
   * @param {...any} args
   * @returns {any|Log}
   */
  static log(...args) {
    return Internal.write(Internal.level, args);
  }

  /**
   * Logs using `trace` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  static trace(...args) {
    return Internal.write('trace', args);
  }

  /**
   * Logs using `debug` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  static debug(...args) {
    return Internal.write('debug', args);
  }

  /**
   * Logs using `info` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  static info(...args) {
    return Internal.write('info', args);
  }

  /**
   * Logs using `warn` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  static warn(...args) {
    return Internal.write('warn', args);
  }

  /**
   * Logs using `error` level.
   * @param {...any} args
   * @returns {any|Log}
   */
  static error(...args) {
    return Internal.write('error', args);
  }

  /**
   * Writes using `writer` function.
   * @param {string} level
   * @param {Array|Arguments} args
   * @returns {Log}
   * @static
   */
  static write(level, args) {
    return Internal.write(level, args);
  }

  /**
   * Starts/Stops timer by `name`.
   * @param {string} name
   * @returns {Log}
   */
  timer(name) {
    let index = this._timers.indexOf(name), method = ~ index ? 'timeEnd' : 'time';
    if (! (~ index)) this._timers.push(name);
    else this._timers.splice(index, 1);
    return this.callWriter(method, [name]);
  }

  /**
   * Calls writer function with the given level and arguments.
   * @param {string} method
   * @param {Array} args - will be passed to writer function
   * @return {Log}
   */
  callWriter(method, args) {
    method = _.includes(Log.ConsoleApi, method) ? method : 'log';
    if (! _.isFunction(this._cachedApi[method])) return this;
    let msg = _.first(args), details = this.renderTemplate({msg: _.isString(msg) ? msg : '', level: method});
    this._cachedApi[method].apply(null, [details].concat(_.drop(args)));
    return this;
  }

  /**
   * Renders template with `data`.
   * @param {Object} [data={}]
   * @returns {string}
   */
  renderTemplate(data) {
    return _.template(this.getTemplate())(this.getTemplateData(data));
  }

  /**
   * Returns joined template.
   * @param {string} [glue]
   * @returns {string}
   */
  getTemplate(glue) {
    return _.compact(_.map(_.result(this, 'templates'), function(part) {
      if (_.isString(part) || _.isFunction(part)) return part;
    })).join(glue || ' ');
  }

  /**
   * Returns template data.
   * @param {Object} [data={}]
   * @returns {Object}
   */
  getTemplateData(data = {}) {
    let date = new Date();
    return _.extend({
      self: this,
      level: this.level,
      as: this.as,
      timestamp: date.toTimeString().slice(0, 8) + '.' + date.getMilliseconds()
    }, data);
  }

  /**
   * Determines if it's allowed to write with the given `level`.
   * @param {string} level
   * @returns {boolean}
   */
  isAllowedLevel(level) {
    if (! level || ! this.levels[level]) return false;
    let levels = _.values(this.levels)
      , index = levels.indexOf(level);
    if (index === - 1) return false;
    let currentLevelIndex = levels.indexOf(this.level);
    return index >= currentLevelIndex;
  }

  /**
   * Caches Console Log.ConsoleApi.
   * @returns {Log._cachedApi|{}}
   * @private
   */
  _cacheConsoleApi() {
    for (let method in Log.ConsoleApi) {
      let apiMethod = Log.ConsoleApi[method];
      let isArr = _.isArray(apiMethod);

      if (isArr && _.has(console, apiMethod[0])) apiMethod = apiMethod[0];
      else if (isArr) apiMethod = apiMethod[1];
      else if (! _.has(console, apiMethod)) continue;

      this._cachedApi[apiMethod] = _.bind(console[apiMethod], console);
    }
    return this._cachedApi;
  }

  /**
   * Handles templates extend from options.
   * @param {Object} options
   * @returns {Log}
   * @private
   */
  _handleTemplatesExtend(options) {
    if (! options || ! options.templates) return this;
    _.extend(this.templates, options.templates);
    delete options.templates;
    return this;
  }
}

/**
 * Log used internally for static conversion.
 * @type {Log}
 */
const Internal = new Log();
