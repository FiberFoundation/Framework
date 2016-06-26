import Serializer from '../Serializer/Serializer';
import * as _ from 'lodash';

/**
 * Fiber Serializable Class
 * @class
 **/
export default class Serializable {

  /**
   * Hidden properties.
   * Will be omitted on serialization.
   * @type {Array.<string>}
   */
  hidden = ['serializer', 'hidden'];

  /**
   * Constructs Fiber Serializable.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    if (options.hidden) this.markAsHidden(options.hidden);
    this.serializer = new Serializer(options.serializer);
  }

  /**
   * Marks property as `hidden` to avoid it to be serialized.
   * @param {string|Array.<string>} hidden
   * @returns {Serializable}
   */
  markAsHidden(hidden) {
    this.hidden = _.uniq(this.hidden.concat(_.castArray(hidden)));
    return this;
  }

  /**
   * Marks property as `visible` to allow to serialize it.
   * @param {string|Array.<string>} visible
   * @returns {Serializable}
   */
  markAsVisible(visible) {
    this.hidden = _.difference(this.hidden, _.castArray(visible));
    return this;
  }

  /**
   * Serializes Serializable to JSON string.
   * @returns {string}
   */
  serialize() {
    return this.serializer.serialize(this.toPlain());
  }

  /**
   * Converts serialized JSON string to new Serializable.
   * @param {string} serialized
   * @returns {Serializable}
   */
  fromSerialized(serialized) {
    return this.fromPlain(this.serializer.unserialize(serialized));
  }

  /**
   * Converts to Plain object or Array.
   * @returns {Object}
   */
  toPlain() {
    return _.omit(this.serializable(), this.hidden);
  }

  /**
   * Returns all items. Alias for `toPlain()`.
   * @returns {Object}
   */
  all() {
    return this.toPlain();
  }

  /**
   * Creates new instance or mixes `this` with the `plain` object/array.
   * @type {Object}
   * @returns {Serializable}
   */
  fromPlain(plain) {
    _.extend(this.serializable(), plain);
    return this;
  }

  /**
   * Returns serialized object if Serializable used in string context.
   * @returns {string}
   */
  toString() {
    return this.serialize();
  }

  /**
   * Returns object that will be serialized and used in `toPlain()` and `fromPlain()` methods.
   * @returns {Object}
   */
  serializable() {
    return this;
  }
}
