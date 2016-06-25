import Emitter from '../Events/Emitter';
import Immutable from 'immutable';
import * as _ from 'lodash';

/**
 * Fiber State Class
 * @class
 * @extends Emitter
 **/
export default class State extends Emitter {

  /**
   * Constructs State.
   * @param {Object|Immutable.Map} [state]
   * @param {Object} [options={}]
   */
  constructor(state, options = {}) {
    super(options);
    this.reset(state);
    this.options = _.clone(options);
  }

  /**
   * Returns `current` State
   * @returns {Immutable.Map}
   */
  current() {
    return this.__state;
  }

  /**
   * Returns value at a `key`.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    if (! key) return this.current();
    return this.__state.get(key);
  }

  /**
   * Sets `value` to a `key`.
   * @param {string} key
   * @param {any} value
   * @returns {State}
   */
  set(key, value) {
    this.__state = this.__state.set(key, value);
    return this;
  }

  /**
   * Determines if State has given `key`.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.__state.has(key);
  }

  /**
   * Deletes value at a key.
   * @param {string} key
   * @returns {any}
   */
  forget(key) {
    let value = this.get(key);
    this.__state = this.__state.delete(key);
    return value;
  }

  /**
   * Updates current State at a `key` with the `value`.
   * @param {string} key
   * @param {any} value
   * @returns {State}
   */
  update(key, value) {
    this.__state = this.__state.update(key, value);
    return this;
  }

  /**
   * Resets State with the given object.
   * @param {Object} [state={}]
   * @return {State}
   */
  reset(state = {}) {
    this.__state = Immutable.Map(state);
    return this;
  }

  /**
   * Flushes State.
   * @returns {State}
   */
  flush() {
    this.__state = this.__state.clear();
    return this;
  }

  /**
   * Clones State.
   * @returns {State}
   */
  clone() {
    return new State(this.toPlain(), this.options);
  }

  /**
   * Returns object that will be serialized and used in `toPlain` and `fromPlain` methods.
   * @returns {Object}
   * @override
   */
  getSerializable() {
    return this.__state.toObject();
  }

  /**
   * Returns State size.
   * @returns {number}
   */
  get size() {
    return this.__state.size;
  }
}
