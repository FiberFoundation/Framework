import AbstractParser from './AbstractParser';
import SerializeAdapter from './SerializeAdapter';
import JsonSerializeAdapter from './JsonSerializeAdapter';
import Log from '../Logger/Log';

/**
 * Serializer.
 * @class
 */
export default class Serializer {

  /**
   * Parsers
   * @type {Object}
   * @static
   */
  static Parsers = {AbstractParser};

  /**
   * Adapters
   * @type {Object}
   * @static
   */
  static Adapters = {
    Serialize: SerializeAdapter,
    JsonSerialize: JsonSerializeAdapter
  };

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
   * @param {Object} [defaults = '']
   * @returns {string}
   */
  serialize(object, defaults = '') {
    try {
      var string = this.adapter.serialize(object);
    } catch(e) {
      string = defaults;
      Log.error('[Serializer]: Given `object` cannot be converted to `string` using current adapter.', e);
    }

    return string;
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @param {Object} [defaults = {}]
   * @returns {Object}
   */
  unserialize(string, defaults = {}) {
    try {
      var object = this.adapter.unserialize(string);
    } catch(e) {
      object = defaults;
      Log.error('[Serializer]: Given `string` cannot be converted to `object` using current adapter.', e);
    }

    return object;
  }
}
