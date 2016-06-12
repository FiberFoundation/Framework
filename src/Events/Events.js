import Vent from './Support';
import * as _ from 'lodash';

/**
 * Channels storage.
 * Manages the private channels data of Events classes.
 * @type {WeakMap}
 * @private
 */
let Channels = new WeakMap();

/**
 * Fiber Events.
 * @class
 */
export default class Events {

  /**
   * Constructs Events.
   * @param {{ns: string, catalog: Object}} [options={ns:'',catalog:{}}] - Options object.
   */
  constructor({ns, catalog} = {ns: '', catalog: {}}) {
    /** @type {string} */
    this.ns = ns || '';
    /** @type {Object} */
    this.catalog = catalog || {};
  }

  /**
   * Returns `event` with namespace and `catalog` look up.
   * @param {string} event
   * @param {Object} [listenable=null]
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
   * @param {...mixed} args
   * @returns {Events}
   */
  trigger(event, ...args) {
    return Vent.trigger.apply(this, arguments);
  }

  /**
   * Fires event with namespace and catalog look up.
   * @param {string} event
   * @param {...mixed} args
   * @returns {Events}
   */
  fire(event, ...args) {
    return this.trigger.apply(this, [this.event(event)].concat(...args));
  }

  /**
   * Bind an event to a `listener` function. Passing `"all"` will bind
   * the listener to all events fired.
   * @param {string} event
   * @param {Function} listener
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
   * @param {Function} listener
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
   * @param {string|Function} event
   * @param {Function|Object} listener
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
   * @param {string|Function} event
   * @param {Function|Object} listener
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
   * @param {string|Function} [event]
   * @param {Function|Object} [listener]
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
   * @param {Function} listener
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
   * @param {Function} listener
   * @param {Object} [scope]
   * @returns {Events}
   */
  afterBroadcast(event, listener, scope) {
    Broadcast.after(event, listener, scope);
    return this;
  }

  /**
   * Remove one or many listeners from Global Broadcast. If `scope` is null, removes all
   * listeners with that function. If `listener` is null, removes all listeners for the event.
   * If `name` is null, removes all bound listeners for all events.
   * @param {string} event
   * @param {Function} listener
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
   * @param {...mixed} args
   * @returns {Events}
   */
  broadcast(event, ...args) {
    Broadcast.fire.apply(Broadcast, arguments);
    return this;
  }

  /**
   * Creates separate Events channel with the given `name`, if one exists then it will be returned.
   * @param {string} name
   * @returns {Events}
   */
  channel(name) {
    if (! Channels.has(this)) Channels.set(this, {});
    let storage = Channels.get(this) || {}
      , channel = storage[name];

    if (! (channel instanceof Events)) {
      channel = new Events();
      storage[name] = channel;
    }

    Channels.set(this, storage);
    return channel;
  }

  /**
   * Creates and returns function that will call listener with the right scope.
   * @param {Function} cb
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
   * @returns {Events}
   */
  destroy() {
    this.off();

    try {
      delete this._listeningTo;
      delete this._listeners;
      delete this._listenId;
      delete this._events;
    } catch (e) {}

    return this;
  }

  /**
   * Unbounds and clears all Global events.
   * @param {boolean} [cleanUp]
   * @returns {Events}
   */
  destroyBroadcastEvents(cleanUp) {
    Broadcast.destroy(cleanUp);
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
const Broadcast = new Events();

/** Cache reference for the Global Broadcast. */
Events.Broadcast = Broadcast;
