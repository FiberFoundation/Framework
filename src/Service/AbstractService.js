/**
 * Fiber Abstract Service.
 * @class
 * @interface
 **/
export default class AbstractService {

  /**
   * Register the service provider.
   * @returns {AbstractService}
   * @abstract
   */
  register() {}

  /**
   * Loads Service.
   * @returns {AbstractService}
   * @abstract
   */
  boot() {}

  /**
   * Stops and destroys Service.
   * @returns {AbstractService}
   * @abstract
   */
  destroy() {}
}
