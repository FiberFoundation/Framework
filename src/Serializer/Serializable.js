/* @flow */
import Traversable from '../Foundation/Traversable';
import Serializer from './Serializer';
import * as _ from 'lodash';

/**
 * Serializable Class.
 * @class
 * @extends {Traversable}
 **/
export default class Serializable extends Traversable {

  /**
   * Hidden properties.
   * Will be omitted on serialization.
   * @type {Array<string>}
   */
  hidden: Array<string> = ['serializer', 'hidden'];

  /**
   * Serializer instance.
   * @type {Serializer}
   */
  serializer: Serializer;

  /**
   * Constructs Serializable.
   * @param {Object} [options={}]
   */
  constructor(options: Object = {}) {
    super();
    if (options.hidden) this.markAsHidden(options.hidden);
    this.serializer = new Serializer(options.serializer);
  }

  /**
   * Marks property as `hidden` to avoid it to be serialized.
   * @param {string|Array<string>} hidden
   * @returns {Serializable}
   */
  markAsHidden(hidden: string|Array<string>): this {
    this.hidden = _.uniq(this.hidden.concat(_.castArray(hidden)));
    return this;
  }

  /**
   * Marks property as `visible` to allow to serialize it.
   * @param {string|Array<string>} visible
   * @returns {Serializable}
   */
  markAsVisible(visible: string|Array<string>): this {
    this.hidden = _.difference(this.hidden, _.castArray(visible));
    return this;
  }

  /**
   * Converts `Serializable` to JSON string.
   * @returns {string}
   */
  serialize(): string {
    return this.serializer.serialize(this.toPlain());
  }

  /**
   * Converts serialized JSON string to Serializable instance.
   * @param {string} serialized
   * @returns {Serializable}
   */
  fromSerialized(serialized: string): this {
    return this.fromPlain(this.serializer.unserialize(serialized));
  }

  /**
   * Converts to Plain object or Array.
   * @returns {Object}
   */
  toPlain(): Object {
    return _.omit(this.serializable(), this.hidden);
  }

  /**
   * Creates new instance or mixes `this` with the `plain` object/array.
   * @type {Object}
   * @returns {Serializable}
   */
  fromPlain(plain: Object): Object {
    _.extend(this.serializable(), plain);
    return this;
  }

  /**
   * Returns all items. Alias for `toPlain()`.
   * @returns {Object}
   */
  all(): Object {
    return this.toPlain();
  }

  /**
   * Returns object that will be serialized and used in `toPlain()` and `fromPlain()` methods.
   * @returns {Object}
   */
  serializable(): Object {
    return this;
  }

  /**
   * A string value used for the default description of an object. Used by `Object.prototype.toString()`.
   * @returns {string}
   * @meta
   */
  [Symbol.toStringTag](): string {
    return this.serialize();
  }

  /**
   * Returns constructor function that is used to create derived objects.
   * @returns {Constructable}
   * @static
   * @meta
   */
  static get [Symbol.species](): Object {
    return this;
  }

  /**
   * Determines if given `object` is instance of Synthetic.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isInstance(object: any): boolean {
    if (typeof object === 'function') object = Reflect.getPrototypeOf(object);
    return object instanceof this[Symbol.species];
  }
}
