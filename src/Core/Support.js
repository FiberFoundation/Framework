import * as _ from "lodash";

/**
 * Value that represents `not defined` state
 * @const
 * @type {Symbol}
 */
export const UNDEFINED = Symbol('UNDEFINED');

/**
 * Adds not defined value to the statics of `val` function.
 * @type {string}
 * @static
 */
val.UNDEFINED = UNDEFINED;
/**
 * Function to transform type before check.
 * @type {Function}
 */
const $typeTransformer = String.prototype.toLowerCase;

/**
 * Cached `Object.prototype.toString` caller.
 * @type {Function}
 */
const objectToStringCaller = Object.prototype.toString;

/**
 * Cached `Function.prototype.toString` caller.
 * @type {Function}
 */
const funcToStringCaller = Function.prototype.toString;

/**
 * Used to generate unique IDs
 * @type {Object}
 */
let idCounters = {};

/**
 * Casts given object to Array
 * @param {*} object
 * @param {boolean} [compactArr=false]
 * @returns {Array}
 */
export function castArr(object, compactArr) {
  if(_.isArray(object)) return object;
  if(_.isArguments(object)) return Array.prototype.slice.call(object);
  return compactArr ? compact([object]) : [object];
};

/**
 * Removes all falsey values from array.
 * Falsey values `false`, `null`, `0`, `""`, `undefined`, and `NaN`.
 * @param {Array} array
 * @returns {Array}
 */
export function compact(array) {
  var i = - 1, index = 0, result = []
    , length = (array = castArr(array)) ? array.length : 0;
  while(++ i < length) if(array[i]) result[index ++] = array[i];
  return result;
};

/**
 * Creates function that returns `value`.
 * @param {*} value
 * @returns {function(...)}
 */
export function constant(value) {
  return function() {
    return value;
  };
};

/**
 * Passes `value` through.
 * @param {*} value
 * @returns {*}
 */
export function through(value) {
  return value;
};

/**
 * Returns value if not undefined or null, otherwise returns defaults or $__NULL__$ value.
 * @see https://github.com/imkrimerman/im.val (npm version without current enhancements)
 * @param {*} value - value to check
 * @param {*} [defaults] - default value to use
 * @param {?function(...)|function(...)[]} [checker] - function to call to check validity
 * @param {?string} [match='any'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {*}
 */
export function val(value, defaults, checker, match) {
  // if defaults not specified then assign UNDEFINED Symbol
  defaults = arguments.length > 1 ? defaults : UNDEFINED;
  // if we don't have any `value` then return `defaults`
  if(! arguments.length) return defaults;
  // if value check was made and it's not valid then return `defaults`
  if(! valCheck(value, checker, match)) return defaults;
  // if value not specified return defaults, otherwise return value;
  return value != null ? value : defaults;
};

/**
 * Validates value with the given checkers
 * @param {*} value - value to check
 * @param {Array|function(...)} checkers - function to call to check validity
 * @param {?string} [match='some'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {boolean}
 */
export function valCheck(value, checkers, match) {
  // if value and checker is specified then use it to additionally check value
  if(! _.isArray(checkers) && ! _.isFunction(checkers)) return true;
  return _[match || 'some'](castArr(checkers), function(check) {
    if(_.isFunction(check)) return check(value);
  });
};

/**
 * Returns `value` if `includes` array contains `value` or returns defaults otherwise.
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {Array|Object} [includes] - array of values to check if the value is contained there
 * @param {?string} [match='some'] - function to use ('every', 'any', 'some') 'any' === 'some'
 * @returns {*}
 */
export function valIncludes(value, defaults, includes, match) {
  if(includes == null) includes = ['every', 'some', 'any'];
  if(_.isPlainObject(includes)) includes = _.keys(includes);
  return val(value, defaults, function(val) {
    return _.includes(includes, val);
  }, match || 'some');
};

/**
 * Applies `val` function and calls callback with result as first argument
 * @param {*} value - value to check
 * @param {*} defaults - default value to use
 * @param {function(...)} cb - callback to call after check
 * @param {?function(...)} [checker] - function to call to check validity
 * @param {?string} [match='every'] - function to use ('every', 'some')
 * @returns {*}
 */
export function valCb(value, defaults, cb, checker, match) {
  var value = val(value, defaults, checker, match);
  if(! _.isFunction(cb)) return value;
  return cb(value);
};

/**
 * Applies `val` checker function and extends checked value with `extender` if allowed.
 * @param {*} value - value to check
 * @param {Object} extender - object to extend with
 * @param {function(...)|string} [method=_.defaults] - function to use to merge the objects (can be
 * lodash method name or function)
 * @param {boolean} [toOwn=false] - if true then sets extender directly to checked value,
 * otherwise creates new object and merges checked value with extender
 * @param {string} [match='every'] - function to use ('every', 'some')
 * @returns {Object|function(...)}
 */
export function valMerge(value, extender, method, toOwn, match) {
  method = val(method, _.defaults, [_.isFunction, _.isString]);
  if(_.isString(method) && _.has(_, method)) method = _[method];
  toOwn = val(toOwn, false, _.isBoolean);
  return valCb(value, {}, function(checked) {
    var args = toOwn ? [checked, extender] : [{}, checked, extender];
    if(! _.isPlainObject(args)) return checked;
    return method.apply(_, args);
  }, _.isPlainObject, match);
};

/**
 * Checks if value is defined
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isDef(value) {
  if(! arguments.length) return false;
  return val(value) !== UNDEFINED;
}

