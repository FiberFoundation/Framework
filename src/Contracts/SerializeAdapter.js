import Contract from "./Contract";

/**
 * Serializer Adapter Contract.
 * @class
 * @interface
 * @implement Contract
 */
export default class SerializeAdapter extends Contract {
  
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
