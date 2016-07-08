/* @flow */

/**
 * Serializer Adapter Contract.
 * @interface
 */
declare interface SerializeAdapter {

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @returns {string}
   */
  serialize(object: Object): string;

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   */
  unserialize(string: string): Object;
}
