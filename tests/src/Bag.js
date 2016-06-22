import TestSuite from '../support/TestSuite';
import Bag from '../../src/Foundation/Bag';
import chai from 'chai';

let expect = chai.expect;

let Suite = new TestSuite('Bag', function() {

  beforeEach(function() {
    this._bag = new Bag({
      key: 'value',
      obj: {objKey: 'objValue'},
      arr: [1, 2, 3]
    });
  });

  afterEach(function() {
    this._bag = null;
  });

  it('`new`: should be properly constructed.', function() {
    
  });
});
