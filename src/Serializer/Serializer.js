/* @flow */
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
   * Adapter instance.
   * @type {SerializeAdapter}
   */
  adapter: SerializeAdapter;

  /**
   * Constructs Serializer.
   * @param {SerializeAdapter} [adapter=JsonAdapter]
   */
  constructor(adapter: SerializeAdapter = DefaultAdapter) {
    this.adapter = adapter;
  }

  /**
   * Returns `object` converted to string.
   * @param {Object} object
   * @returns {string}
   */
  serialize(object: Object): string {
    return this.callAdapter('serialize', object);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   */
  unserialize(string: string): Object {
    return this.callAdapter('unserialize', string);
  }

  /**
   * Calls Adapter method to convert from/to JSON representation.
   * @param {string} method
   * @param {...any} args
   * @returns {any}
   */
  callAdapter(method: string, ...args: any): any {
    try {
      var converted = this.adapter[method](...args);
    } catch (e) {
      Log.error(`[Serializer]: Cannot call adapter with the given arguments.`, method, args, e);
    }
    return converted;
  }
}
