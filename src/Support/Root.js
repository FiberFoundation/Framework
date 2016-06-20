/**
 * Checks if `value` can be potential global object.
 * @param {any} value
 * @returns {null|Object}
 * @private
 */
function check(value) {
  return (value && value.Object === Object) ? value : null;
}

/** Detect free variable `global` from Node.js. */
const freeGlobal = check(typeof global == 'object' && global);

/** Detect free variable `self`. */
const freeSelf = check(typeof self == 'object' && self);

/** Detect `this` as the global object. */
const thisGlobal = check(typeof this == 'object' && this);

/** Used as a reference to the global object. */
const root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

/** Export default root. */
export default root;
