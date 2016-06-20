import Class from '../Foundation/Class';
import Bag from '../Foundation/Bag';
import * as _ from 'lodash';

/**
 * String to determine resolvable bindings.
 * @type {string}
 */
export const RESOLVABLE_POSTFIX = '!';

/**
 * Fiber Inverse Of Control Container
 * @class
 * @extends {Class}
 */
export default class Container extends Class {

  /**
   * Constructs Container
   * @param {Object} [options]
   */
  constructor(options) {
    super(options);
    this.flush();
  }

  /**
   * Flushes Container.
   * @returns {Container}
   */
  flush() {
    this.bindings = new Bag();
    this.instances = new Bag();
    this.aliases = new Bag();
    return this;
  }

  /**
   * Register a binding with the container.
   * @param {string|Array} abstract
   * @param {any} concrete
   * @param {?boolean} [shared=false]
   * @returns {Container}
   */
  bind(abstract, concrete, shared = false) {
    let bag = shared ? 'instances' : 'bindings';
    if (_.isArray(abstract)) this.alias(abstract);
    this[bag].set(abstract, this.prepareResolvable(concrete));
    return this;
  }

  /**
   * Register a binding as shared instance (singleton)
   * @param {string|Array} abstract
   * @param {Object} concrete
   * @returns {Container}
   */
  share(abstract, concrete) {
    return this.bind(abstract, concrete, true);
  }

  /**
   * Sets binding alias.
   * @param {string|Array} abstract
   * @param {string} [alias='']
   * @returns {Container}
   */
  alias(abstract, alias) {
    if (_.isArray(abstract)) [abstract, alias] = abstract;
    this.aliases.set(alias, abstract);
    return this;
  }

  /**
   * Resolve the given type from the container.
   * @param {string|Array} abstract
   * @param {Array} [parameters=[]]
   * @param {Object} [scope=null]
   * @returns {Object}
   * @throws Resolution Exception
   */
  make(abstract, parameters = [], scope = null) {
    abstract = this.getAbstract(abstract);
    if (this.isShared(abstract)) return this.shared(abstract);
    return this.build(abstract, parameters, scope);
  }

  /**
   * Builds abstract type with the given parameters.
   * @param {string} abstract
   * @param {Array} [parameters=[]]
   * @param {Object} [scope=null]
   * @returns {Object}
   */
  build(abstract, parameters = [], scope = null) {
    let concrete = this.bindings.get(abstract);
    parameters = this.resolve(parameters);
    return scope ? concrete.apply(scope, parameters) : concrete(parameters);
  }

  /**
   * Resolves all dependencies found in `parameters` array.
   * @param {Array} parameters
   * @returns {Array}
   */
  resolve(parameters) {
    return parameters.map((parameter) => this.isResolvable(parameter) ? this.make(parameter) : parameter);
  }

  /**
   * Returns closure that can resolve `concrete` type.
   * @param {any} concrete
   * @returns {any}
   */
  prepareResolvable(concrete) {
    let isFn = _.isFunction(concrete)
      , isClass = isFn && concrete.prototype && concrete.prototype.constructor;

    if (! isFn) return _.constant(concrete);
    if (! isClass) return concrete;

    return function() {
      let args = arguments;

      function InstanceCreator() {
        return concrete.apply(this, args);
      };

      InstanceCreator.prototype = concrete.prototype;
      return new InstanceCreator();
    };
  }

  /**
   * Ensures that given abstract is not an alias.
   * @param {string} abstract
   * @returns {string}
   */
  getAbstract(abstract) {
    abstract = this.removeResolvablePostfix(abstract);
    return this.isAlias(abstract) ? this.aliases.get(abstract) : abstract;
  }

  /**
   * Removes `RESOLVABLE_POSTFIX` from `abstract` type definition.
   * @param {string} abstract
   * @returns {string}
   */
  removeResolvablePostfix(abstract) {
    if (abstract.charAt(abstract.length - 1) === RESOLVABLE_POSTFIX) {
      abstract = abstract.slice(0, abstract.length - 2);
    }

    return abstract;
  }

  /**
   * Retrieves type from the extensions and shared container
   * @param {string} abstract
   * @returns {any}
   */
  shared(abstract) {
    return this.instances.get(this.getAbstract(abstract));
  }

  /**
   * Determines if the given `abstract` type has been bound.
   * @param {string} abstract
   * @returns {boolean}
   */
  isBound(abstract) {
    return this.bindings.has(abstract);
  }

  /**
   * Determine if abstract is shared.
   * @param {string} abstract
   * @returns {boolean}
   */
  isShared(abstract) {
    return this.shared.has(abstract);
  }

  /**
   * Determines if abstract is alias.
   * @param {string} abstract
   * @returns {boolean}
   */
  isAlias(abstract) {
    return this.aliases.has(abstract);
  }

  /**
   * Determines if parameter can be resolved and injected from the Container.
   * @param {any} parameter
   * @returns {boolean}
   */
  isResolvable(parameter) {
    if (! _.isString(parameter)) return false;

    if (parameter.charAt(parameter.length - 1) === RESOLVABLE_POSTFIX) {
      parameter = parameter.slice(0, parameter.length - 2);
    }

    return this.isBound(parameter) || this.isShared(parameter) || this.isAlias(parameter);
  }
}
