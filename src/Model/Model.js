import Types from '../Support/Types';
import State from '../Foundation/State';
import Emitter from '../Events/Emitter';
import * as _ from 'lodash';

/**
 * Fiber Model.
 * @class
 * @extends {Emitter}
 */
export default class Model extends Emitter {

  /**
   * Determines if given `object` is Model.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isModel(object) {
    return object instanceof Model;
  }

  /**
   * Creates new Model from alternating object and options.
   * @param {Object|ImmutableMap|State} [state]
   * @param {Object} [options]
   * @returns {Model}
   * @static
   */
  static of(state, options) {
    return new Model(state, options);
  }

  /**
   * Data Types known to Fiber.
   * @type {Object}
   * @static
   */
  static Types = Types;
  
  flush() {}
  
  /**
   * Destroys Model.
   * @returns {Model}
   * @override
   */
  destroy() {
    super.destroy();
    this.flush();
    return this;
  }

  /**
   * Generator method to iterate through items using for..of loop.
   */
  * iterator() {
    let all = this.all();
    let ownKeys = Reflect.ownKeys(all);
    for (let key of ownKeys) yield [key, all[key]];
  }
}
