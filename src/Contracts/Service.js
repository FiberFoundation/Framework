/* @flow */

/**
 * Service Contract.
 * @interface
 **/
declare interface Service {

  /**
   * Bootstraps the Service.
   * @returns {Service}
   * @abstract
   */
  init(): Service;

  /**
   * Runs the Service.
   * @returns {Service}
   * @abstract
   */
  run(): Service;

  /**
   * Stops and destroys the Service.
   * @returns {Service}
   * @abstract
   */
  terminate(): Service;
}
