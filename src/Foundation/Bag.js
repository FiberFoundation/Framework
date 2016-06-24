import Class from './Class';
import * as _ from 'lodash';
import Immutable from 'immutable';

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
    return _.get(this.all(), key, defaults);
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
    this.reset(_.set(this.all(), key, value));
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   * @override
   */
  has(key) {
    return _.has(this.all(), key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {any}
   * @override
   */
  forget(key) {
    let result = this.get(key), all = this.all();
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
    return _.result(this.all(), key, defaults);
  }

  /**
   * Returns all keys.
   * @returns {Array}
   * @override
   */
  keys() {
    return _.keys(this.all());
  }

  /**
   * Returns all values.
   * @returns {Array}
   * @override
   */
  values() {
    return _.values(this.all());
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array.<string>} keys
   * @returns {Array}
   * @override
   */
  pick(keys) {
    return _.pick(this.all(), keys);
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array.<string>} keys
   * @returns {Object}
   * @override
   */
  omit(keys) {
    return _.omit(this.all(), keys);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Bag}
   * @override
   */
  merge(object) {
    this.reset(_.merge(this.all(), object));
    return this;
  }

  /**
   * Includes mixin.
   * @param {Object} mixin
   * @returns {Class}
   * @override
   */
  mix(mixin) {
    return this.reset(_.assign(this.all(), mixin));
  }

  /**
   * Traverses each item in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  each(iteratee, scope) {
    _.each(this.all(), scope ? iteratee::scope : iteratee);
    return this;
  }

  /**
   * Maps items in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Object}
   */
  map(iteratee, scope) {
    return _.map(this.all(), scope ? iteratee::scope : iteratee);
  }

  /**
   * Transforms each item in a bag.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  transform(iteratee, scope) {
    iteratee = scope ? iteratee::scope : iteratee
    let items = this.all();
    for (let key in items) items[key] = iteratee(items[key], key, items);
    return this;
  }

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {
    return Items.get(this).toObject();
  }

  /**
   * Clones bag items.
   * @param {boolean} [deep=true]
   * @returns {Bag}
   */
  clone(deep = true) {
    let fn = deep ? 'cloneDeep' : 'clone';
    return new Bag(_[fn](this.all()), _[fn](this.options));
  }

  /**
   * Flushes items.
   * @return {Bag}
   */
  flush() {
    return this.reset({});
  }

  /**
   * Resets items with the given `object`
   * @param {Object} object
   * @returns {Bag}
   */
  reset(object) {
    Items.set(this, Immutable.Map(object));
    return this;
  }

  /**
   * Converts to Plain object.
   * @returns {Object}
   * @override
   */
  toPlain() {
    return this.all();
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
}
