import * as _ from 'lodash';
import Events from '../Events/Events';

/**
 * Fiber Object.
 * @class
 * @extends {Events}
 **/
export default class Object extends Events {

  /**
   * Constructs Fiber Object.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    super(options);
    this.options = options;
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {mixed} [defaults]
   * @returns {mixed}
   */
  get(key, defaults) {
    return _.get(this, key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string} key
   * @param {mixed} value
   * @returns {Object}
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
   * @returns {mixed}
   */
  forget(key) {
    let result = this.get(key);
    _.unset(this, key);
    return result;
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {mixed} [defaults]
   * @returns {mixed}
   */
  result(key, defaults) {
    return _.result(this, key, defaults);
  }

  /**
   * Returns all keys.
   * @returns {Array}
   */
  keys() {
    return _.keys(this);
  }

  /**
   * Returns all values.
   * @returns {Array}
   */
  values() {
    return _.values(this);
  }

  /**
   * Returns array with keys and values.
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
   * @returns {Object}
   */
  merge(object) {
    return _.merge(this, object);
  }

  /**
   * Includes mixin.
   * @param {Object} mixin
   * @returns {Object}
   */
  mix(mixin) {
    return _.assign(this, mixin);
  }

  /**
   * Serializes Bag to JSON string.
   * @returns {string}
   */
  serialize() {
    return JSON.stringify(this);
  }

  /**
   * Converts and sets serialized JSON string to Bag.
   * @param {string} json
   * @return {Object}
   */
  unserialize(json) {
    try {
      var converted = JSON.parse(json);
    } catch(e) {}
    this.merge(_.isObject(converted) || {});
    return this;
  }

  /**
   * Destroys Base Object.
   * @return {Object}
   * @override
   */
  destroy() {
    super.destroy();
    this.options = null;
    return this;
  }
}
