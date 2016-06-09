import Events from '../Events/Events';
import * as _ from 'lodash';

/**
 * Fiber Base Object
 * @class
 * @mixes Events
 * @mixes Access
 **/
export default class BaseObject {

  /**
   * Constructs Base Object.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {*} [defaults]
   * @returns {*}
   */
  get(key, defaults) {
    return _.get(this, key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string} key
   * @param {*} value
   * @returns {Access}
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
   * @returns {*}
   */
  forget(key) {
    let result = this.get(key);
    _.unset(this, key);
    return result;
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {*} [defaults]
   * @returns {*}
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
   * Includes mixin.
   * @param {Object} mixin
   * @returns {Access}
   */
  mix(mixin) {
    return _.assign(this, mixin);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Access}
   */
  merge(object) {
    return _.merge(this, object);
  }

  /**
   * Destroys Base Object.
   * @return {Object}
   */
  destroy() {
    this.options = null;
    this.destroyEvents();
    return this;
  }

  /**
   * Creates new Base Object with the given `options`.
   * @param {Object} options
   * @returns {BaseObject}
   */
  $new(options) {
    return new BaseObject(options);
  }
}

/**
 * Adds Eventing to the Base Object.
 */
Object.assign(BaseObject.prototype, Events);
