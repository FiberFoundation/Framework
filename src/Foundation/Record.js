import Synthetic from './Synthetic';

/**
 * Fiber Record.
 * @class
 * @extends {Synthetic}
 **/
export default class Record extends Synthetic {

  /**
   * Constructs Record.
   * @param {Object} [attributes]
   * @param {string} [name]
   */
  constructor(attributes, name) {
    super(attributes);

  }

  /**
   * Creates object with default keys for the Record using provided `attributes`.
   * @param {Object} attributes
   * @param {any} [defaultValue=void]
   * @returns {Object}
   */
  createDefaults(attributes, defaultValue = void 0) {
    let defaults = {};
    for (let key of Reflect.ownKeys(attributes)) defaults[key] = defaultValue;
    return defaults;
  }
}
