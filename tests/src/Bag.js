import TestSuite from '../support/TestSuite';
import Bag from '../../src/Foundation/Bag';
import chai from 'chai';
import * as _ from 'lodash';

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

    this._bag.set({newKey: 'newValue'});
    expect(this._bag.get('newKey')).to.be.equal('newValue');
    expect(this._bag.get('key2')).to.be.undefined;
  });

  it('`has`: should check if value is one of items.', function() {
    expect(this._bag.has('key')).to.be.true;
    expect(this._bag.has('obj.objKey')).to.be.true;
    expect(this._bag.has('arr[1]')).to.be.true;
    expect(this._bag.has('arr[5]')).to.be.false;
    expect(this._bag.has('obj2')).to.be.false;
  });

  it('`forget`: should delete value from items.', function() {
    expect(this._bag.forget('key')).to.be.equal('value');
    expect(this._bag.all()).to.eql({
      obj: {objKey: 'objValue'},
      arr: [1, 2, 3]
    });

    expect(this._bag.forget('obj.objKey')).to.be.equal('objValue');
    expect(this._bag.all()).to.eql({
      obj: {},
      arr: [1, 2, 3]
    });

    expect(this._bag.forget('arr[1]')).to.be.equal(2);
    expect(this._bag.all()).to.eql({
      obj: {},
      arr: [1, , 3]
    });
  });

  it('`retrieve`: should retrieve value from items and if function then call it.', function() {
    expect(this._bag.retrieve('key')).to.be.equal('value');
    expect(this._bag.retrieve('obj.objKey')).to.be.equal('objValue');
    expect(this._bag.retrieve('arr[1]')).to.be.equal(2);

    let fn = () => 1
    this._bag.set('fn', fn);
    expect(this._bag.retrieve('fn')).to.be.equal(1);
  });

  it('`keys`: should return keys of items.', function() {
    expect(this._bag.keys()).to.be.eql(_.keys(this._bag.all()));
  });

  it('`values`: should return value of items.', function() {
    expect(this._bag.values()).to.be.eql(_.values(this._bag.all()));
  });

  it('`pick`: should return an object composed of the picked object keys from items.', function() {
    expect(this._bag.pick('obj')).to.be.eql(_.pick(this._bag.all(), 'obj'));
    expect(this._bag.pick(['key', 'arr'])).to.be.eql(_.pick(this._bag.all(), ['key', 'arr']));
  });

  it('`omit`: should return an object with all keys from items that are not omitted.', function() {
    expect(this._bag.omit('obj')).to.be.eql(_.omit(this._bag.all(), 'obj'));
    expect(this._bag.omit(['key', 'arr'])).to.be.eql(_.omit(this._bag.all(), ['key', 'arr']));
  });

  it('`merge`: should merge object to the items.', function() {
    this._bag.merge({key: 'value2', newKey: 'newKey', obj: {objKey2: 'objValue'}});
    expect(this._bag.all()).to.be.eql({
      key: 'value2',
      obj: {objKey: 'objValue', objKey2: 'objValue'},
      arr: [1, 2, 3],
      newKey: 'newKey'
    });
  });

  it('`mix`: should mix object to the items.', function() {
    this._bag.mix({key: 'value2', newKey: 'newKey', obj: {objKey2: 'objValue'}});
    expect(this._bag.all()).to.be.eql({
      key: 'value2',
      obj: {objKey2: 'objValue'},
      arr: [1, 2, 3],
      newKey: 'newKey'
    });
  });

  it('`each`: should traverse items.', function() {
    let keys = [];
    this._bag.each((value, key) => {
      keys.push(key);
    });

    expect(keys).to.be.eql(this._bag.keys());
  });

  it('`map`: should map items.', function() {
    let mapped = this._bag.map((value, key) => {
      return key;
    });

    expect(mapped).to.be.eql(this._bag.keys());
  });
});
