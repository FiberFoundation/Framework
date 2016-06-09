import TestSuite from '../support/TestSuite';
import Class from '../../src/Foundation/Class';
import chai from 'chai';

let expect = chai.expect;
let Suite = new TestSuite('Class', function() {

  beforeEach(function() {
    this.mock = new Class();
  });

  afterEach(function() {
    this.mock.destroy();
  });

  it('should be properly constructed.', function() {
    expect(this.mock).to.have.property('options');
    expect(this.mock.options).to.be.eql({});
    this.mock = new Class({custom: true});
    expect(this.mock.options).to.have.property('custom');
  });
});
