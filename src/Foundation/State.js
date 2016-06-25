import Emitter from '../Events/Emitter';
import {Map, List} from 'immutable';
import * as _ from 'lodash';

/**
 * `Cloud` Map to hold all references pointing to every created State.
 * @type {WeakMap}
 */
export let CloudStates = new WeakMap();

/**
 * Fiber State.
 * @class
 * @extends {Emitter}
 **/
export default class State extends Emitter {

  /**
   * Constructs State.
   * @param {Object|ImmutableMap} [state]
   * @param {Object} [options={}]
   */
  constructor(state, options = {}) {
    super(options);
    State.reset(this, state, true);
  }

  /**
   * Returns State size.
   * @returns {number}
   */
  get size() {
    return this.current.size;
  }

  /**
   * Sets new size for `State`.
   * Internally `take()` will be called.
   * @param {number} newSize
   */
  set size(newSize) {
    State.reset(this, this.current.take(newSize));
  }

  /**
   * Returns `current` State.
   * @returns {ImmutableMap}
   */
  get current() {
    return CloudStates.get(this);
  }

  /**
   * Sets `current` State.
   * @param {ImmutableMap} state
   */
  set current(state) {
    State.reset(this, state);
  }

  /**
   * Returns value at a `key`.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {*}
   */
  get(key, defaults) {
    if (! arguments.length) return this.current;
    if (this.isPath(key)) {
      var result = this.current.getIn(this.toPath(key));
    } else {
      result = this.current.get(key);
    }
    return result !== void 0 ? result : defaults;
  }

  /**
   * Sets `value` to a `key`.
   * @param {string} key
   * @param {any} value
   * @returns {State}
   */
  set(key, value) {
    let current = this.current;
    this.fire('changing', key, value, this);

    if (arguments.length === 1) {
      if (State.isState(key)) key = key.current.toObject();
      State.reset(this, current.mergeDeep(key));
      _.entries(key).forEach(([oneKey, oneValue]) => {
        this.fire('changed:' + oneKey, oneValue, this);
      });
    } else if (this.isPath(key)) {
      State.reset(this, current.setIn(this.toPath(key), value));
      this.fire('changed:' + key, value, this);
    } else {
      State.reset(this, current.set(key, value));
      this.fire('changed:' + key, value, this);
    }

    this.fire('changed', key, value, this);
    return this;
  }

  /**
   * Determines if State has given `key`.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.isPath(key) ? this.current.hasIn(this.toPath(key)) : this.current.has(key);
  }

  /**
   * Deletes value at a key.
   * @param {string} key
   * @returns {any}
   */
  forget(key) {
    let value = this.get(key);
    let current = this.current;

    this.fire('forgetting', key, value, this);

    if (this.isPath(key)) {
      State.reset(this, current.deleteIn(this.toPath(key)));
      this.fire('forgot:' + key, value, this);
    } else {
      State.reset(this, current.delete(key));
      this.fire('forgot:' + key, value, this);
    }

    this.fire('forgot', key, value, this);
    return value;
  }

  /**
   * Mutates State with the given `mutator`.
   * Every time you call one of the above functions, a new immutable Map is created.
   * If a pure function calls a number of these to produce a final return value,
   * then a penalty on performance and memory has been paid by creating all of the intermediate immutable Maps.
   * If you need to apply a series of mutations to produce a new immutable Map,
   * `mutate()` creates a temporary mutable copy of the Map which can apply mutations
   * in a highly performant manner. In fact, this is exactly how complex mutations like merge are done.
   * @param {Function} mutator
   * @returns {State}
   */
  mutate(mutator) {
    let previous = this.current.all();
    let state = new State(this.current.withMutations(mutator));
    this.fire('mutated', previous, state, this);
    return state;
  }

  /**
   * Returns all keys in an Array/ImmutableList.
   * @param {boolean} [toArray=false]
   * @returns {Array|ImmutableList}
   */
  keys(toArray = false) {
    let it = this.current.keys();
    return toArray ? it.toArray() : List.of(it);
  }

  /**
   * Returns all values in an Array/ImmutableList.
   * @param {boolean} [toArray=false]
   * @returns {Array|ImmutableList}
   */
  values(toArray = false) {
    let it = this.current.values();
    return toArray ? it.toArray() : List.of(it);
  }

  /**
   * Returns all keys and values in a single Array/ImmutableList.
   * @param {boolean} [toArray=false]
   * @returns {Array|ImmutableList}
   */
  entries(toArray = false) {
    let it = this.current.entries();
    return toArray ? it.toArray() : List.of(it);
  }

  /**
   * Updates current State at a `key` with the `updater`, it can be a function that will update current value.
   * @param {string|Function} key
   * @param {any|Function} [updater]
   * @returns {State}
   */
  update(key, updater) {
    let current = this.current;
    if (this.isPath(key)) {
      State.reset(this, current.updateIn(this.toPath(key), updater));
    } else {
      State.reset(this, current.update(key, updater));
    }
    return this;
  }

  /**
   * Resets State with the given object.
   * @param {Object} [state={}]
   * @return {State}
   */
  reset(state = {}) {
    this.fire('resetting', state, this.current, this);
    State.reset(this, state, true);
    this.fire('reset', state, this.current, this);
    return this;
  }

  /**
   * Flushes State.
   * @returns {State}
   */
  flush() {
    let current = this.current;
    this.fire('flushing', current, this);
    State.reset(this, current.clear());
    this.fire('flushed', this.current, this);
    return this;
  }

  /**
   * Clones State.
   * @returns {State}
   */
  clone() {
    return new State(this.toPlain(), this.options);
  }

  /**
   * Returns a new State resulting from merging the provided object (JS object or Immutable.Map) into this State.
   * In other words, this takes each entry of each iterable and sets it on this State.
   * @param {Object|ImmutableMap} object
   * @returns {State}
   */
  merge(object) {
    State.reset(this, this.current.merge(object));
    return this;
  }

  /**
   * Like `merge()`, but when two objects conflict, it merges them as well, recursing deeply through the nested data.
   * @param {Object|ImmutableMap} object
   * @returns {State}
   */
  mergeDeep(object) {
    State.reset(this, this.current.mergeDeep(object));
    return this;
  }

  /**
   * Returns a new State with values passed through a mapper function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {State}
   */
  map(mapper, scope) {
    return new State(this.current.map(mapper, scope));
  }

  /**
   * Returns a new State with only the entries for which the predicate function returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {State}
   */
  filter(predicate, scope) {
    return new State(this.current.filter(predicate, scope));
  }

  /**
   * Returns a new State with only the entries for which the predicate function returns false.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {State}
   */
  filterNot(predicate, scope) {
    return new State(this.current.filterNot(predicate, scope));
  }

  /**
   * Returns a new State in reverse order.
   * @returns {State}
   */
  reverse() {
    return new State(this.current.reverse());
  }

  /**
   * Returns a new State which includes the same entries, stably sorted by using a comparator.
   * @param {Function} comparator
   * @returns {State}
   */
  sort(comparator) {
    return new State(this.current.sort(comparator));
  }

  /**
   * Like sort, but also accepts a `mapper` which allows for sorting by more sophisticated means.
   * @param {Function} mapper
   * @param {Function} comparator
   * @returns {State}
   */
  sortBy(mapper, comparator) {
    return new State(this.current.sortBy(mapper, comparator));
  }

  /**
   * Returns a new State, grouped by the return value of the grouper function.
   * @param {Function} grouper
   * @param {Object} [scope]
   * @returns {State}
   */
  groupBy(grouper, scope) {
    return new State(this.current.groupBy(grouper, scope));
  }

  /**
   * The `iteratee` is executed for every entry in the State.
   * Unlike `Array#forEach`, if any call of `iteratee` returns `false`, the iteration will stop.
   * Returns the number of entries iterated (including the last iteration which returned false).
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {State}
   */
  forEach(iteratee, scope) {
    this.current.forEach(iteratee, scope);
    return this;
  }

  /**
   * Returns a new State containing all entries except the first.
   * @returns {State}
   */
  rest() {
    return new State(this.current.rest());
  }

  /**
   * Returns a new State containing all entries except the last.
   * @returns {State}
   */
  butLast() {
    return new State(this.current.butLast());
  }

  /**
   * Returns a new State which excludes the first amount entries from this State.
   * @param {number} amount
   * @returns {State}
   */
  skip(amount) {
    return new State(this.current.skip(amount));
  }

  /**
   * Returns a new State which includes the first amount entries from this State.
   * @param {number} amount
   * @returns {State}
   */
  take(amount) {
    return new State(this.current.take(amount));
  }

  /**
   * Flattens nested States.
   * Will deeply flatten the State by default, but a depth can be provided in the form of a number or boolean (where
   * `true` means to shallowly flatten one level). A depth of 0 (or shallow: false) will deeply flatten.
   * Flattens only others State, not Arrays or Objects.
   * Note: flatten(true) operates on State> and returns State
   * @param {number|boolean} depth
   * @returns {State}
   */
  flatten(depth) {
    return new State(this.current.flatten(depth));
  }

  /**
   * Reduces the State to a value by calling the reducer for every entry in the State and
   * passing along the reduced value.
   * @param {Function} reducer
   * @param {any} initial
   * @param {Object} [scope]
   * @returns {any}
   */
  reduce(reducer, initial, scope) {
    return this.current.reduce(reducer, initial, scope);
  }

  /**
   * True if predicate returns true for all entries in the State.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {boolean}
   */
  every(predicate, scope) {
    return this.current.every(predicate, scope);
  }

  /**
   * True if predicate returns true for any entry in the State.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {boolean}
   */
  some(predicate, scope) {
    return this.current.some(predicate, scope);
  }

  /**
   * Joins values together as a string, inserting a separator between each.
   * @param {string|Symbol} [separator=',']
   * @returns {string}
   */
  join(separator = ',') {
    return this.current.join(separator);
  }

  /**
   * Returns the first value for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @param {any} [defaults]
   * @returns {any}
   */
  find(predicate, scope, defaults) {
    return this.current.find(predicate, scope, defaults);
  }

  /**
   * Returns the first [key, value] entry for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @param {any} [defaults]
   * @returns {Array|any}
   */
  findEntry(predicate, scope, defaults) {
    return this.current.findEntry(predicate, scope, defaults);
  }

  /**
   * Returns the key for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {string|void}
   */
  findKey(predicate, scope) {
    return this.current.findKey(predicate, scope);
  }

  /**
   * Returns the key associated with the `search value`, or `undefined`.
   * @param {any} searchValue
   * @returns {string|void}
   */
  keyOf(searchValue) {
    return this.current.keyOf(searchValue);
  }

  /**
   * Returns a new State with keys passed through a `mapper` function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {State}
   */
  mapKeys(mapper, scope) {
    return new State(this.current.mapKeys(mapper, scope));
  }

  /**
   * Returns a new State with entries ([key, value] tuples) passed through a `mapper` function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {State}
   */
  mapEntries(mapper, scope) {
    return new State(this.current.mapEntries(mapper, scope));
  }

  /**
   * Determines if State is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.current.isEmpty();
  }

  /**
   * Returns all items.
   * @returns {Object}
   */
  all() {
    return this.toPlain();
  }

  /**
   * Deeply converts this State to equivalent JS.
   * @returns {Object|Array}
   */
  toJS() {
    return this.current.toJS();
  }

  /**
   * Shallowly converts this State to an Object.
   * @returns {Object}
   */
  toObject() {
    return this.current.toObject();
  }

  /**
   * Shallowly converts this State to an Array, discarding keys.
   * @returns {Array}
   */
  toArray() {
    return this.current.toArray();
  }

  /**
   * Converts this State to a Map, maintaining the order of iteration.
   * @returns {ImmutableOrderedMap}
   */
  toOrderedMap() {
    return this.current.toOrderedMap();
  }

  /**
   * Converts this State to a Set, discarding keys. Throws if values are not hashable.
   * @returns {ImmutableSet}
   */
  toSet() {
    return this.current.toSet();
  }

  /**
   * Shallowly converts this State to an Array, discarding keys.
   * @returns {ImmutableOrderedSet}
   */
  toOrderedSet() {
    return this.current.toOrderedSet();
  }

  /**
   * Converts this State to a List, discarding keys.
   * @returns {ImmutableList}
   */
  toList() {
    return this.current.toList();
  }

  /**
   * Converts this State to a Stack, discarding keys.
   * @returns {ImmutableStack}
   */
  toStack() {
    return this.current.toStack();
  }

  /**
   * Converts `key` to path
   * @param {Array|string} key
   * @returns {Array}
   */
  toPath(key) {
    return _.toPath(key);
  }

  /**
   * Determines if given `key` is a path.
   * @param {Array|string} key
   * @returns {boolean}
   */
  isPath(key) {
    return _.isArray(key) || key.split('.').length > 1;
  }

  /**
   * Destroys State.
   * @returns {State}
   * @override
   */
  destroy() {
    this.fire('destroying', this.current, this);
    super.destroy();
    this.flush();
    this.options = {};
    this.fire('destroyed', this.current, this);
    return this;
  }

  /**
   * Returns object that will be serialized and used in `toPlain` and `fromPlain` methods.
   * @returns {Object}
   * @override
   */
  getSerializable() {
    return this.current.toJS();
  }

  /**
   * Generator method to iterate through State properties using for..of loop.
   * @yields {[key, value]}
   */
  * iterator() {
    let all = this.toPlain();
    let ownKeys = Reflect.ownKeys(all);
    for (let key of ownKeys) yield [key, all[key]];
  }

  /**
   * Reference to the `Cloud` States.
   * @type {WeakMap}
   * @static
   */
  static Cloud = CloudStates;

  /**
   * Determines if given object is State.
   * @param {any} state
   * @returns {boolean}
   * @static
   */
  static isState(state) {
    return state instanceof State;
  }

  /**
   * Value equality check with semantics similar to Object.is, but treats Immutable State as values,
   * equal if the second State includes equivalent values.
   * @param {Immutable} first
   * @param {Immutable} second
   * @returns {boolean}
   * @static
   */
  static is(first, second) {
    [first, second] = [first, second].map(one => State.toImmutable(one));
    return Immutable.is(first, second);
  }

  /**
   * Creates new State from alternating object and options.
   * @param {Object} [object]
   * @param {Object} [options]
   * @returns {State}
   * @static
   */
  static of(object, options) {
    return new State(object, options);
  }

  /**
   * Resets `State` of the scope to the given `Map`.
   * @param {State} instance
   * @param {State|ImmutableMap|Object} state
   * @param {boolean} [prepare=false]
   * @returns {State}
   * @static
   */
  static reset(instance, state, prepare = false) {
    CloudStates.set(instance, prepare ? State.toImmutable(state) : state);
    return instance;
  }

  /**
   * Prepares `Object` to reset State, internally converts to Immutable Map.
   * @param {State|ImmutableMap|Object} object
   * @returns {ImmutableMap}
   * @static
   */
  static toImmutable(object) {
    return Map(State.isState(object) && object.current || object);
  }
}
