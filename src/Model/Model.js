import Types from '../Support/Types';
import Emitter from '../Events/Emitter';
import Synthetic from '../Foundation/Synthetic';
import {All} from '../Support/Extend';
import * as _ from 'lodash';

/**
 * Fiber Model.
 * @class
 * @extends {Emitter}
 */
export default class Model extends All(Emitter, Synthetic) {

  /**
   * Model schema.
   * @type {Object}
   */
  schema = {};

  /**
   * Constructs Model.
   * @param {Object} [attributes={}]
   * @param {Object} [options={}]
   */
  constructor(attributes = {}, options = {}) {
    super(options);

    if (options.schema) {
      this.schema = options.schema;
    }

    this.useSchema(this.schema);
    this.reset(attributes);
  }

  /**
   * Returns value at a `key`.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  get(key, defaults) {
    if (this.isPath(key)) {
      return this.attributes.getIn(this.toPath(key), defaults);
    }

    return this.attributes.get(key, defaults);
  }

  /**
   * Sets `value` to a `key`.
   * @param {string|Object|ImmutableMap} key
   * @param {any} [value]
   * @returns {State}
   */
  set(key, value) {
    if (arguments.length === 1) {
      this.attributes = this.attributes.mergeDeep(key);
    } else if (this.isPath(key)) {
      this.attributes = this.attributes.setIn(this.toPath(key), value);
    } else {
      this.attributes = this.attributes.set(key, value);
    }
    return this;
  }

  /**
   * Determines if Model has given `key`.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.isPath(key) ? this.attributes.hasIn(this.toPath(key)) : this.attributes.has(key);
  }

  /**
   * Proceeds with the given `schema`.
   * @param {Object} [schema={}]
   * @returns {Record.Class}
   */
  useSchema(schema = {}) {
    return this.Record = Record(schema);
  }

  /**
   * Creates new Record for Model attributes.
   * @param {Object} [attributes={}]
   * @returns {Model}
   */
  reset(attributes = {}) {
    this.attributes = new this.Record(attributes);
    return this;
  }

  /**
   * Flushes Model attributes.
   * @returns {Model}
   */
  flush() {
    this.attributes = Record(this.schema);
    return this;
  }

  /**
   * Returns object that will be serialized and used in `toPlain` and `fromPlain` methods.
   * @returns {Object}
   */
  serializable() {
    return this.attributes.toJS();
  }

  /**
   * Destroys Model.
   * @returns {Model}
   * @override
   */
  destroy() {
    super.destroy();
    this.flush();
    return this;
  }

  /**
   * Generator method to iterate through items using for..of loop.
   */
  * iterator() {
    let all = this.toPlain();
    let ownKeys = Reflect.ownKeys(all);
    for (let key of ownKeys) yield [key, all[key]];
  }

  /**
   * Data Types known to Fiber.
   * @type {Object}
   * @static
   */
  static Types = Types;

  /**
   * Determines if given `object` is Model.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isModel(object) {
    return object instanceof Model;
  }

  /**
   * Creates new Model from alternating object and options.
   * @param {Object|ImmutableMap|State} [state]
   * @param {Object} [options]
   * @returns {Model}
   * @static
   */
  static of(state, options) {
    return new Model(state, options);
  }
}
