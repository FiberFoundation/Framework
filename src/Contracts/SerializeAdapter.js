/**
 * Serializer Adapter Contract.
 * @class
 * @interface
 */
export default class SerializeAdapter {
  
  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @returns {string}
   * @abstract
   */
  serialize(object) {}

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   * @abstract
   */
  unserialize(string) {}
}
