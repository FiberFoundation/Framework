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
    return this.adapter.serialize(object);
  }

  /**
   * Returns object parsed from `string`.
   * @param {string} string
   * @returns {Object}
   */
  unserialize(string: string): Object {
    return this.adapter.unserialize(string);
  }
}
