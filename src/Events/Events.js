import Vent from './Support';
import * as _ from 'lodash';

/**
 * Fiber Events.
 *
 * Build in events brings namespaces to the event and also
 * provides catalog to simplify registered events and add ability to create event alias.
 * @class
 * @mixin
 */
export default class Events {

  /**
   * Constructs Events.
   * @param {string} [ns='']
   * @param {Object} [catalog={}]
   */
  constructor(ns = '', catalog = {}) {
    this.ns = ns;
    this.catalog = catalog;
  }

  /**
   * Returns `event` with namespace and `catalog` look up.
   * @param {string} event
   * @returns {string}
   */
  event(event, listenable = null) {
    if (! event) return '';
    if (listenable && _.isFunction(listenable.event)) return listenable.event(event);
    // try to retrieve event from catalog
    let eventName = _.get(this, 'catalog.' + event) || event;
    // returns passed event as is if first char is `!`
    if (event.charAt(0) === '!') return event.slice(1);
    // and lastly join namespace and event string
    return (this.ns ? this.ns + ':' : '') + _.trim(eventName, '.');
  }

  /**
   * Triggers events with the given arguments.
   * @param {string} event
   * @param {...args}
   * @returns {Events}
   */
  trigger(event, ...args) {
    return Vent.trigger.apply(this, arguments);
  }

  /**
   * Fires event with namespace and catalog look up.
   * @param {string} event
   * @param {...args}
   * @returns {Events}
   */
  fire(event, ...args) {
    return this.trigger.apply(this, [this.event(event)].concat(...args));
  }

  /**
   * Bind an event to a `listener` function. Passing `"all"` will bind
   * the listener to all events fired.
   * @param {string} event
   * @param {function(...)} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  on(event, listener, scope) {
    return this.when(this, event, listener, scope);
  }

  /**
   * Bind an event to only be triggered a single time. After the first time
   * the listener is invoked, it will be removed. If multiple events
   * are passed in using the space-separated syntax, the handler will fire
   * once for each event, not once for a combination of all events.
   * @param {string} event
   * @param {function(...)} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  once(event, listener, scope) {
    return this.after(this, event, listener, scope);
  }

  /**
   * Inversion-of-control versions of `on`. Tells `this` object to listen to
   * an event in another object... keeping track of what it's listening to
   * for easier unbinding later.
   * @param {Object|Events|string} object
   * @param {string|function(...)} event
   * @param {function(...)|Object} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  when(object, event, listener, scope) {
    if (_.isString(object)) [listener, event, object] = [event, object, this];
    return Vent.listenTo.call(
      this, object, this.event(event, object), this.createEventListener(listener, scope)
    );
  }

  /**
   * Inversion-of-control versions of `once`.
   * @param {Object|Events|string} object
   * @param {string|function(...)} event
   * @param {function(...)|Object} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  after(object, event, listener, scope) {
    if (_.isString(object)) [listener, event, object] = [event, object, this];
    return Vent.listenToOnce.call(
      this, object, this.event(event, object), this.createEventListener(listener, scope)
    );
  }

  /**
   * Remove one or many listeners. If `scope` is null, removes all
   * listeners with that function. If `listener` is null, removes all
   * listeners for the event. If `name` is null, removes all bound
   * listeners for all events.
   * @param {Object|Events|string} [object]
   * @param {string|function(...)} [event]
   * @param {function(...)|Object} [listener]
   * @param {Object} [scope]
   * @returns {Events}
   */
  off(object, event, listener, scope) {
    if (_.isString(object)) [listener, event, object] = [event, object, this];
    return Vent.stopListening.call(
      this, object, (event && this.event(event, object) || void 0), this.createEventListener(listener, scope)
    );
  }

  /**
   * Inversion-of-control versions of `on` that listens to the Global Broadcast.
   * That gives ability to listen to events even if you don't know what object will fire it.
   * @param {string} event
   * @param {function(...)} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  whenBroadcast(event, listener, scope) {
    Broadcast.when(event, listener, scope);
    return this;
  }

  /**
   * Inversion-of-control versions of `once` that listens to the Global Broadcast.
   * That gives ability to listen to events even if you don't know what object will fire it.
   * @param {string} event
   * @param {function(...)} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  afterBroadcast(event, listener, scope) {
    Broadcast.after(event, listener, scope);
    return this;
  }

  /**
   * Remove one or many listeners from Global Broadcast. If `scope` is null, removes all
   * listeners with that function. If `listener` is null, removes all
   * listeners for the event. If `name` is null, removes all bound
   * listeners for all events.
   * @param {string} event
   * @param {function(...)} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  stopBroadcast(event, listener, scope) {
    Broadcast.off(event, listener, scope);
    return this;
  }

  /**
   * Broadcasts global event.
   * @param {string} event
   * @param {...args}
   * @returns {Events}
   */
  broadcast(event, ...args) {
    Broadcast.fire.apply(Broadcast, arguments);
    return this;
  }

  /**
   * Returns current Global Broadcast Events object.
   * @returns {Events}
   */
  getBroadcast() {
    return Broadcast;
  }

  /**
   * Sets current Global Broadcast Events object.
   * @param {Events} Broadcaster
   * @returns {Events}
   */
  setBroadcast(Broadcaster) {
    if (Broadcaster.trigger && Broadcaster.when) {
      Broadcast = Broadcaster;
    }
    return this;
  }

  /**
   * Creates and returns function that will call listener with the right scope.
   * @param {function(...)} cb
   * @param {Object} [scope]
   * @returns {FiberEventListener|void}
   */
  createEventListener(cb, scope) {
    if (! _.isFunction(cb)) return void 0;
    return function FiberEventListener() {
      return cb.apply(scope || cb.prototype || cb, arguments);
    };
  }

  /**
   * Unbounds and clears all events.
   * @param {boolean} [cleanUp=false]
   * @returns {Events}
   */
  clearEvents(cleanUp = false) {
    this.off();

    if (cleanUp) {
      delete this._listeningTo;
      delete this._listeners;
      delete this._listenId;
      delete this._events;
    }

    return this;
  }

  /**
   * Unbounds and clears all Global events.
   * @param {boolean} [cleanUp]
   * @returns {Events}
   */
  clearBroadcastEvents(cleanUp) {
    Broadcast.clearEvents(cleanUp);
    return this;
  }

  /**
   * Resets events namespace and catalog to default values.
   * @returns {Events}
   */
  resetNsAndCatalog() {
    this.ns = '';
    this.catalog = {};
    return this;
  }
};

/**
 * Global Broadcast.
 * @type {Events}
 */
let Broadcast = new Events();
