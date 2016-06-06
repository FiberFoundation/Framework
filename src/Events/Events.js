import { symResponders, symChannels } from 'src/Events/Symbols';
import GlobalEvents from 'src/Events/Global';
import Backbone from 'backbone';
import * as _ from 'lodash';

/**
 * Fiber Events.
 *
 * Build in events brings namespaces to the event and also
 * provides catalog to simplify registered events and add ability to create event alias.
 *
 * @type {Object}
 */
let Events = Object.assign({

  /**
   * Events configuration.
   * @type {Object}
   */
  eventsConfig: {

    /**
     * Events namespace.
     * @type {string}
     */
    ns: '',

    /**
     * Events catalog to hold the events.
     * @type {Object}
     */
    catalog: {},

    /**
     * Events fire configuration.
     * @type {Object}
     */
    fire: {

      /**
       * Flag to determine if method that is computed from event name will be called on object.
       * @type {boolean}
       */
      callEventMethod: true,

      /**
       * Prefix to use in events transformation to method name.
       * @type {string}
       */
      methodPrefix: 'when',

      /**
       * Flag to determine if events will be fired with lifecycle.
       * @type {boolean}
       */
      cyclic: false,

      /**
       * List of full event lifecycle.
       * @type {Array}
       */
      lifecycle: ['before', '@callback', 'after']
    }
  },

  /**
   * Properties keys that will be auto extended from initialize object.
   * @type {Array|function(...)|string}
   */
  willExtend: ['eventsConfig'],

  /**
   * Registered channels holder.
   * @type {Object}
   * @private
   */
  [symChannels]: {},

  /**
   * Registered request holder.
   * @type {Object}
   * @private
   */
  [symResponders]: {},

  /**
   * Returns `event` with namespace and `catalog` look up.
   * @param {string} event
   * @returns {string}
   */
  event: function(event) {
    let eventName = _.get(this, 'eventsConfig.catalog.' + event) || event;
    // returns passed event as is if first char is `!`
    if (event[0] === '!') return event.slice(1);
    // and lastly join namespace and event string
    return this.eventsConfig.ns + '.' + _.trim(eventName, '.');
  },

  /**
   * Handles `event` by trying to retrieve it from listenable.
   * @param {string} event
   * @param {Object} listenable
   * @returns {string}
   * @private
   */
  getEventName: function(event, listenable = this) {
    return _.isFunction(listenable.event) ? listenable.event(event) : event;
  },

  /**
   * Emits `event` with namespace (if available) and `catalog` alias look up.
   * @param {string} event
   * @param {...args}
   * @returns {Events}
   */
  emit: function(event, ...args) {
    this.trigger.apply(this, [this.event(event)].concat(...args));
    return this;
  },

  /**
   * Fires `event` with namespace (if available) and `catalog` alias look up.
   * If `eventsConfig.callEventMethod` is `true` then `fireCall` method will be triggered with current arguments.
   * If `eventsConfig.cyclic` is `true` then `fireLifeCycle` method will be triggered with current arguments.
   * @param {string} event
   * @param {...args}
   * @returns {void|Events|*}
   */
  fire: function(event, ...args) {
    if (this.eventsConfig.fire.cyclic) {
      if (! _.isFunction(arguments[1])) arguments[1] = _.noop;
      return this.fireLifeCycle.apply(this, arguments);
    }

    if (this.eventsConfig.fire.callEventMethod) {
      return this.fireCall.apply(this, arguments);
    }

    return this.emit.apply(this, arguments);
  },

  /**
   * Invokes method (camel case transformed event) if exists and fires `event`.
   * @param {string} event - event to fire and transform to callback name
   * @param {...args}
   * @returns {void|*}
   */
  fireCall: function(event, ...args) {
    let methodName = this.eventsConfig.fire.methodPrefix + _.capitalize(event)
      , result = void 0;

    if (_.isFunction(this[methodName])) {
      result = this[methodName].apply(this, ...args);
    }

    this.emit.apply(this, arguments);

    return result;
  },

  /**
   * Fires lifecycle `event` by calling `fireCall` on each lifecycle part.
   * If current lifecycle includes `@callback` then given callback will be called on time.
   * @param {string} event - event to fire and transform to callback name
   * @param {function(...)} callback
   * @param {...args}
   * @return {void|*}
   */
  fireLifeCycle: function(event, callback, ...args) {
    let result = void 0;

    this.eventsConfig.fire.lifecycle.forEach(function(now) {
      if (now === '@callback' && _.isFunction(callback)) {
        result = callback.apply(this, ...args);
      }

      this.emit.apply(this, [event].concat(...args));
    }, this);

    return result;
  },

  /**
   * Every time `event` is fired invokes `action`.
   * You can provide listenable to listen to as last argument.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [listenable=this]
   * @param {?Object} [scope=this]
   */
  when: function(event, action, listenable = this, scope = this) {
    return this.listenTo(listenable, this.getEventName(event, listenable), action.bind(scope));
  },

  /**
   * After first `event` is fired invoke `action` and remove it.
   * You can provide listenable to listen to as last argument.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [listenable=this]
   * @param {?Object} [scope=this]
   */
  after: function(event, action, listenable, scope) {
    return this.listenToOnce(listenable, this.getEventName(event, listenable), action.bind(scope));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  broadcast: function(event, ...args) {
    return GlobalEvents.trigger.apply(GlobalEvents, [this.event(event)].concat(...args));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {function(...)} action
   * @param {Object|Function} [scope=this]
   * @returns {*}
   */
  whenBroadcast: function(event, action, scope = this) {
    return GlobalEvents.listenTo(GlobalEvents, this.event(event), action.bind(scope));
  },

  /**
   * Adds global event `action` for the `event` with the given `scope` and remove after first trigger.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {function(...)} action
   * @param {Object} [scope=this]
   * @returns {*}
   */
  afterBroadcast: function(event, action, scope = this) {
    return GlobalEvents.listenToOnce(GlobalEvents, event, action.bind(scope));
  },

  /**
   * Stop listening global `event` with `action`.
   * Listens to the Fiber internal event system to give ability to set event listeners
   * even if you don't know what object will be triggering event.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [scope=this]
   * @returns {*}
   */
  stopBroadcast: function(event, action, scope = this) {
    return GlobalEvents.stopListening(GlobalEvents, event, action.bind(scope));
  },

  /**
   * Returns event channel, if one is not exists with given `name`, it will be created.
   * @param {string} name
   * @returns {Events}
   */
  channel: function(name) {
    let channel = _.get(this[symChannels], name);

    if (! channel) {
      channel = Events.$new();
      _.set(this[symChannels], name, channel);
    }

    return channel;
  },

  /**
   * Adds response as an action call for the given `event`.
   * @param {string} event
   * @param {function(...)} action
   * @param {?Object} [scope=this]
   * @returns {Events}
   */
  respondTo: function(event, action, scope = this) {
    _.set(this[symResponders], event, action.bind(scope));
    return this;
  },

  /**
   * Sends event request and returns response
   * @param {string} event
   * @param {...args}
   * @returns {*}
   */
  request: function(event, ...args) {
    let response = _.get(this[symResponders], event);
    if (_.isFunction(response)) return response.apply(response, ...args);
    return void 0;
  },

  /**
   * Cleans up all events
   * @returns {Events}
   */
  clearBoundEvents: function() {
    this.off();
    this.stopListening();
    return this;
  },

  /**
   * Destroys and removes all channels
   * @returns {Events}
   */
  clearChannels: function() {
    _.each(this[symChannels], Events.destroyEvents);
    return this;
  },

  /**
   * Initializes events properties
   * @return {Events}
   */
  resetEventProperties: function() {
    this[symChannels] = {};
    this[symResponders] = {};
    return this;
  },

  /**
   * Stops listening to all events and channels.
   * @param {Backbone.Events|Events} [events]
   * @return {Backbone.Events|Events}
   */
  destroyEvents: function(events = this) {
    events.clearBoundEvents();
    events.clearChannels();
    events.resetEventProperties();
    return events;
  },

  /**
   * Returns new Events object
   * @param {Object} [mixin={}]
   * @returns {Events}
   */
  $new: function(mixin = {}) {
    return Object.assign({}, mixin, Events);
  }

}, Backbone.Events);

export default Events;
