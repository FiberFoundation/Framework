import Emitter from '../Events/Emitter';
import Path from '../Support/Path';
import {Map, List} from 'immutable';
import * as _ from 'lodash';

/**
 * Container to hold guarded Synthetic Collection attributes.
 * @type {WeakMap}
 */
let Guarded = new WeakMap();

/**
 * Fiber Synthetic.
 * @class
 * @extends {Serializable}
 **/
export default class Synthetic extends Emitter {

  /**
   * Constructs Synthetic Collection.
   * @param {Object|Immutable} [attributes]
   * @param {Object} [options={}]
   */
  constructor(attributes, options = {}) {
    super(options);
    this.reset(attributes);
    this.options = _.clone(options);
  }

  /**
   * Guards `attributes` from being directly retrieved and set by creating accessors and moving them out of Collection.
   * Once `guard()` is called, you cannot configure `attributes` descriptor.
   * @returns {boolean}
   */
  guard() {
    if (this.hasOwnProperty('attributes')) {
      Guarded.set(this, this.attributes);
      delete this.attributes;
    }

    return Reflect.defineProperty(this, 'attributes', {
      get: function() {
        return Guarded.get(this);
      },
      set: function(immutable) {
        Guarded.set(this, immutable);
      }
    });
  }

  /**
   * Returns current Collection size.
   * @returns {number}
   */
  get size() {
    return this.attributes.size;
  }

  /**
   * Sets new size for Collection.
   * Internally will call `take()` and reset with the result.
   * @param {number} newSize
   */
  set size(newSize) {
    this.reset(this.attributes.take(newSize));
  }

  /**
   * Resets with the given `attributes`.
   * @param {Object} [attributes={}]
   * @return {Synthetic}
   */
  reset(attributes = {}) {
    this.attributes = Map.isMap(attributes) ? attributes : Map(attributes);
    this.onChange(this.attributes);
    return this;
  }

  /**
   * Returns value at a `key`.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  get(key, defaults) {
    if (! arguments.length) return this.attributes;
    return Path.is(key) ? this.attributes.getIn(Path.to(key), defaults) : this.attributes.get(key, defaults);
  }


  /**
   * Sets `value` to a `key`.
   * @param {string|Object|ImmutableMap|any} key
   * @param {any} [value]
   * @returns {Synthetic}
   */
  set(key, value) {
    if (arguments.length === 1) return this.reset(this.attributes.mergeDeep(key));
    if (Path.is(key)) return this.reset(this.attributes.setIn(Path.to(key), value));
    return this.reset(this.attributes.set(key, value));
  }

  /**
   * Determines if given `key` is in attributes.
   * @param {string|any} key
   * @returns {boolean}
   */
  has(key) {
    return Path.is(key) ? this.attributes.hasIn(Path.to(key)) : this.attributes.has(key);
  }

  /**
   * Deletes value at a `key`.
   * @param {string|any} key
   * @returns {any}
   */
  forget(key) {
    let value = this.get(key);
    if (Path.isNot(key)) this.reset(this.attributes.delete(key));
    else this.reset(this.attributes.deleteIn(Path.to(key)));
    return value;
  }

  /**
   * Mutates Synthetic Collection with the given `mutator`.
   * Every time you call one of the above functions, a new immutable Map is created.
   * If a pure function calls a number of these to produce a final return value,
   * then a penalty on performance and memory has been paid by creating all of the intermediate immutable Maps.
   * If you need to apply a series of mutations to produce a new immutable Map,
   * `mutate()` creates a temporary mutable copy of the Map which can apply mutations
   * in a highly performant manner. In fact, this is exactly how complex mutations like merge are done.
   * @param {Function} mutator
   * @returns {Synthetic}
   */
  mutate(mutator) {
    return this.reset(this.attributes.withMutations(mutator));
  }

  /**
   * Returns all keys as Immutable List.
   * @returns {ImmutableList}
   */
  keys() {
    return List(this.attributes.keys());
  }

  /**
   * Returns all values as Immutable List.
   * @returns {ImmutableList}
   */
  values() {
    return List(this.attributes.values());
  }

  /**
   * Returns all keys and values in a single Immutable List.
   * @returns {ImmutableList}
   */
  entries() {
    return List(this.attributes.entries());
  }

  /**
   * Updates current Synthetic Collection at a `key` with the `updater`, it can be a function that will update current
   * value.
   * @param {string|Function} key
   * @param {any|Function} [updater]
   * @returns {Synthetic}
   */
  update(key, updater) {
    if (Path.isNot(key)) return this.reset(this.attributes.update(key, updater));
    return this.reset(this.attributes.updateIn(Path.to(key), updater));
  }

  /**
   * Flushes Synthetic Collection.
   * @returns {Synthetic}
   */
  flush() {
    return this.reset(this.attributes.clear());
  }

  /**
   * Clones Synthetic Collection.
   * @returns {Synthetic}
   */
  clone() {
    return this.replicate(this.toPlain(), this.options);
  }

  /**
   * Returns a new Synthetic Collection resulting from merging the provided object (JS object or Immutable.Map) into
   * this Synthetic Collection. In other words, this takes each entry of each iterable and sets it on this Synthetic
   * Collection.
   * @param {Object|ImmutableMap} object
   * @returns {Synthetic}
   */
  merge(object) {
    this.reset(this.attributes.merge(object));
    return this;
  }

  /**
   * Like `merge()`, but when two objects conflict, it merges them as well, recursing deeply through the nested data.
   * @param {Object|ImmutableMap} object
   * @returns {Synthetic}
   */
  mergeDeep(object) {
    this.reset(this.attributes.mergeDeep(object));
    return this;
  }

  /**
   * Returns a new Synthetic Collection with values passed through a mapper function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  map(mapper, scope) {
    return this.replicate(this.attributes.map(mapper, scope));
  }

  /**
   * Returns a new Synthetic Collection with only the entries for which the predicate function returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  filter(predicate, scope) {
    return this.replicate(this.attributes.filter(predicate, scope));
  }

  /**
   * Returns a new Synthetic Collection with only the entries for which the predicate function returns false.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  filterNot(predicate, scope) {
    return this.replicate(this.attributes.filterNot(predicate, scope));
  }

  /**
   * Returns a new Synthetic Collection in reverse order.
   * @returns {Synthetic}
   */
  reverse() {
    return this.replicate(this.attributes.reverse());
  }

  /**
   * Returns a new Synthetic Collection which includes the same entries, stably sorted by using a comparator.
   * @param {Function} comparator
   * @returns {Synthetic}
   */
  sort(comparator) {
    return this.replicate(this.attributes.sort(comparator));
  }

  /**
   * Like sort, but also accepts a `mapper` which allows for sorting by more sophisticated means.
   * @param {Function} mapper
   * @param {Function} comparator
   * @returns {Synthetic}
   */
  sortBy(mapper, comparator) {
    return this.replicate(this.attributes.sortBy(mapper, comparator));
  }

  /**
   * Returns a new Synthetic Collection, grouped by the return value of the grouper function.
   * @param {Function} grouper
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  groupBy(grouper, scope) {
    return this.replicate(this.attributes.groupBy(grouper, scope));
  }

  /**
   * The `iteratee` is executed for every entry in the Synthetic Collection.
   * Unlike `Array#forEach`, if any call of `iteratee` returns `false`, the iteration will stop.
   * Returns the number of entries iterated (including the last iteration which returned false).
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  forEach(iteratee, scope) {
    this.attributes.forEach(iteratee, scope);
    return this;
  }

  /**
   * Returns a new Synthetic Collection containing all entries except the first.
   * @returns {Synthetic}
   */
  rest() {
    return this.replicate(this.attributes.rest());
  }

  /**
   * Returns a new Synthetic Collection containing all entries except the last.
   * @returns {Synthetic}
   */
  butLast() {
    return this.replicate(this.attributes.butLast());
  }

  /**
   * Returns a new Synthetic Collection which excludes the first amount entries from this Synthetic Collection.
   * @param {number} amount
   * @returns {Synthetic}
   */
  skip(amount) {
    return this.replicate(this.attributes.skip(amount));
  }

  /**
   * Returns a new Synthetic Collection which includes the first amount entries from this Synthetic Collection.
   * @param {number} amount
   * @returns {Synthetic}
   */
  take(amount) {
    return this.replicate(this.attributes.take(amount));
  }

  /**
   * Flattens nested Synthetic Collections.
   * Will deeply flatten the Synthetic Collection by default, but a depth can be provided in the form of a number or
   * boolean (where
   * `true` means to shallowly flatten one level). A depth of 0 (or shallow: false) will deeply flatten.
   * Flattens only others Synthetic Collection, not Arrays or Objects.
   * Note: flatten(true) operates on Synthetic Collection> and returns Synthetic Collection
   * @param {number|boolean} depth
   * @returns {Synthetic}
   */
  flatten(depth) {
    return this.replicate(this.attributes.flatten(depth));
  }

  /**
   * Reduces the Synthetic Collection to a value by calling the reducer for every entry in the Synthetic Collection and
   * passing along the reduced value.
   * @param {Function} reducer
   * @param {any} initial
   * @param {Object} [scope]
   * @returns {any}
   */
  reduce(reducer, initial, scope) {
    return this.attributes.reduce(reducer, initial, scope);
  }

  /**
   * True if predicate returns true for all entries in the Synthetic Collection.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {boolean}
   */
  every(predicate, scope) {
    return this.attributes.every(predicate, scope);
  }

  /**
   * True if predicate returns true for any entry in the Synthetic Collection.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {boolean}
   */
  some(predicate, scope) {
    return this.attributes.some(predicate, scope);
  }

  /**
   * Joins values together as a string, inserting a separator between each.
   * @param {string|Symbol} [separator=',']
   * @returns {string}
   */
  join(separator = ',') {
    return this.attributes.join(separator);
  }

  /**
   * Returns the first value for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @param {any} [defaults]
   * @returns {any}
   */
  find(predicate, scope, defaults) {
    return this.attributes.find(predicate, scope, defaults);
  }

  /**
   * Returns the first [key, value] entry for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @param {any} [defaults]
   * @returns {Array|any}
   */
  findEntry(predicate, scope, defaults) {
    return this.attributes.findEntry(predicate, scope, defaults);
  }

  /**
   * Returns the key for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {string|void}
   */
  findKey(predicate, scope) {
    return this.attributes.findKey(predicate, scope);
  }

  /**
   * Returns the key associated with the `search value`, or `undefined`.
   * @param {any} searchValue
   * @returns {string|void}
   */
  keyOf(searchValue) {
    return this.attributes.keyOf(searchValue);
  }

  /**
   * Returns a new Synthetic Collection with keys passed through a `mapper` function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  mapKeys(mapper, scope) {
    return this.replicate(this.attributes.mapKeys(mapper, scope));
  }

  /**
   * Returns a new Synthetic Collection with entries ([key, value] tuples) passed through a `mapper` function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {Synthetic}
   */
  mapEntries(mapper, scope) {
    return this.replicate(this.attributes.mapEntries(mapper, scope));
  }

  /**
   * Determines if Synthetic Collection is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.attributes.isEmpty();
  }

  /**
   * Returns all items. Alias for `toPlain()`.
   * @returns {Object}
   * @alias toPlain
   */
  all() {
    return this.toPlain();
  }

  /**
   * Alias for `toJS()`.
   * @returns {Object|Array}
   * @alias toJS
   */
  toJSON() {
    return this.toJS();
  }

  /**
   * Deeply converts to equivalent JS.
   * @returns {Object|Array}
   */
  toJS() {
    return this.attributes.toJS();
  }

  /**
   * Shallowly converts to an Object.
   * @returns {Object}
   */
  toObject() {
    return this.attributes.toObject();
  }

  /**
   * Shallowly converts to an Array, discarding keys.
   * @returns {Array}
   */
  toArray() {
    return this.attributes.toArray();
  }

  /**
   * Converts to a Map, that is not maintaining the order of iteration.
   * @returns {ImmutableMap}
   */
  toMap() {
    return this.attributes;
  }

  /**
   * Converts to a Map, maintaining the order of iteration.
   * @returns {ImmutableOrderedMap}
   */
  toOrderedMap() {
    return this.attributes.toOrderedMap();
  }

  /**
   * Converts to a Set, discarding keys. Throws if values are not hashable.
   * @returns {ImmutableSet}
   */
  toSet() {
    return this.attributes.toSet();
  }

  /**
   * Shallowly converts to an Array, discarding keys.
   * @returns {ImmutableOrderedSet}
   */
  toOrderedSet() {
    return this.attributes.toOrderedSet();
  }

  /**
   * Converts to a List, discarding keys.
   * @returns {ImmutableList}
   */
  toList() {
    return this.attributes.toList();
  }

  /**
   * Converts to a Stack, discarding keys.
   * @returns {ImmutableStack}
   */
  toStack() {
    return this.attributes.toStack();
  }

  /**
   * Resets attributes with the provided `attributes`.
   * @type {Object}
   * @returns {Synthetic}
   * @alias reset
   * @override
   */
  fromPlain(attributes) {
    return this.reset(attributes);
  }

  /**
   * Returns object that will be serialized and used in `toPlain()` and `fromPlain()` methods.
   * @returns {Object}
   * @override
   */
  serializable() {
    return this.toJSON();
  }

  /**
   * Destroys State.
   * @returns {Synthetic}
   * @override
   */
  destroy() {
    super.destroy();
    this.reset();
    this.options = {};
    return this;
  }

  /**
   * On attributes change hook.
   * @param {Immutable} newAttributes
   */
  onChange(newAttributes) {}

  /**
   * Creates new instance using `Symbol.species` constructor.
   * @param {...any} args
   * @returns {Object}
   */
  replicate(...args) {
    const Species = this.getConstructor(Symbol.species);
    return new Species(...args);
  }

  /**
   * Returns Object constructor or retrieves value for the given property.
   * @param {string|Symbol} [property]
   * @returns {Constructor|any}
   */
  getConstructor(property) {
    const ConstructorFn = Reflect.getOwnPropertyDescriptor(this, 'constructor').value;
    if (! property) return ConstructorFn;
    return ConstructorFn[property];
  }

  /**
   * Generator method to iterate through properties using for..of loop.
   * @yields {[key, value]}
   */
  * iterator() {
    const all = this.all();
    const keys = Reflect.ownKeys(all);
    for (const key of keys) yield [key, all[key]];
  }

  /**
   * Specifies a function valued property that is called to convert an object to a corresponding primitive value.
   * @param {string} hint
   * @returns {string|number|boolean}
   * @meta
   */
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return this.serialize();
    else if (hint === 'number') return this.size;
    return !! this.size;
  }

  /**
   * A string value used for the default description of an object. Used by `Object.prototype.toString()`.
   * @returns {string}
   * @meta
   */
  [Symbol.toStringTag]() {
    return this.getConstructor('name');
  }

  /**
   * Returns constructor function that is used to create derived objects.
   * @returns {Constructable}
   * @static
   * @meta
   */
  static get [Symbol.species]() {
    return this;
  }

  /**
   * Determines if given `object` is instance of Synthetic.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isInstance(object) {
    if (typeof object === 'function') object = Reflect.getPrototypeOf(object);
    return object instanceof this.constructor[Symbol.species];
  }

  /**
   * Value equality check with semantics similar to Object.is, but treats Synthetic Collection as values,
   * equal if the second Synthetic Collection includes equivalent values.
   * @param {Immutable|Synthetic} first
   * @param {Immutable|Synthetic} second
   * @returns {boolean}
   * @static
   */
  static is(first, second) {
    [first, second] = [first, second].map(one => typeof one.toMap === 'function' ? one.toMap() : one);
    return Immutable.is(first, second);
  }
}
