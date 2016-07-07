import State from '../Foundation/State';
import Class from "../Foundation/Class";
import * as _ from 'lodash';

/**
 * Resolvable parameter prefix.
 * @type {string}
 */
export const RESOLVABLE_PREFIX = '$$';

/**
 * Inverse Of Control Container
 * @class
 */
export default class Container {

  /**
   * Container's bindings.
   * @type {State}
   */
  bindings = new State();

  /**
   * Container's shared instances.
   * @type {State}
   */
  instances = new State();

  /**
   * Registered aliases.
   * @type {State}
   */
  aliases = new State();

  /**
   * Determines if binding is in Container.
   * @param {string} binding
   * @returns {boolean}
   */
  has(binding) {
    return this.isBound(binding) || this.isShared(binding) || this.isAlias(binding);
  }

  /**
   * Flushes Container.
   * @returns {Container}
   */
  flush() {
    this.bindings = new State();
    this.instances = new State();
    this.aliases = new State();
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
      return Reflect.construct(concrete, arguments);
    };
  }

  /**
   * Ensures that given abstract is not an alias.
   * @param {string} abstract
   * @returns {string}
   */
  getAbstract(abstract) {
    abstract = this.removeResolvablePrefix(abstract);
    return this.isAlias(abstract) ? this.aliases.get(abstract) : abstract;
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
   * Removes resolvable prefix from the `parameter`.
   * @param {string|any} parameter
   * @returns {string|any}
   */
  removeResolvablePrefix(parameter) {
    return _.isString(parameter) ? _.trimStart(parameter, RESOLVABLE_PREFIX) : parameter;
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
    if (! _.startsWith(parameter, RESOLVABLE_PREFIX)) return false;
  }

  /**
   * Creates resolvable parameter or returns as is if not is string.
   * @param {string|any} parameter
   * @returns {string|any}
   * @static
   */
  static resolvable(parameter) {
    return _.isString(parameter) && ! this.prototype.isResolvable(parameter) ? `${RESOLVABLE_PREFIX}${parameter}` : parameter;
  }
}
