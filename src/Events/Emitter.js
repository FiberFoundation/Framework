import Serializable from '../Foundation/Serializable';
import {copyProperties} from '../Support/Extend';
import Vent from './_Support';
import * as _ from 'lodash';

/**
 * Channels storage.
 * Manages the private channels data of Emitter classes.
 * @type {WeakMap}
 * @private
 */
let Channels = new WeakMap();

/**
 * Fiber Emitter.
 * @class
 * @extends {Serializable}
 */
export default class Emitter extends Serializable {

  /**
   * Emitter Namespace.
   * @type {string}
   */
  ns = '';

  /**
   * Events catalog.
   * @type {Object}
   */
  catalog = {};

  /**
   * Flag to enable/disable events to trigger.
   * @type {boolean}
   */
  allowedToEmit = true;

  /**
   * Constructs Events.
   * @param {Object} [options={ns:'',catalog:{}}] - Options object.
   */
  constructor(options = {ns: '', catalog: {}}) {
    super(options);
    this.options = _.clone(options);
    this.resetNsAndCatalog(options);
    if (options.allowedToEmit) this.allowedToEmit = options.allowedToEmit;
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
   * @param {...any} args
   * @returns {Emitter}
   */
  trigger(event, ...args) {
    if (! this.allowedToEmit) return this;
    return Vent.trigger.apply(this, arguments);
  }

  /**
   * Fires event with namespace and catalog look up.
   * @param {string} event
   * @param {...any} args
   * @returns {Emitter}
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
   * @returns {Emitter}
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
   * @returns {Emitter}
   */
  once(event, listener, scope) {
    return this.after(this, event, listener, scope);
  }

  /**
   * Inversion-of-control versions of `on`. Tells `this` object to listen to
   * an event in another object... keeping track of what it's listening to
   * for easier unbinding later.
   * @param {Object|Emitter|string} object
   * @param {string|Function} event
   * @param {Function|Object} listener
   * @param {Object} [scope]
   * @returns {Emitter}
   */
  when(object, event, listener, scope) {
    if (_.isString(object)) [listener, event, object] = [event, object, this];
    return Vent.listenTo.call(
      this, object, this.event(event, object), this.createEventListener(listener, scope)
    );
  }

  /**
   * Inversion-of-control versions of `once`.
   * @param {Object|Emitter|string} object
   * @param {string|Function} event
   * @param {Function|Object} listener
   * @param {Object} [scope]
   * @returns {Emitter}
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
   * @param {Object|Emitter|string} [object]
   * @param {string|Function} [event]
   * @param {Function|Object} [listener]
   * @param {Object} [scope]
   * @returns {Emitter}
   */
  off(object, event, listener, scope) {
    if (_.isString(object)) [listener, event, object] = [event, object, this];
    return Vent.stopListening.call(
      this, object, (event && this.event(event, object) || void 0), this.createEventListener(listener, scope)
    );
  }

  /**
   * Broadcasts global event.
   * @param {string} event
   * @param {...any} args
   * @returns {Emitter}
   */
  broadcast(event, ...args) {
    Broadcast.fire.apply(Broadcast, arguments);
    return this;
  }

  /**
   * Inversion-of-control versions of `on` that listens to the Global Broadcast.
   * That gives ability to listen to events even if you don't know what object will fire it.
   * @param {string} event
   * @param {Function} listener
   * @param {Object} [scope]
   * @returns {Emitter}
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
   * @returns {Emitter}
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
   * @returns {Emitter}
   */
  stopBroadcast(event, listener, scope) {
    Broadcast.off(event, listener, scope);
    return this;
  }

  /**
   * Creates separate Emitter channel with the given `name`, if one exists then it will be returned.
   * @param {string} name
   * @returns {Emitter}
   */
  channel(name) {
    if (! Channels.has(this)) Channels.set(this, {});
    let storage = Channels.get(this) || {}
      , channel = storage[name];

    if (! (channel instanceof Emitter)) {
      channel = new Emitter();
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
   * Resets events namespace and catalog to default values.
   * @param {Object} [options]
   * @returns {Emitter}
   */
  resetNsAndCatalog(options = {ns: '', catalog: {}}) {
    this.ns = options.ns || '';
    this.catalog = options.catalog || {};
    return this;
  }

  /**
   * Unbounds and clears all events.
   * @returns {Emitter}
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
   * @returns {Emitter}
   */
  destroyBroadcastEvents() {
    Broadcast.destroy();
    return this;
  }

  /**
   * Creates new Emitter.
   * @param {Object} [options]
   * @returns {Emitter}
   * @static
   */
  static make(options) {
    return new Emitter(options);
  }

  /**
   * Returns Emitter as plain object.
   * @returns {Object}
   */
  static asObject() {
    return copyProperties({}, new Emitter);
  }

  /**
   * Determines if given `object` is Emitter.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isEmitter(object) {
    if (_.isFunction(object)) object = Reflect.getPrototypeOf(object);
    return object instanceof Emitter;
  }
};

/**
 * Global Broadcast.
 * @type {Emitter}
 */
const Broadcast = new Emitter();

/** Cache reference for the Global Broadcast. */
Emitter.Broadcast = Broadcast;
