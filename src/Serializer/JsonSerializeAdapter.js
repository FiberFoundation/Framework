import SerializeAdapter from './SerializeAdapter';
import * as _ from 'lodash';

/**
 * JSON Serialize Adapter.
 * @class
 * @extends {SerializeAdapter}
 */
export default class JsonAdapter extends SerializeAdapter {

  /**
   * JSON Parser instance.
   * @type {Object}
   */
  parser = JSON;

  /**
   * Constructs JSON Serialize Adapter.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    super(options);
    _.extend(this, {replacer: void 0, space: void 0, reviver: void 0}, options);
  }

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @param {Object} [defaults]
   * @returns {string}
   * @override
   */
  serialize(object, defaults) {
    return this.parser.stringify(object, this.options.replacer, this.options.space);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @param {Object} [defaults]
   * @returns {Object}
   * @override
   */
  unserialize(string, defaults) {
    return this.parser.parse(string, this.options.reviver);
  }
}
