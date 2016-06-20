import TestSuite from '../support/TestSuite';
import Class from '../../src/Foundation/Class';
import Serializer from '../../src/Serializer/Serializer';
import chai from 'chai';
import * as _ from 'lodash';

let expect = chai.expect;
let Suite = new TestSuite('Class', function() {

  beforeEach(function() {
    this._class = new Class();
  });

  afterEach(function() {
    this._class.destroy();
  });

  it('`new`: should be properly constructed.', function() {
    expect(this._class).to.have.property('options');
    expect(this._class.options).to.be.eql({});
    this._class = new Class({custom: true});
    expect(this._class.options).to.have.property('custom');
    expect(this._class.serializer).to.be.instanceof(Serializer);
  });

  it('`get`: should retrieve value using path.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.get('methods.key')).to.be.eql('value');
    expect(this._class.get('methods.fn')()).to.be.eql(1);
    expect(this._class.get('methods.arr[1]')).to.be.eql(2);
  });

  it('`set`: should set value using path.', function() {
    this._class.set('methods.key', 'value');
    expect(this._class.methods.key).to.be.eql('value');

    let fn = function() {};
    this._class.set('methods.fn', fn);
    expect(this._class.methods.fn).to.be.eql(fn);
  });

  it('`has`: should check if value is at a path.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.has('methods.key')).to.be.true;
    expect(this._class.has('methods.fn')).to.be.true;
    expect(this._class.has('methods.arr[0]')).to.be.true;
    expect(this._class.has('methods.arr[5]')).to.be.false;
    expect(this._class.has('methods.array')).to.be.false;
  });

  it('`forget`: should delete value at a path.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.forget('methods.key')).to.be.eql('value');
    expect(this._class.methods).to.not.have.property('key');

    expect(this._class.forget('methods.arr[0]')).to.be.eql(1);
    expect(this._class.methods.arr).to.be.eql([, 2, 3]);
  });

  it('`result`: should retrieve value at a path and if is function then call it.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.result('methods.key')).to.be.eql('value');
    expect(this._class.result('methods.arr[0]')).to.be.eql(1);
    expect(this._class.result('methods.fn')).to.be.eql(1);
  });

  it('`keys`: should return all own keys.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.keys()).to.be.eql(_.keys(this._class));
  });

  it('`values`: should return all own values.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.values()).to.be.eql(_.values(this._class));
  });

  it('`entries`: should return all own keys and own values.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.entries()).to.be.eql([_.keys(this._class), _.values(this._class)]);
  });

  it('`pick`: should return an object composed of the picked object keys.', function() {
    let mock = this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.pick('methods')).to.be.eql({methods: mock});
    expect(this._class.pick(['ns', 'catalog'])).to.be.eql({ns: '', catalog: {}});
  });

  it('`omit`: should return an object with all keys that are not omitted.', function() {
    this._class.methods = {
      key: 'value',
      fn: () => 1,
      arr: [1, 2, 3]
    };

    expect(this._class.omit('methods')).to.be.eql(_.omit(this._class, ['methods']));
  });
});
