import * as _ from 'lodash';
import Emitter from '../Events/Emitter';
import Serializer from '../Serializer/Serializer';

/**
 * Fiber Class.
 * @class
 * @extends {Emitter}
 **/
export default class Class extends Emitter {

  /**
   * Hidden properties.
   * Will be omitted on serialization.
   * @type {Array.<string>}
   */
  hidden = ['serializer', 'hidden'];

  /**
   * Constructs Fiber Object.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    super(options);
    this.options = options;
    this.serializer = new Serializer(options.serializeAdapter);
    if (options.hidden) this.hidden = _.uniq(this.hidden.concat(options.hidden));
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  get(key, defaults) {
    return _.get(this, key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string} key
   * @param {any} value
   * @returns {Class}
   */
  set(key, value) {
    _.set(this, key, value);
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return _.has(this, key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {any}
   */
  forget(key) {
    let result = this.get(key);
    _.unset(this, key);
    return result;
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  retrieve(key, defaults) {
    return _.result(this, key, defaults);
  }

  /**
   * Returns all own keys.
   * @returns {Array}
   */
  keys() {
    return _.keys(this);
  }

  /**
   * Returns all own values.
   * @returns {Array}
   */
  values() {
    return _.values(this);
  }

  /**
   * Returns array with own keys and own values.
   * @returns {Array}
   */
  entries() {
    return [this.keys(), this.values()];
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array.<string>} keys
   * @returns {Array}
   */
  pick(keys) {
    return _.pick(this, keys);
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array.<string>} keys
   * @returns {Object}
   */
  omit(keys) {
    return _.omit(this, keys);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Class}
   */
  merge(object) {
    return _.merge(this, object);
  }

  /**
   * Includes mixin.
   * @param {Object} mixin
   * @returns {Class}
   */
  mix(mixin) {
    return _.assign(this, mixin);
  }

  /**
   * Serializes Bag to JSON string.
   * @returns {string}
   */
  serialize() {
    return this.serializer.serialize(this.toPlain());
  }

  /**
   * Converts and sets serialized JSON string to Bag.
   * @param {string} json
   * @returns {Class}
   */
  fromSerialized(json) {
    this.mix(this.serializer.unserialize(json));
    return this;
  }

  /**
   * Converts to Plain object.
   * @returns {Object}
   */
  toPlain() {
    return this.omit(this.hidden);
  }

  /**
   * Alias for `serialize`.
   * @returns {string}
   */
  toJSON() {
    return this.serialize();
  }

  /**
   * Destroys Base Object.
   * @returns {Class}
   * @override
   */
  destroy() {
    super.destroy();
    this.options = {};
    return this;
  }
}
