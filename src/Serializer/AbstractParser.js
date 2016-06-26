import * as _ from 'lodash';

/**
 * Abstract Serialize Parser.
 * @class
 * @interface
 */
export default class AbstractParser {

  /**
   * Determines if `Class` is instance of `AbstractParser`.
   * @param Class
   * @returns {boolean}
   */
  static isParser(Class) {
    if (_.isFunction(Class)) Class = new Class();
    return Class instanceof AbstractParser;
  }

  /**
   * Converts a JavaScript value to a JSON string, optionally replacing values if a replacer function is specified,
   * or optionally including only the specified properties if a replacer array is specified.
   * @param {any} value
   * @param {Function|string|Number} [replacer]
   * @param {Number|string} [space]
   * @returns {string}
   * @abstract
   * @static
   */
  static stringify(value, replacer, space) {}

  /**
   * Parses a string as JSON, optionally transforming the value produced by parsing.
   * @param {string} jsonString
   * @param {Function} [reviver]
   * @returns {Object}
   * @abstract
   * @static
   */
  static parse(jsonString, reviver) {}
}
