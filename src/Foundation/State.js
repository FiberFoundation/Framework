import Synthetic from './Synthetic';

/**
 * State.
 * @class
 * @extends {Synthetic}
 **/
export default class State extends Synthetic {

  /**
   * Constructs State. Guards attributes from being directly retrieved or set.
   * @param {Object|Immutable} [attributes]
   * @param {Object} [options={}]
   */
  constructor(attributes, options) {
    super(attributes, options);
    this.guard();
  }
}
