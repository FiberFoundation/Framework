import Contract from "./Contract";

/**
 * Traverse Contract.
 * @class
 * @interface
 * @extends {Contract}
 */
export default class Traverse extends Contract {

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {}

  /**
   * Generator method to iterate through properties using for..of loop.
   * @yields {[key, value]}
   * @abstract
   */
  * iterator() {}
}
