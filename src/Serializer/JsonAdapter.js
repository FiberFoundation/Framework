import SerializeAdapter from '../Contracts/SerializeAdapter';
import * as _ from 'lodash';

/**
 * JSON Serialize Adapter.
 * @class
 * @extends {SerializeAdapter}
 */
export default class JsonAdapter extends SerializeAdapter {

  /**
   * Constructs JSON Serialize Adapter.
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    super();
    this.options = _.defaults(options, {replacer: void 0, space: void 0, reviver: void 0});
  }

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @returns {string}
   * @override
   */
  serialize(object) {
    return JSON.stringify(object, this.options.replacer, this.options.space);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   * @override
   */
  unserialize(string) {
    return JSON.parse(string, this.options.reviver);
  }
}
