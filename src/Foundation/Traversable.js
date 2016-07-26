/* @flow */
import Species from "./Species";

/**
 * Traversable.
 * @class
 */
export default class Traversable extends Species {

  /**
   * Returns traversable object.
   * @returns {Object}
   */
  traversable() {
    return this;
  }

  /**
   * Generator method to iterate through properties using for..of loop.
   * @yields {[key, value]}
   */
  * [Symbol.iterator](): Generator<Array<any>, any, any> {
    let all = this.traversable();
    let traversable = Reflect.ownKeys(all);

    for (const key of traversable) {
      yield [key, all[key]];
    }
  }
}
