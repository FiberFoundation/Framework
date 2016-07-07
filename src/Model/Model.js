import Synthetic from '../Foundation/Synthetic';
import Schema from './Schema';

/**
 * Schema Symbol
 * @type {Symbol}
 */
const SchemaSymbol = Symbol.for('@@schema');

/**
 * Model.
 * @class
 * @extends {Synthetic}
 */
export default class Model extends Synthetic {

  /**
   * Constructs Model.
   * @param {Object} [attributes]
   * @param {Object<string, any>} [options={}]
   */
  constructor(attributes, options = {}) {
    super(attributes, options);
  }

  /**
   * Returns defined Schema for the Model.
   * @returns {Schema|Object}
   */
  static get schema() {
    return this[SchemaSymbol];
  }

  /**
   * Sets Schema to use for the current Model.
   * @param {Schema|Object} schema
   */
  static set schema(schema) {
    if (! this[SchemaSymbol]) this[SchemaSymbol] = schema;
  }
}
