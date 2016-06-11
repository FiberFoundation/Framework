/**
 * Abstract Serialize Parser.
 * @class
 */
export default class AbstractParser {

  /**
   * Converts a JavaScript value to a JSON string, optionally replacing values if a replacer function is specified,
   * or optionally including only the specified properties if a replacer array is specified.
   * @param {*} value
   * @param {Function|[String|Number]} [replacer]
   * @param {Number|String} [space]
   *
   * @abstract
   * @static
   */
  static stringify(value, replacer, space) {}

  /**
   * Parses a string as JSON, optionally transforming the value produced by parsing.
   * @param {string} jsonString
   * @param {Function} [reviver]
   * @param string
   *
   * @abstract
   * @static
   */
  static parse(jsonString, reviver) {}
}
