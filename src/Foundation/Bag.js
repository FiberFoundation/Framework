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
   * @param {Object} [storable]
   * @param {Object} [options]
   */
  constructor(storable, options) {
    super(options);
    this.reset(storable);
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   * @override
   */
  get(key, defaults) {
    return _.get(this.toPlain(), key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string|Object} key
   * @param {any} [value]
   * @returns {Bag}
   * @override
   */
  set(key, value) {
    if (_.isPlainObject(key)) return this.reset(key);
    this.reset(_.set(this.toPlain(), key, value));
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   * @override
   */
  has(key) {
    return _.has(this.toPlain(), key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {any}
   * @override
   */
  forget(key) {
    let result = this.get(key), all = this.toPlain();
    _.unset(all, key);
    this.reset(all);
    return result;
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   * @override
   */
  retrieve(key, defaults) {
    return _.result(this.toPlain(), key, defaults);
  }

  /**
   * Returns all keys.
   * @returns {Array}
   * @override
   */
  keys() {
    return _.keys(this.toPlain());
  }

  /**
   * Returns all values.
   * @returns {Array}
   * @override
   */
  values() {
    return _.values(this.toPlain());
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array.<string>} keys
   * @returns {Array}
   * @override
   */
  pick(keys) {
    return _.pick(this.toPlain(), keys);
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array.<string>} keys
   * @returns {Object}
   * @override
   */
  omit(keys) {
    return _.omit(this.toPlain(), keys);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Bag}
   * @override
   */
  merge(object) {
    this.reset(_.merge(this.toPlain(), object));
    return this;
  }

  /**
   * Includes mixin.
   * @param {Object} mixin
   * @returns {Class}
   * @override
   */
  mix(mixin) {
    return this.reset(_.assign(this.toPlain(), mixin));
  }

  /**
   * Traverses each item in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  each(iteratee, scope) {
    _.each(this.toPlain(), scope ? iteratee::scope : iteratee);
    return this;
  }

  /**
   * Maps items in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Object}
   */
  map(iteratee, scope) {
    return _.map(this.toPlain(), scope ? iteratee::scope : iteratee);
  }

  /**
   * Transforms each item in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  transform(iteratee, scope) {
    iteratee = scope ? iteratee::scope : iteratee
    let items = this.toPlain();
    for (let key in items) items[key] = iteratee(items[key], key, items);
    return this;
  }

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {
    return this.toPlain();
  }

  /**
   * Clones bag items.
   * @returns {Bag}
   */
  clone() {
    return new Bag(this.toPlain(), this.options);
  }

  /**
   * Flushes items.
   * @return {Bag}
   */
  flush() {
    return this.reset();
  }

  /**
   * Resets items with the given `object`
   * @param {Object} [object={}]
   * @returns {Bag}
   */
  reset(object = {}) {
    Items.set(this, object);
    return this;
  }

  /**
   * Converts to Plain object.
   * @returns {Object}
   * @override
   */
  toPlain() {
    return Items.get(this);
  }

  /**
   * Destroys Bag.
   * @returns {Class}
   * @override
   */
  destroy() {
    super.destroy();
    this.flush();
    return this;
  }

  /**
   * Returns Bag size.
   * @returns {number}
   */
  get size() {
    return _.size(this.all());
  }
}
