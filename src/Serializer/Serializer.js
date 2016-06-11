import SerializeAdapter from './SerializeAdapter';
import JsonSerializeAdapter from './JsonSerializeAdapter';
import Log from '../Logger/Log';

/**
 * Serializer.
 * @class
 */
export default class Serializer {

  /**
   * Constructs Serializer.
   * @param {SerializeAdapter} [adapter]
   */
  constructor(adapter = new JsonSerializeAdapter()) {
    if (adapter instanceof SerializeAdapter) {
      /** @type {SerializeAdapter} */
      this.adapter = adapter;
    }
  }

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @returns {string}
   */
  stringify(object, defaults) {
    try {
      var string = this.adapter.serialize(object);
    } catch(e) {
      string = defaults || '';
      Log.error('[Serializer]: Given `object` cannot be converted to `string` using current adapter.');
    }

    return string;
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @param {Object} [defaults]
   * @returns {Object}
   */
  parse(string, defaults) {
    try {
      var object = this.adapter.unserialize(string);
    } catch(e) {
      object = defaults || {};
      Log.error('[Serializer]: Given `string` cannot be converted to `object` using current adapter.');
    }

    return object;
  }
}
