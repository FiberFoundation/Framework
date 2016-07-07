import Synthetic from '../Foundation/Synthetic';
import Types from '../Support/Types';

/**
 * Model Schema.
 * @class
 * @extends {Synthetic}
 **/
export default class Schema extends Synthetic {

  /**
   * Constructs Schema.
   * @param {Object|Schema|ImmutableMap} attributes
   * @param {Object} [options]
   */
  constructor(attributes, options) {
    if (Schema.isInstance(attributes)) attributes = attributes.toMap();
    super(attributes, options);
  }

  /**
   * Reference to all Types.
   * @type {Map}
   */
  static Type = Types;
}
