/**
 * Fiber Abstract Service.
 * @class
 * @interface
 **/
export default class AbstractService {
  
  /**
   * Start and bootstraps the Service.
   * @returns {AbstractService}
   * @abstract
   */
  start() {}

  /**
   * Stops and destroys the Service.
   * @returns {AbstractService}
   * @abstract
   */
  stop() {}
}
