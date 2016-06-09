import * as _ from 'lodash';
import Log from '../Logger/Log';

/**
 * Creates default constructor function.
 * @param {Function} [parent]
 * @param {Array} [args=[]]
 * @returns {Function}
 */
function createDefaultConstructor(parent, args = []) {
  return function FiberDefaultConstructor() {
    return parent && parent.apply(this, args.concat([...arguments])) || void 0;
  };
};

/**
 * Creates prototype for the given constructor.
 * @param {Function} ctor
 * @param {Object} [proto={}]
 * @returns {Function}
 */
function createPrototype(ctor, proto = {}) {
  ctor.prototype = Object.create(proto, {
    constructor: {value: ctor, enumerable: false, configurable: true, writable: true}
  });
  return ctor;
};

/**
 * Transforms plain object to Class.
 * @param {Object|*} proto
 * @return {Function}
 */
export function Classify(proto) {
  if (_.isFunction(proto)) return proto;
  let ctor = _.has(proto, 'constructor') ? proto.constructor : createDefaultConstructor();
  return createPrototype(ctor, proto);
};

/**
 * Joins prototypes with override into one object.
 * @param {...args}
 * @returns {Object}
 */
export function Join(...args) {
  return _.extend.apply(_, [{}].concat(...args))
};

/**
 * Deeply merges prototypes into one object.
 * @param {...args}
 * @returns {Object}
 */
export function Merge(...args) {
  return _.merge.apply(_, [{}].concat(...args))
};

/**
 * Provides multiple extend.
 * @param {Function} parent
 * @param {...args}
 * @returns {Function}
 */
export function Multi(parent, ...args) {
  return Extend(parent, Join(...args));
};

/**
 * Extend this Class to create a new one inheriting this one.
 * Also adds `_super_` object pointing to the parent prototype and `_parent_`
 * pointing to parent constructor.
 * @param parent
 * @param proto
 * @returns {*}
 * @constructor
 */
export function Extend(parent, proto) {
  var child;
  // if we don't have any parent then log error and return
  if (! parent) {
    Log.warn('`Parent` is not provided or not valid, setting to `noop` function', parent);
    parent = function() {};
  }
  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  if (proto && _.has(proto, 'constructor')) child = proto.constructor;
  else child = createDefaultConstructor(parent);
  // Add static properties to the constructor function, if supplied.
  _.extend(child, parent);
  // Set the prototype chain to inherit from `parent`
  createPrototype(child, proto);
  // Add prototype properties (instance properties) to the subclass, if supplied.
  if (proto) _.extend(child.prototype, proto);
  // Adds _parent_ and _super_ reference for the child.
  _.extend(child, {_parent_: parent, _super_: child.prototype});
  // and finally return child
  return child;
};

/**
 * Instantiates `Class` with array of arguments.
 * @param {Function} parent
 * @param {Array} args
 * @returns {Object}
 */
export function Instance(parent, args) {
  let isInstance = isInstance(parent);
  if (! isInstance || ! isClass(parent)) {
    Log.error('Cannot instantiate from `parent` Class. Not a Class or valid instance to retrieve Constructor.');
  }

  if (isInstance) parent = _.get(parent, 'constructor');
  let InstanceCreator = createDefaultConstructor(parent, args);
  createPrototype(InstanceCreator);
  return new InstanceCreator();
}

/**
 * Checks if given object is Class constructor.
 * @param {*} Class
 * @returns {boolean}
 */
export function isClass(object) {
  return _.isFunction(object) && object.prototype && object.prototype.constructor;
};

/**
 * Checks if given object is instance (not a Class)
 * @param instance
 * @returns {boolean}
 */
export function isInstance(object) {
  return ! isClass(object) && ! _.isPlainObject(object) && _.isObject(object);
};
