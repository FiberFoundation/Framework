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
   * @returns {string}
   * @override
   */
  serialize(object) {
    return this.parser.stringify(object, this.options.replacer, this.options.space);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   * @override
   */
  unserialize(string) {
    return this.parser.parse(string, this.options.reviver);
  }
}
