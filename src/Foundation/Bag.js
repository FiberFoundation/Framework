import Class from './Class';
import * as _ from 'lodash';

/**
 * Private `items` Symbol.
 * @type {Symbol}
 */
const $items$ = Symbol('items');

/**
 * Fiber Bag
 * @class
 * @extends Class
 */
export default class Bag extends Class {

  /**
   * Constructs Bag.
   * @param {Object} [storable={}]
   */
  constructor(storable = {}) {
    super();
    this[$items$] = storable;
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {*} [defaults]
   * @returns {*}
   */
  get(key, defaults) {
    return _.get(this[$items$], key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string} key
   * @param {*} value
   * @returns {Bag}
   */
  set(key, value) {
    _.set(this[$items$], key, value);
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return _.has(this[$items$], key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {*}
   */
  forget(key) {
    let result = this.get(key);
    _.unset(this[$items$], key);
    return result;
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {*} [defaults]
   * @returns {*}
   */
  result(key, defaults) {
    return _.result(this[$items$], key, defaults);
  }

  /**
   * Returns all keys.
   * @returns {Array}
   */
  keys() {
    return _.keys(this[$items$]);
  }

  /**
   * Returns all values.
   * @returns {Array}
   */
  values() {
    return _.values(this[$items$]);
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array.<string>} keys
   * @returns {Array}
   */
  pick(keys) {
    return _.pick(this[$items$], keys);
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array.<string>} keys
   * @returns {Object}
   */
  omit(keys) {
    return _.omit(this[$items$], keys);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Bag}
   */
  merge(object) {
    return _.merge(this[$items$], object);
  }

  /**
   * Traverses each item in a bag.
   * @param {function(...)} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  each(iteratee, scope) {
    _.each(this[$items$], scope ? iteratee.bind(scope) : iteratee);
    return this;
  }

  /**
   * Transforms each item in a bag.
   * @param {function(...)} iteratee
   * @param {Object} [scope]
   * @returns {Bag}
   */
  transform(iteratee, scope) {
    iteratee = scope ? iteratee.bind(scope) : iteratee
    for (let key in this[$items$]) {
      this[$items$][key] = iteratee(this[$items$][key], key, this[$items$]); 
    }
    return this;
  }

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {
    return this[$items$];
  }

  /**
   * Flushes items.
   * @return {Bag}
   */
  flush() {
    this[$items$] = {};
    return this;
  }

  /**
   * Clones bag items.
   * @param {boolean} [deep=true]
   * @returns {Object}
   */
  clone(deep = true) {
    return _[deep ? 'cloneDeep' : 'clone'](this[$items$]);
  }

  /**
   * Creates new Bag with the given `storable` items.
   * @param {Object} storable
   * @returns {Bag}
   */
  $new(storable) {
    return new Bag(storable);
  }
}
