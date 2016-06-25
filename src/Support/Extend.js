import * as _ from 'lodash';

/**
 * Transforms plain object to Constructable Class or if nothing is passed creates empty Class wrapper.
 * @param {Object|any} [proto={}]
 * @return {Constructable}
 */
export function toClass(proto = {}) {
  if (_.isFunction(proto)) return proto;
  let Constructable = createDefaultConstructor(proto.constructor);
  return assignPrototype(Constructable, proto);
};

/**
 * Mixes objects with override and transforms to Constructable.
 * @param {...Constructable|...Object} args
 * @returns {Constructable}
 */
export function Mix(...args) {
  return toClass(_.extend.apply(_, [{}].concat(args)));
}

/**
 * Creates object that contains all properties from argument Constructables, except `constructor`, `prototype` and
 * `name`.
 * @param {...Constructable|...Object} Constructable
 * @returns {Constructable}
 */
export function All(...Constructable) {
  return toClass(copyProperties({}, Constructable));
};

/**
 * Extend this Constructable to create a new one inheriting this one.
 * Also adds `__parent__` pointing to parent constructor.
 * @param {Constructable} Parent
 * @param {Object} proto
 * @returns {Constructable}
 */
export function Extend(Parent = function() {}, proto = {}) {
  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent's constructor.
  let Child = resolveConstructor(proto, Parent);
  // Add static properties to the constructor function, if supplied and also add `__parent__` reference.
  assignStatics(Child, Parent, Parent);
  // Set the prototype chain to inherit from `parent`
  assignPrototype(Child, proto);
  // Add prototype properties (instance properties) to the subclass, if supplied.
  if (proto) copyProperties(Child.prototype, proto);
  // and finally return Child
  return Child;
};

/**
 * Returns Constructor from `proto` or creates one.
 * @param {Object} proto
 * @param {Constructable} Parent
 * @param {Array} args
 * @returns {Constructor}
 */
export function resolveConstructor(proto = {}, Parent = null, args = []) {
  if (proto.constructor) return proto.constructor;
  return createDefaultConstructor(Parent, args);
}

/**
 * Creates default Constructable. It will invoke Parent Constructable using `args` concatenated with all passed
 * arguments to it.
 * @param {Constructable} [Parent]
 * @param {Array} [args=[]]
 * @returns {Constructor}
 */
export function createDefaultConstructor(Parent, args = []) {
  /** @typedef {Constructor} */
  return function FiberConstructor() {
    if (Parent) Parent.bind(this).apply(null, args.concat(...arguments));
  };
};

/**
 * Creates prototype for the given `Constructable` using `proto` object and `Constructable` itself as Constructable,
 * setting it with descriptor.
 * @param {Constructable} Constructable
 * @param {Object} [proto={}]
 * @returns {Constructable}
 */
export function assignPrototype(Constructable, proto = {}) {
  Constructable.prototype = Object.create(proto, {
    constructor: {value: Constructable, enumerable: false, configurable: true, writable: true}
  });
  return Constructable;
};

/**
 * Add static properties to the constructor function.
 * @param {Constructable} Constructable
 * @param {Constructable|Object} statics
 * @param {Constructable|null} Parent
 * @returns {Constructable}
 */
export function assignStatics(Constructable, statics, Parent) {
  return copyProperties(Constructable, [statics, {__parent__: Parent}]);
}

/**
 * Copies properties from Source to Target Constructable.
 * @param {Constructable} Target
 * @param {Constructable|Array.<Constructable>} Source
 * @return {Constructable}
 */
export function copyProperties(Target, Source) {
  Source = _.castArray(Source);
  for (let i = 0; i < Source; i ++) {
    for (let key of Reflect.ownKeys(Source[i])) {
      if (key === "constructor" || key === "prototype" || key === "name") continue;
      let desc = Object.getOwnPropertyDescriptor(Source[i], key);
      Object.defineProperty(Target, key, desc);
    }
  }
  return Target;
}
