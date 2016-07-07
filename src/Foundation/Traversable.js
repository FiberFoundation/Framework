import Traverse from "../Contracts/Traverse";

/**
 * Traversable.
 * @class
 * @implement Traverse
 */
export default class Traversable extends Traverse {

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {
    return this;
  }
  
  /**
   * Generator method to iterate through properties using for..of loop.
   * @yields {[key, value]}
   */
  * iterator() {
    const all = this.all();
    const keys = Reflect.ownKeys(all);
    for (const key of keys) yield [key, all[key]];
  }
}
