import AbstractParser from './AbstractParser';
import SerializeAdapter from './SerializeAdapter';
import JsonParser from './Json/JsonParser';
import JsonAdapter from './Json/JsonAdapter';
import Log from '../Logger/Log';

/**
 * Default Serialize Adapter.
 * @type {JsonAdapter}
 */
let DefaultAdapter = new JsonAdapter();

/**
 * Serializer.
 * @class
 */
export default class Serializer {

  /**
   * Parsers.
   * @type {Object}
   * @static
   */
  static Parsers = {
    Abstract: AbstractParser,
    Json: JsonParser
  };

  /**
   * Adapters.
   * @type {Object}
   * @static
   */
  static Adapters = {
    Adapter: SerializeAdapter,
    Json: JsonAdapter
  };

  /**
   * Serialize Adapter instance.
   * @type {SerializeAdapter}
   */
  adapter = DefaultAdapter;

  /**
   * Constructs Serializer.
   * @param {SerializeAdapter} [adapter=JsonAdapter]
   */
  constructor(adapter = DefaultAdapter) {
    if (adapter instanceof SerializeAdapter) {
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
    return convert(this.adapter, 'serialize', object, defaults);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @param {Object} [defaults = {}]
   * @returns {Object}
   */
  unserialize(string, defaults = {}) {
    return convert(this.adapter, 'unserialize', string, defaults);
  }

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @param {Object} [defaults = '']
   * @returns {string}
   * @static
   */
  static serialize(object, defaults = '') {
    return Internal.serialize(object, defaults);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} json
   * @param {Object} [defaults = {}]
   * @returns {Object}
   * @static
   */
  static unserialize(json, defaults = {}) {
    return Internal.unserialize(json, defaults);
  }
}

/**
 * Serializer used internally for static conversion.
 * @type {Serializer}
 */
const Internal = new Serializer();

/**
 * Converts from/to JSON representation.
 * @param {SerializeAdapter} adapter
 * @param {string} method
 * @param {string|Object} what
 * @param {string|Object} [defaults]
 * @returns {*}
 */
function convert(adapter, method, what, defaults) {
  try {
    var converted = adapter[method](what);
  }
  catch (e) {
    converted = defaults || method === 'serialize' ? '' : {};
    let from = method === 'serialize' ? 'object' : 'string';
    let to = method === 'serialize' ? 'string' : 'object';
    Log.error(`[Serializer]: Given ${from} cannot be converted to ${to} using current adapter.`, e, this);
  }

  return converted;
}
