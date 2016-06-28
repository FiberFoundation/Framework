import SerializeAdapter from '../Contracts/SerializeAdapter';
import JsonAdapter from './JsonAdapter';
import Log from '../Foundation/Log';

/**
 * Default Serialize Adapter.
 * @type {JsonAdapter}
 * @const
 */
const DefaultAdapter = new JsonAdapter();

/**
 * Serializer.
 * @class
 */
export default class Serializer {

  /**
   * Adapters.
   * @type {Object}
   * @static
   */
  static Adapters = {
    Json: JsonAdapter
  };

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
   * @returns {string}
   */
  serialize(object) {
    return this.callAdapter('serialize', object);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   */
  unserialize(string) {
    return this.callAdapter('unserialize', string);
  }

  /**
   * Calls Adapter method to convert from/to JSON representation.
   * @param {string} method
   * @param {...any} args
   * @returns {any}
   */
  callAdapter(method, ...args) {
    try {
      var converted = this.adapter[method](...args);
    } catch (e) {
      Log.error(`[Serializer]: Cannot call adapter with the given arguments.`, method, args, e);
    }
    return converted;
  }
}
