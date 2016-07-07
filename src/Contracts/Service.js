import Contract from "./Contract";

/**
 * Service Contract.
 * @class
 * @interface
 * @implement Contract
 **/
export default class Service extends Contract {

  /**
   * Bootstraps the Service.
   * @returns {Service}
   * @abstract
   */
  init() {}

  /**
   * Runs the Service.
   * @returns {Service}
   * @abstract
   */
  run() {}

  /**
   * Stops and destroys the Service.
   * @returns {Service}
   * @abstract
   */
  terminate() {}
}
