import BaseObject from '../Foundation/Object';
import * as _ from 'lodash';

/**
 * Default Log configuration.
 * @type {Object}
 * @mixin
 */
export let LogConfig = {

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
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  dir: 'dir',
  table: 'table',
  clear: 'clear',
  count: 'count',
  assert: 'assert',
  group: 'group',
  groupEnd: 'groupEnd',
  groupCollapsed: 'groupCollapsed',
  time: 'time',
  timeEnd: 'timeEnd',
  profile: 'profile',
  profileEnd: 'profileEnd'
};

/**
 * Fiber Log.
 * @class
 * @extends {BaseObject}
 * @mixes LogConfig
 **/
export default class Log extends BaseObject {

  /**
   * Constructs Log.
   * @param {Object} [options]
   */
  constructor(options) {
    super(options);
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
  log() {
    return this.write.apply(this, [this.level].concat([...arguments]));
  }

  /**
   * Logs using `trace` level.
   * @param {...args}
   * @returns {*|Log}
   */
  trace() {
    return this.write.apply(this, ['trace'].concat([...arguments]));
  }

  /**
   * Logs using `debug` level.
   * @param {...args}
   * @returns {*|Log}
   */
  debug() {
    return this.write.apply(this, ['debug'].concat([...arguments]));
  }

  /**
   * Logs using `info` level.
   * @param {...args}
   * @returns {*|Log}
   */
  info() {
    return this.write.apply(this, ['info'].concat([...arguments]));
  }

  /**
   * Logs using `warn` level.
   * @param {...args}
   * @returns {*|Log}
   */
  warn() {
    return this.write.apply(this, ['warn'].concat([...arguments]));
  }

  /**
   * Logs using `error` level.
   * @param {...args}
   * @returns {*|Log}
   */
  error() {
    return this.write.apply(this, ['error'].concat([...arguments]));
  }

  /**
   * Writes using `writer` function.
   * @param {string} level
   * @param {...args}
   * @return {Log}
   */
  write(level) {
    level = _.includes(_api, level) ? level : 'log';
    if (! this.isAllowedLevel(level)) return this;
    return this.callWriter(level, _.drop([...arguments]));
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
    var msg = _.first(args), details = this.renderTemplate({msg: _.isString(msg) ? msg : ''});
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
    var date = new Date();
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
    var index = this._timers.indexOf(name), method = ~ index ? 'timeEnd' : 'time';
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
    var levels = _.values(this.levels)
      , index = levels.indexOf(level);
    if (index === - 1) return false;
    var currentLevelIndex = levels.indexOf(this.level);
    return index >= currentLevelIndex;
  }

  /**
   * Caches Console Api.
   * @returns {Log._cachedApi|{}}
   * @private
   */
  _cacheConsoleApi() {
    for (var method in _api)
      this._cachedApi[_api[method]] = _.bind(console[_api[method]], console);
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
