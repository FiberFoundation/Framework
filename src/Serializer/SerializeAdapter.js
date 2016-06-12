import AbstractParser from './AbstractParser';

/**
 * Serializer Adapter.
 * @class
 */
export default class SerializeAdapter {

  /**
   * Parser instance.
   * @type {Object}
   */
  parser = null;

  /**
   * Constructs Serialize Adapter.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
    if (options.parser instanceof AbstractParser) {
      this.parser = options.parser;
    }
  }

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @returns {string}
   */
  serialize(object) {
    throw new Error('[SerializeAdapter]: `serialize` methods should be overridden in Child Class.');
    return '';
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   */
  unserialize(string) {
    throw new Error('[SerializeAdapter]: `unserialize` methods should be overridden in Child Class.');
    return {};
  }
}
