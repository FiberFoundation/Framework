/* @flow */
/**
 * Fiber Species.
 * @class
 **/
export default class Species {

  /**
   * Returns constructor function that is used to create derived objects.
   * @returns {Constructable}
   * @static
   * @meta
   */
  static get [Symbol.species](): Object {
    return this;
  }

  /**
   * Determines if given `object` is instance of Synthetic.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isInstance(object: any): boolean {
    if (typeof object === 'function') {
      object = Reflect.getPrototypeOf(object);
    }

    return object instanceof this[Symbol.species];
  }
}
