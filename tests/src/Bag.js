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
    }, {
      option: 'optionValue'
    });
  });

  afterEach(function() {
    this._bag = null;
  });

  it('`new`: should be properly constructed.', function() {
    expect(this._bag).to.have.property('options');
    expect(this._bag.options).to.be.eql({
      option: 'optionValue'
    });

    expect(this._bag.all()).to.be.eql({
      key: 'value',
      obj: {objKey: 'objValue'},
      arr: [1, 2, 3]
    });
  });

  it('`get`: should retrieve value from items.', function() {
    expect(this._bag.get('key')).to.be.equal('value');
    expect(this._bag.get('obj.objKey')).to.be.equal('objValue');
    expect(this._bag.get('arr[1]')).to.be.equal(2);
  });

  it('`set`: should set value to items.', function() {
    this._bag.set('key2', 'value2')
    expect(this._bag.get('key2')).to.be.equal('value2');

    this._bag.set('obj.objKey2', 'objValue2');
    expect(this._bag.get('obj.objKey2')).to.be.equal('objValue2');

    this._bag.set('arr[1]', 10);
    expect(this._bag.get('arr[1]')).to.be.equal(10);
  });

  it('`has`: should check if value is one of items.', function() {
    expect(this._bag.has('key')).to.be.true;
    expect(this._bag.has('obj.objKey')).to.be.true;
    expect(this._bag.has('arr[1]')).to.be.true;
    expect(this._bag.has('arr[5]')).to.be.false;
    expect(this._bag.has('obj2')).to.be.false;
  });
});
