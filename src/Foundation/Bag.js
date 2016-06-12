import Class from './Class';
import * as _ from 'lodash';

/**
 * Items storage.
 * @type {WeakMap}
 * @private
 */
let Items = new WeakMap();

/**
 * Fiber Bag
 * @class
 * @extends {Class}
 */
export default class Bag extends Class {

  /**
   * Constructs Bag.
   * @param {Object} [storable={}]
   * @param {Object} [options={}]
   */
  constructor(storable = {}, options = {}) {
    super(options);
    Items.set(this, storable);
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {mixed} [defaults]
   * @returns {mixed}
   */
  get(key, defaults) {
    return _.get(Items.get(this), key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string} key
   * @param {mixed} value
   * @returns {Bag}
   */
  set(key, value) {
    _.set(Items.get(this), key, value);
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return _.has(Items.get(this), key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {mixed}
   */
  forget(key) {
    let result = this.get(key);
    _.unset(Items.get(this), key);
    return result;
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {mixed} [defaults]
   * @returns {mixed}
   */
  result(key, defaults) {
    return _.result(Items.get(this), key, defaults);
  }

  /**
   * Returns all keys.
   * @returns {Array}
   */
  keys() {
    return _.keys(Items.get(this));
  }

  /**
   * Returns all values.
   * @returns {Array}
   */
  values() {
    return _.values(Items.get(this));
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array.<string>} keys
   * @returns {Array}
   */
  pick(keys) {
    return _.pick(Items.get(this), keys);
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array.<string>} keys
   * @returns {Object}
   */
  omit(keys) {
    return _.omit(Items.get(this), keys);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Bag}
   */
  merge(object) {
    return _.merge(Items.get(this), object);
  }

  /**
   * Traverses each item in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  each(iteratee, scope) {
    _.each(Items.get(this), scope ? iteratee.bind(scope) : iteratee);
    return this;
  }

  /**
   * Transforms each item in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  transform(iteratee, scope) {
    iteratee = scope ? iteratee::scope : iteratee
    let items = Items.get(this);
    for (let key in items) items[key] = iteratee(items[key], key, items);
    return this;
  }

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {
    return Items.get(this);
  }

  /**
   * Clones bag items.
   * @param {boolean} [deep=true]
   * @returns {Object}
   */
  clone(deep = true) {
    return _[deep ? 'cloneDeep' : 'clone'](Items.get(this));
  }

  /**
   * Flushes items.
   * @return {Bag}
   */
  flush() {
    Items.set(this, {});
    return this;
  }

  /**
   * Serializes Bag to JSON string.
   * @returns {string}
   */
  serialize() {
    return this.serializer.serialize(Items.get(this));
  }

  /**
   * Converts and sets serialized JSON string to Bag.
   * @param {string} json
   * @return {Bag}
   */
  fromSerialized(json) {
    Items.set(this, this.serializer.unserialize(json));
    return this;
  }
}
