import Immutable from 'immutable';

/**
 * Not Set Symbol.
 * @type {Symbol}
 */
const NotSet = Symbol.for('@@notSet');

/**
 * ConstructionMethod Symbol.
 * @type {Symbol}
 */
const ConstructionMethod = Symbol.for('@@specific');

/**
 * Cached Object `toString()` method.
 * @type {Function}
 */
const toString = Object.prototype.toString;

/**
 * Fiber Type Class.
 * @class
 */
export class Type {

  /**
   * Type Class.
   * @type {AnyClass}
   */
  Class = NotSet;

  /**
   * Type default value.
   * @type {any}
   */
  defaults = NotSet;

  /**
   * Returns Type specific options.
   * @returns {Symbol}
   */
  get constructionMethod() {
    return this[ConstructionMethod];
  }

  /**
   * Sets construction method.
   * @param {Symbol} method
   */
  set constructionMethod(method) {
    if (Object.values(Type.ConstructionMethod).contains[method]) {
      this[ConstructionMethod] = method;
    }
  }

  /**
   * Constructs Type using `options`.
   * @param {TypeClass} TypeClass
   * @param {any} [defaults=TypeClass]
   * @param {Symbol} [constructionMethod]
   * @param {Function} [customConstruction]
   */
  constructor(TypeClass, defaults = TypeClass, constructionMethod = Type.ConstructionMethod.NEW, customConstruction) {
    if (Symbol.isSymbol(defaults)) {
      [constructionMethod, customConstruction, defaults] = [defaults, constructionMethod, NotSet];
    }

    this.setProperty('Class', TypeClass);
    this.setProperty('defaults', defaults);
    this.constructionMethod = constructionMethod;

    if (customConstruction && this.constructionMethod === Type.ConstructionMethod.CUSTOM) {
      this.setProperty('customConstruction', customConstruction);
    }
  }

  /**
   * Sets property at `key` with `value`.
   * @param {string} key
   * @param {any} value
   * @returns {Type}
   */
  setProperty(key, value) {
    Object.defineProperty(this, key, {
      get: function() {return value;}
    });
    return this;
  }

  /**
   * Determines if Type Class is not set.
   * @returns {boolean}
   */
  isEmpty() {
    return this.Class === NotSet;
  }

  /**
   * Determines if Type has defaults.
   * @returns {boolean}
   */
  hasDefaults() {
    return this.defaults !== NotSet;
  }

  /**
   * Returns result of `typeof` call on the Type.
   * @returns {string}
   */
  typeOf() {
    if (this.isEmpty()) throw new TypeError();
    return typeof this.Class;
  }

  /**
   * Returns result of `toString()` call on the Type.
   * @returns {string|any}
   */
  toString() {
    if (this.isEmpty()) throw new TypeError();
    return toString.call(this.Class);
  }

  /**
   * Type construction methods.
   * @type {Object}
   */
  static ConstructionMethod = {
    NEW: Symbol('NEW'),
    CALL: Symbol('CALL'),
    CUSTOM: Symbol('CUSTOM'),
    MANY: Symbol('MANY'),
    NONE: Symbol('NONE')
  };
}

/**
 * Fiber build-in Types.
 * @type {ImmutableRecordClass|Object}
 */
export default new Immutable.Record({
  /** Value properties. */
  Infinity: new Type(Infinity, Type.ConstructionMethod.NONE),
  NaN: new Type(NaN, Type.ConstructionMethod.NONE),
  Undefined: new Type(void 0, Type.ConstructionMethod.NONE),
  Null: new Type(null, Type.ConstructionMethod.NONE),
  /** Fundamental objects. */
  Object: new Type(Object, {}, Type.ConstructionMethod.CUSTOM, (mixin = {}) => Object.assign({}, mixin)),
  Function: new Type(Function, function() {}, Type.ConstructionMethod.CUSTOM, () => function() {}),
  Boolean: new Type(Boolean, true, Type.ConstructionMethod.NONE),
  Symbol: new Type(Symbol, Symbol(), Type.ConstructionMethod.CALL),
  Error: new Type(Error, new Error),
  /** Numbers and dates. */
  Number: new Type(Number, 0, Type.ConstructionMethod.NONE),
  Date: new Type(Date, new Date),
  /** Text processing. */
  String: new Type(String, '', Type.ConstructionMethod.NONE),
  RegExp: new Type(RegExp, new RegExp),
  /** Indexed collections. */
  Array: new Type(Array, [], Type.ConstructionMethod.CUSTOM, ...args => args),
  /** Keyed collections. */
  Map: new Type(Map, new Map),
  Set: new Type(Set, new Set),
  WeakMap: new Type(WeakMap, new WeakMap),
  WeakSet: new Type(WeakSet, new WeakSet),
  /** Control abstraction objects. */
  Promise: new Type(Promise, new Promise(function() {})),
  GeneratorFunction: new Type(Object.getPrototypeOf(function*(){}).constructor, function*() {}),
  /** Reflection. */
  Proxy: new Type(Proxy, new Proxy({}, {})),
  /** File API objects. */
  Blob: new Type(Blob, new Blob([])),
  FormData: new Type(FormData, new FormData),
  /** WebSocket object. */
  WebSocket: new Type(WebSocket, new WebSocket('')),
  /** Worker API objects. */
  Worker: new Type(Worker, new Worker('')),
  /** Immutable Types. */
  Immutable: {
    Iterable: new Type(Immutable.Iterable, Immutable.Iterable([]), Type.ConstructionMethod.CALL),
    Seq: new Type(Immutable.Seq, Immutable.Seq([]), Type.ConstructionMethod.CALL),
    Record: new Type(Immutable.Record, Immutable.Record({})(), Type.ConstructionMethod.CALL),
    Repeat: new Type(Immutable.Repeat, Immutable.Repeat('repeat', 2), Type.ConstructionMethod.CALL),
    Range: new Type(Immutable.Range, Immutable.Range(0, 10), Type.ConstructionMethod.CALL),
    Stack: new Type(Immutable.Stack, Immutable.Stack(), Type.ConstructionMethod.CALL),
    OrderedSet: new Type(Immutable.OrderedSet, Immutable.OrderedSet(), Type.ConstructionMethod.CALL),
    Set: new Type(Immutable.Set, Immutable.Set(), Type.ConstructionMethod.CALL),
    OrderedMap: new Type(Immutable.OrderedMap, Immutable.OrderedMap(), Type.ConstructionMethod.CALL),
    Map: new Type(Immutable.Map, Immutable.Map(), Type.ConstructionMethod.CALL),
    List: new Type(Immutable.List, Immutable.List(), Type.ConstructionMethod.CALL)
  },
  /** Fiber Type. */
  Type: new Type(Type, new Type(NotSet))
});
