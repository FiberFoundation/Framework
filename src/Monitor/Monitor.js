import BaseObject from '../Foundation/Class';
import Events from '../Events/Events';
import Log from '../Logger/Log';
import * as _ from 'lodash';

/**
 * Default Monitor Options.
 * @type {Object}
 * @mixin
 */
export let MonitorOptions = {
  /**
   * Notify options
   * @type {Object}
   */
  notifies: {
    stackTrace: true,
  },

  /**
   * Symbols
   * @type {Object}
   */
  symbols: {
    method: '#',
    event: '@'
  },

  /**
   * Template to use to notify
   * @type {string}
   */
  template: '>> <%= symbol %> <%= type %> `<%= param %>` was <%= action %> with arguments:',

  /**
   * Events monitor
   * @type {Fiber.Events}
   * @private
   */
  _monitor: null,

  /**
   * Cache object
   * @type {Array}
   * @private
   */
  _cache: [],

  /**
   * Logger instance
   * @type {Object.<Fiber.Log>}
   * @private
   */
  _logger: null,

  /**
   * Log templates
   * @type {Object}
   */
  _templates: {
    level: false,
    delimiter: false
  },

  /**
   * List of objects that are monitored for Global Events
   * @type {Array}
   */
  _watchingGlobalEventsOn: []
};

/**
 * Monitor module
 * @class
 * @extends {BaseObject}
 * @mixes MonitorConfig
 */
export default class Monitor extends BaseObject {

  /**
   * Constructs Debug
   * @param {Object} [options]
   */
  constructor(options) {
    super(options);
    _.extend(this, MonitorOptions, options);
    this._monitor = Events.$new();
    this._logger = new Log({level: 'debug', as: '[Fiber.Monitor]', templates: this._templates});
    this._listeningToGlobals(true);
    _.bindAll(this, ['_fired', '_firedGlobal']);
  }

  /**
   * Watches and notifies about all events and methods triggered/called by the `object`.
   * @param {Object} object
   * @returns {Monitor}
   */
  watch(object) {
    this.watchEvents(object);
    this.watchMethods(object);
    this.fire('watch:start', object, this);
    return this;
  }

  /**
   * Stops watching and notifying about all events and methods triggered/called by the `object`.
   * @param object
   * @return {Monitor}
   */
  stopWatching(object) {
    this.stopWatchingEvents(object);
    this.stopWatchingMethods(object);
    this.fire('watch:stop', object, this);
    return this;
  }

  /**
   * Watches and notifies about all events triggered by the `object`.
   * @param {Object} object
   * @param {boolean} [watchGlobals=true]
   * @returns {Monitor}
   */
  watchEvents(object, watchGlobals = true) {
    this._monitor.listenTo(object, 'all', this._fired);
    watchGlobals && this.watchGlobalEvents(object);
    this.fire('watch.events:start', object, this);
    return this;
  }

  /**
   * Stops watching and notifying about all events triggered by the `object`.
   * @param {Object} object
   * @param {boolean} [stopGlobals=true]
   * @returns {Monitor}
   */
  stopWatchingEvents(object, stopGlobals = true) {
    this._monitor.stopListening(object, 'all', this._fired);
    stopGlobals && this.stopWatchingGlobalEvents(object);
    this.fire('watch.events:stop', object, this);
    return this;
  }

  /**
   * Watches and notifies about all global events triggered by the `object`.
   * @param {Object} object
   * @returns {Monitor}
   */
  watchGlobalEvents(object) {
    let index = this._watchingGlobalEventsOn.indexOf(object);
    if (! (~ index)) this._watchingGlobalEventsOn.push(object);
    this.fire('watch.events.global:start', object, this);
    return this;
  }

  /**
   * Stops watching and notifying about all global events triggered by the `object`.
   * @param {Object} object
   * @returns {Monitor}
   */
  stopWatchingGlobalEvents(object) {
    let index = this._watchingGlobalEventsOn.indexOf(object);
    if (~ index) this._watchingGlobalEventsOn.splice(index, 0);
    this.fire('watch.events.globals:stop', object, this);
    return this;
  }

  /**
   * Watches `object` `methods` calls
   * @param {Object} object
   * @param {string|Array.<string>} [methods]
   * @return {Monitor}
   */
  watchMethods(object, methods) {
    if (_.isEmpty(methods)) methods = _.functionsIn(object);
    this._releaseCached(object);
    let cached = this._createCached(object);
    cached.own = _.functions(object);
    for (let i = 0; i < methods.length; i ++) {
      let name = methods[i];
      cached.methods[name] = object[name];
      object[name] = (function(self, name, object) {
        return function() {
          self.notifyMethod(name, arguments, self._getStackTrace());
          return cached.methods[name].apply(object, arguments);
        };
      })(this, name, object);
    }

    this.fire('watch.methods:start', object, this);
    return this;
  }

  /**
   * Stops watching `object` `methods` calls.
   * @param {Object} object
   * @param {string|Array.<string>} [methods]
   * @return {Monitor}
   */
  stopWatchingMethods(object, methods) {
    let cached = this._findCached(object);
    if (! cached) return this;
    if (_.isEmpty(methods)) methods = _.keys(cached.methods);
    _.each(methods, function(name) {
      if (! _.has(cached.own, name)) delete object[name];
      else object[name] = cached.methods[name];
    });
    this._forgetCached(object);
    this.fire('watch.methods:stop', object, this);
    return this;
  }

  /**
   * Notifies about event
   * @param {string} event
   * @param {Array|Arguments} args
   * @param {*} stack
   * @return {Monitor}
   */
  notifyEvent(event, args, stack) {
    return this._notify('event', event, args, stack);
  }

  /**
   * Notifies about method call
   * @param {string} method
   * @param {Array|Arguments} args
   * @param {*} stack
   * @return {Monitor}
   */
  notifyMethod(method, args, stack) {
    return this._notify('method', method, args, stack);
  }

  /**
   * Starts/Stops listening to Global Events.
   * @param {boolean} state
   * @private
   */
  _listeningToGlobals(state) {
    this._monitor[(state ? 'listenTo' : 'stopListening')](Events.getBroadcast(), 'all', this._firedGlobal);
  }

  /**
   * Notifies that event was triggered.
   * @param {string} event
   * @param {...args}
   * @private
   */
  _fired(event, object) {
    this.notifyEvent(event, arguments, this._getStackTrace());
  }

  /**
   * Notifies that Global event was triggered.
   * @param {string} event
   * @param {...args}
   * @private
   */
  _firedGlobal(event, object) {
    for (let i = 0; i < this._watchingGlobalEventsOn.length; i ++) {
      if (this._watchingGlobalEventsOn[i].object === object) this._fired.apply(null, arguments);
    }
  }

  /**
   * Notifies about intercepted type action.
   * @param {string} type
   * @param {string} parameter
   * @param {Array|Arguments} args
   * @param {*} [stack]
   * @returns {Monitor}
   * @private
   */
  _notify(type, parameter, args, stack) {
    type = type.toLowerCase();

    let msg = _.template(this.template, {
      symbol: this.symbols[type],
      type: type,
      action: type === 'event' ? 'triggered' : 'called',
      param: parameter
    });

    this._logger.log(msg, args, stack);
    this.fire.apply(this, ['notify'].concat([msg, args, stack]));
    return this;
  }

  /**
   * Returns stack trace for the current call.
   * @returns {*|string}
   * @private
   */
  _getStackTrace() {
    if (this.notifies.stackTrace) try {let stack = (new Error).stack;}
    catch (e) {}
    return this._prepareStackTrace(stack) || '';
  }

  /**
   * Prepares stack trace.
   * @param {string} stackTrace
   * @returns {string}
   * @private
   */
  _prepareStackTrace(stackTrace) {
    // jscs:disable validateQuoteMarks
    let stack = (stackTrace || '').split("\n");
    // jscs:enable validateQuoteMarks
    if (stack.length > 2) {
      stack.shift();
      stack.shift();
    }
    // jscs:disable validateQuoteMarks
    return "\n" + stack.join("\n");
    // jscs:enable validateQuoteMarks
  }

  /**
   * Creates cached object structure and returns reference to it.
   * @param {Object} object
   * @returns {{object: {Object}, methods: {}}}
   * @private
   */
  _createCached(object) {
    let prepared = {object: object, methods: {}, own: []};
    this._cache.push(prepared);
    return prepared;
  }

  /**
   * Returns first found cached object using given `object`
   * @param {Object} object
   * @returns {Object|void}
   * @private
   */
  _findCached(object) {
    return _.first(_.filter(this._cache, function(cached) {
      if (cached.object === object) return cached;
    }));
  }

  /**
   * Removes object from the Monitor cache.
   * @param {Object} object
   * @returns {Monitor}
   * @private
   */
  _forgetCached(object) {
    _.each(this._cache, function(cached, index) {
      if (cached.object === object) this._cache.splice(+ index, 1);
    }, this);
    return this;
  }

  /**
   * Returns all watched methods to the owner object in original state.
   * @param {Object} object
   * @returns {Monitor}
   * @private
   */
  _releaseCached(object) {
    if (this._findCached(object)) this.stopWatchingMethods(object);
    return this;
  }
};