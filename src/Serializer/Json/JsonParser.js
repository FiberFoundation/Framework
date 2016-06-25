import AbstractParser from '../AbstractParser';

/**
 * JSON Serialize Parser.
 * @class
 * @implements {AbstractParser}
 */
export default class JsonParser extends AbstractParser {

  /**
   * Converts a JavaScript value to a JSON string, optionally replacing values if a replacer function is specified,
   * or optionally including only the specified properties if a replacer array is specified.
   * @param {*} value
   * @param {Function|string|Number} [replacer]
   * @param {Number|string} [space]
   * @returns {string}
   * @static
   */
  static stringify(value, replacer, space) {
    return JSON.stringify(value, replacer, space);
  }

  /**
   * Parses a string as JSON, optionally transforming the value produced by parsing.
   * @param {string} jsonString
   * @param {Function} [reviver]
   * @returns {Object}
   * @static
   */
  static parse(jsonString, reviver) {
    return JSON.parse(jsonString, reviver);
  }
}
