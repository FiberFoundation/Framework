import sinon from 'sinon';
import chai from 'chai';
import * as _ from 'lodash';

/**
 * Fiber Test Suite
 * @class
 */
export default class TestSuite {

  /**
   * Constructs Test Suite
   * @param {string} name
   * @param {Object} test
   * @param {Object} [options={}]
   */
  constructor(name, test, options) {
    this._spies = [];
    this.name = name;
    this.test = test;
    
    this.options = _.defaults(options, {
      chai: 'expect',
      autoStart: true,
      prefix: 'Fiber.',
      initialize: null,
      exports: {}
    });
    
    this.exports = _.extend({}, this.options.exports, {
      expect: chai.expect,
      chai: chai,
      suite: this
    });

    if (this.options.chai) chai[this.options.chai]();
    if (this.options.initialize) _.result(this.options, 'initialize');
    if (this.options.autoStart) this.run();
  }

  /**
   * Runs test.
   * @return {TestSuite}
   */
  run() {
    describe(this.options.prefix + this.name, this.test.bind(this.exports));
    return this;
  }

  /**
   * Sets spy to the `object` `method`.
   * @param {Object} object
   * @param {string} method
   * @returns {function(...)}
   */
  setSpy(object, method) {
    let spy = this.getSpy(object, method);
    if (spy) this.forgetSpy(object, method);
    spy = sinon.spy(object, method);
    this._spies.push({object: object, method: method, spy: spy});
    return spy;
  }

  /**
   * Returns spy.
   * @param {Object} object
   * @param {string} method
   * @returns {function(...)|void}
   */
  getSpy(object, method) {
    for (var i = 0; i < this._spies; i ++) {
      if (this._spies[i].object === object && this._spies[i].method === method) {
        return this._spies[i].spy;
      }
    }
    return void 0;
  }

  /**
   * Removes spy for the given `object` `method`.
   * @param {Object} object
   * @param {string} method
   * @returns {TestSuite}
   */
  forgetSpy(object, method) {
    for (var i = 0; i < this._spies; i ++) {
      if (this._spies[i].object === object && this._spies[i].method === method) {
        this._spies[i].restore();
        this._spies[i].splice(i, 1);
        break;
      }
    }
    return this;
  }

  /**
   * Removes all spies.
   * @returns {TestSuite}
   */
  forgetAllSpies() {
    for (var i = 0; i < this._spies; i ++) this._spies[i].restore();
    this._spies = [];
    return this;
  }
}
