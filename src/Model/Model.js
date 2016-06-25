import Types from '../Support/Types';
import State from '../Foundation/State';
import Emitter from '../Events/Emitter';
import * as _ from 'lodash';

/**
 * Fiber Model.
 * @class
 * @extends {Emitter}
 */
export default class Model extends Emitter {

  /**
   * Determines if given `object` is Model.
   * @param {any} object
   * @returns {boolean}
   * @static
   */
  static isModel(object) {
    return object instanceof Model;
  }

  /**
   * Creates new Model from alternating object and options.
   * @param {Object|ImmutableMap|State} [state]
   * @param {Object} [options]
   * @returns {Model}
   * @static
   */
  static of(state, options) {
    return new Model(state, options);
  }

  /**
   * Data Types known to Fiber.
   * @type {Object}
   * @static
   */
  static Types = Types;

  /**
   * Model immutable State instance.
   * @type {State}
   * @static
   * @private
   */
  state = new State();

  /**
   * The connection name for the Model.
   * @param {string}
   */
  connection = 'remote';

  /**
   * Model attributes schema.
   * @type {Object|boolean|void}
   */
  schema = false;

  /**
   * The attributes that aren't auto extendable from options.
   * @type {Array}
   */
  guarded = ['state'];

  /**
   * Constructs Model.
   * @param {Object|ImmutableMap|State} state
   * @param {Object} [options]
   */
  constructor(state, options) {
    super(options);
    this.handleOptions(options);
    this.reset(state);
  }

  /**
   * Handles incoming options, saves to the Model and extends.
   * @param {Object} [options={}]
   * @returns {Model}
   */
  handleOptions(options) {
    if (_.isEmpty(options)) return this;
    this.options = _.clone(options);
    _.assign(this, _.omit(this.options, this.guarded));
    return this;
  }

  /**
   * Returns Model size.
   * @returns {number}
   */
  get size() {
    return this.state.size;
  }

  /**
   * Returns `value` at the given `key` or `defaults` if not exists.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  get(key, defaults) {
    return this.state.get(key, defaults);
  }

  /**
   * The same as `get()`, but returns the HTML-escaped version of a Model's attribute.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {string}
   */
  escape(key, defaults) {
    return _.escape(this.get(key, defaults));
  }

  /**
   * Sets `value` at the given `key`.
   * @param {string|Object} key
   * @param {any} [value]
   * @returns {Model}
   */
  set(key, value) {
    if (_.isPlainObject(key)) return this.mergeDeep(key);
    this.state.set(key, value);
    return this;
  }

  /**
   * Determines if key exists.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.state.has(key);
  }

  /**
   * Removes and returns `value` at the given `key`.
   * @param {string} key
   * @returns {any}
   */
  forget(key) {
    return this.state.forget(key);
  }

  /**
   * Resolves `value` by the given `key` and if `value` is function then it will be called and always returned.
   * @param {string} key
   * @param {any} [defaults]
   * @returns {any}
   */
  retrieve(key, defaults) {
    let result = this.get(key, defaults);
    if (! _.isFunction(result)) return result;
    return result();
  }

  /**
   * Returns all keys.
   * @returns {Array}
   */
  keys() {
    return this.state.keys();
  }

  /**
   * Returns all values.
   * @returns {Array}
   */
  values() {
    return this.state.values();
  }

  /**
   * Returns all keys and values in single Array.
   * @returns {Array}
   */
  entries() {
    return this.state.entries();
  }

  /**
   * Returns an object composed of the picked object `keys`.
   * @param {string|Array<string>} keys
   * @returns {State}
   */
  pick(keys) {
    return new State(_.pick(this.toPlain(), keys));
  }

  /**
   * Returns an object with all keys that are not omitted.
   * @param {string|Array.<string>} keys
   * @returns {State}
   */
  omit(keys) {
    return new State(_.omit(this.toPlain(), keys));
  }

  /**
   * Merges object with current items.
   * @param {Object} object
   * @returns {Model}
   */
  merge(object) {
    this.state.merge(object);
    return this;
  }

  /**
   * Like `merge()`, but when two objects conflict, it merges them as well, recursing deeply through the nested data.
   * @param {Object} object
   * @returns {Model}
   */
  mergeDeep(object) {
    this.state.mergeDeep(object);
    return this;
  }

  /**
   * The `iteratee` is executed for every entry in the State.
   * Unlike `Array#forEach`, if any call of `iteratee` returns `false`, the iteration will stop.
   * Returns the number of entries iterated (including the last iteration which returned false).
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {Model}
   */
  forEach(iteratee, scope) {
    this.state.forEach(iteratee, scope);
    return this;
  }

  /**
   * Maps items in a Model State.
   * @param {Function} iteratee
   * @param {Object} [scope]
   * @returns {State}
   */
  map(iteratee, scope) {
    return this.state.map(iteratee, scope);
  }

  /**
   * Returns a new State with only the entries for which the predicate function returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {State}
   */
  filter(predicate, scope) {
    return this.state.filter(predicate, scope);
  }

  /**
   * Returns a new State with only the entries for which the predicate function returns false.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {State}
   */
  filterNot(predicate, scope) {
    return this.state.filterNot(predicate, scope);
  }

  /**
   * Returns a new State in reverse order.
   * @returns {State}
   */
  reverse() {
    return this.state.reverse();
  }

  /**
   * Returns a new State which includes the same entries, stably sorted by using a comparator.
   * @param {Function} comparator
   * @returns {State}
   */
  sort(comparator) {
    return this.state.sort(comparator);
  }

  /**
   * Like sort, but also accepts a `mapper` which allows for sorting by more sophisticated means.
   * @param {Function} mapper
   * @param {Function} comparator
   * @returns {State}
   */
  sortBy(mapper, comparator) {
    return this.state.sortBy(mapper, comparator);
  }

  /**
   * Returns a new State, grouped by the return value of the grouper function.
   * @param {Function} grouper
   * @param {Object} [scope]
   * @returns {State}
   */
  groupBy(grouper, scope) {
    return this.state.groupBy(grouper, scope);
  }

  /**
   * Returns a new State containing all entries except the first.
   * @returns {State}
   */
  rest() {
    return this.state.rest();
  }

  /**
   * Returns a new State containing all entries except the last.
   * @returns {State}
   */
  butLast() {
    return this.state.butLast();
  }

  /**
   * Returns a new State which excludes the first amount entries from this State.
   * @param {number} amount
   * @returns {State}
   */
  skip(amount) {
    return this.state.skip(amount);
  }

  /**
   * Returns a new State which includes the first amount entries from this State.
   * @param {number} amount
   * @returns {State}
   */
  take(amount) {
    return this.state.take(amount);
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
    return this.state.flatten(depth);
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
    return this.state.reduce(reducer, initial, scope);
  }

  /**
   * True if predicate returns true for all entries in the State.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {boolean}
   */
  every(predicate, scope) {
    return this.state.every(predicate, scope);
  }

  /**
   * True if predicate returns true for any entry in the State.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {boolean}
   */
  some(predicate, scope) {
    return this.state.some(predicate, scope);
  }

  /**
   * Joins values together as a string, inserting a separator between each.
   * @param {string|Symbol} [separator=',']
   * @returns {string}
   */
  join(separator = ',') {
    return this.state.join(separator);
  }

  /**
   * Returns the first value for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @param {any} [defaults]
   * @returns {any}
   */
  find(predicate, scope, defaults) {
    return this.state.find(predicate, scope, defaults);
  }

  /**
   * Returns the first [key, value] entry for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @param {any} [defaults]
   * @returns {any}
   */
  findEntry(predicate, scope, defaults) {
    return this.state.findEntry(predicate, scope, defaults);
  }

  /**
   * Returns the key for which the `predicate` returns true.
   * @param {Function} predicate
   * @param {Object} [scope]
   * @returns {string|void}
   */
  findKey(predicate, scope) {
    return this.state.findKey(predicate, scope);
  }

  /**
   * Returns the key associated with the `search value`, or `undefined`.
   * @param {any} searchValue
   * @returns {string|void}
   */
  keyOf(searchValue) {
    return this.state.keyOf(searchValue);
  }

  /**
   * Returns a new State with keys passed through a `mapper` function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {State}
   */
  mapKeys(mapper, scope) {
    return this.state.mapKeys(mapper, scope);
  }

  /**
   * Returns a new State with entries ([key, value] tuples) passed through a `mapper` function.
   * @param {Function} mapper
   * @param {Object} [scope]
   * @returns {State}
   */
  mapEntries(mapper, scope) {
    return this.state.mapEntries(mapper, scope);
  }

  /**
   * Returns Model's State.
   * @returns {State}
   */
  all() {
    return new State(this.toPlain());
  }

  /**
   * Clones bag items.
   * @returns {Model}
   */
  clone() {
    return new Model(this.toPlain(), this.options);
  }

  /**
   * Flushes items.
   * @return {Model}
   */
  flush() {
    return this.reset();
  }

  /**
   * Resets items with the given `object`
   * @param {Object|ImmutableMap|State} [attributes={}]
   * @param {Object} [options=this.options]
   * @returns {Model}
   */
  reset(attributes = {}, options = this.options) {
    if (this.schema) {
      attributes = _.pick(State.prepareToReset(attributes).toObject(), this.schema);
    }

    this.state = new State(attributes, options);
    this.when(this.state, 'all', this.fire.bind(this));
    return this;
  }

  /**
   * Determines if State is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.state.isEmpty();
  }

  /**
   * Converts to Plain object.
   * @returns {Object}
   * @override
   */
  toPlain() {
    return this.state.toPlain();
  }

  /**
   * Destroys Model.
   * @returns {Model}
   * @override
   */
  destroy() {
    super.destroy();
    this.flush();
    return this;
  }

  /**
   * Generator method to iterate through items using for..of loop.
   */
  * iterator() {
    let all = this.toPlain();
    for (let key in all) yield [key, all[key]];
  }
}
