import Class from '../Foundation/Class';
import * as _ from 'lodash';

/**
 * Default Log configuration.
 * @type {Object}
 * @mixin
 */
export const LogConfig = {

  /**
   * Current log level.
   * @type {string}
   * @private
   */
  level: 'trace',

  /**
   * Available log levels.
   * @type {Object}
   */
  levels: {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error'
  },

  /**
   * String representing who is logging the messages.
   * @type {string}
   */
  as: '[Fiber.Log]',

  /**
   * Templates storage.
   * @type {Object}
   */
  templates: {
    timestamp: '<%= timestamp %>',
    as: '<%= as %>',
    level: '<%= level %>',
    delimiter: '>>',
    msg: '<%= msg %>'
  }
};

/**
 * Supported Console API Methods
 * @type {Object}
 * @private
 */
const _api = {
  log: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
  debug: 'info',
  dir: 'dir',
  time: 'time',
  timeEnd: 'timeEnd',
  trace: 'trace',
  assert: 'assert',
};

/**
 * Fiber Log.
 * @class
 * @mixes LogConfig
 **/
export default class Log {

  /**
   * Constructs Log.
   * @param {Object} [options]
   */
  constructor(options) {
    this._timers = [];
    this._cachedApi = {};
    _.extend(this, LogConfig, options);
    this._cacheConsoleApi();
    this._handleTemplatesExtend(options);
  }

  /**
   * Logs using current level.
   * @param {...args}
   * @returns {*|Log}
   */
  log(...args) {
    return this.write.apply(GlobalLog, [this.level].concat(...args));
  }

  /**
   * Logs using `trace` level.
   * @param {...args}
   * @returns {*|Log}
   */
  trace(...args) {
    return this.write.apply(this, ['trace'].concat(...args));
  }

  /**
   * Logs using `debug` level.
   * @param {...args}
   * @returns {*|Log}
   */
  debug(...args) {
    return this.write.apply(this, ['debug'].concat(...args));
  }

  /**
   * Logs using `info` level.
   * @param {...args}
   * @returns {*|Log}
   */
  info(...args) {
    return this.write.apply(this, ['info'].concat(...args));
  }

  /**
   * Logs using `warn` level.
   * @param {...args}
   * @returns {*|Log}
   */
  warn(...args) {
    return this.write.apply(this, ['warn'].concat(...args));
  }

  /**
   * Logs using `error` level.
   * @param {...args}
   * @returns {*|Log}
   */
  error(...args) {
    return this.write.apply(this, ['error'].concat(...args));
  }

  /**
   * Writes using `writer` function.
   * @param {string} level
   * @param {Array|Arguments} args
   * @return {Log}
   */
  write(level, args) {
    level = _.includes(_api, level) ? level : 'log';
    if (! this.isAllowedLevel(level)) return this;
    return this.callWriter(level, args);
  }

  /**
   * Logs using current level.
   * @param {...args}
   * @returns {*|Log}
   */
  static log(...args) {
    return GlobalLog.write.apply(GlobalLog, [GlobalLog.level].concat(...args));
  }

  /**
   * Logs using `trace` level.
   * @param {...args}
   * @returns {*|Log}
   */
  static trace(...args) {
    return GlobalLog.write.apply(GlobalLog, ['trace'].concat(...args));
  }

  /**
   * Logs using `debug` level.
   * @param {...args}
   * @returns {*|Log}
   */
  static debug(...args) {
    return GlobalLog.write.apply(GlobalLog, ['debug'].concat(...args));
  }

  /**
   * Logs using `info` level.
   * @param {...args}
   * @returns {*|Log}
   */
  static info(...args) {
    return GlobalLog.write.apply(GlobalLog, ['info'].concat(...args));
  }

  /**
   * Logs using `warn` level.
   * @param {...args}
   * @returns {*|Log}
   */
  static warn(...args) {
    return GlobalLog.write.apply(GlobalLog, ['warn'].concat(...args));
  }

  /**
   * Logs using `error` level.
   * @param {...args}
   * @returns {*|Log}
   */
  static error(...args) {
    return GlobalLog.write.apply(GlobalLog, ['error'].concat(...args));
  }

  /**
   * Writes using `writer` function.
   * @param {string} level
   * @param {Array|Arguments} args
   * @returns {Log}
   * @static
   */
  static write(level, args) {
    return GlobalLog.write(level, args);
  }

  /**
   * Calls writer function with the given level and arguments.
   * @param {string} method
   * @param {Array} arguments - will be passed to writer function
   * @return {Log}
   */
  callWriter(method, args) {
    method = _.includes(_api, level) ? level : 'log';
    if (! _.isFunction(this._cachedApi[method])) return this;
    let msg = _.first(args), details = this.renderTemplate({msg: _.isString(msg) ? msg : ''});
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
    return _.compact(_.map(_.result(this.templates), function(part) {
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
   * Logs `message` with a given `level` and `args` and returns `returnValue`.
   * @param {string} level
   * @param {string} message
   * @param {Array|Arguments|*} args
   * @param {*} returnVal
   * @param {boolean} [tryToCall=true]
   * @returns {*}
   */
  returns(level, message, args, returnVal, tryToCall = true) {
    this.callWriter(level, [message, args]);
    return tryToCall ? _.result(returnVal) : returnVal;
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
   * Caches Console Api.
   * @returns {Log._cachedApi|{}}
   * @private
   */
  _cacheConsoleApi() {
    for (let method in _api) {
      this._cachedApi[_api[method]] = _.bind(console[_api[method]], console);
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
 * Global Logger.
 * @type {Log}
 */
export const GlobalLog = new Log();
