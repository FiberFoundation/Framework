/* @flow */
import * as _ from 'lodash';

/**
 * Traversable.
 * @class
 */
export default class Traversable {

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
  [Symbol.iterator](): Generator<Array<any>, any, any> {
    let all = this.traversable();
    let traversable = all;

    if (_.isObject(all) && ! _.isArray(all)) {
      traversable = Reflect.ownKeys(all);
    }

    for (const one of traversable) yield [one, all[one]];
  }
}
