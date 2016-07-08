/* @flow */

import Emitter from '../Events/Emitter';
import * as _ from 'lodash';

/**
 * Base Class.
 * @class
 * @extends {Emitter}
 **/
export default class Class extends Emitter {

  /**
   * Options.
   * @type {Object}
   */
  options: Object;

  /**
   * Constructs Fiber Object.
   * @param {Object} [options={}]
   */
  constructor(options?: Object = {}) {
    super(options);
    this.options = _.clone(options);
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  get(key: string, defaults?: any): any {
    return _.get(this, key, defaults);
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string} key
   * @param {any} value
   * @returns {Class}
   */
  set(key: string, value: any): this {
    _.set(this, key, value);
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key: string): boolean {
    return _.has(this, key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {any}
   */
  forget(key: string): any {
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
  retrieve(key: string, defaults: ?any): any {
    return _.result(this, key, defaults);
  }

  /**
   * Returns all own keys.
   * @returns {Array<string>}
   */
  keys(): Array<string> {
    return _.keys(this);
  }

  /**
   * Returns all own values.
   * @returns {Array<any>}
   */
  values(): Array<any> {
    return _.values(this);
  }

  /**
   * Returns array with own keys and own values.
   * @returns {Array}
   */
  entries(): Array<any> {
    return [this.keys(), this.values()];
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array<string>} keys
   * @returns {Object}
   */
  pick(keys: string|Array<string>): Object {
    return _.pick(this, keys);
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array<string>} keys
   * @returns {Object}
   */
  omit(keys: string|Array<string>): Object {
    return _.omit(this, keys);
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Class}
   */
  merge(object: Object): this {
    _.merge(this, object);
    return this;
  }

  /**
   * Includes mixin.
   * @param {Object} mixin
   * @returns {Class}
   */
  mix(mixin: Object): this {
    _.extend(this, mixin);
    return this;
  }

  /**
   * Destroys Class.
   * @returns {Class}
   * @override
   */
  destroy(): this {
    super.destroy();
    this.options = {};
    return this;
  }

  /**
   * Specifies a function valued property that is called to convert an object to a corresponding primitive value.
   * @param {string} hint
   * @returns {string|number|boolean}
   * @meta
   */
  [Symbol.toPrimitive](hint: string): string|number|boolean {
    if (hint === 'string') return this.serialize();
    if (hint === 'number') return _.size(this);
    return !! _.size(this);
  }
}
