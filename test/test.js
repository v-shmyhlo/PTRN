'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const P = require('../lib/ptrn');
const _ = require('lodash');


describe('PTRN', function() {
  beforeEach(function() {
    const handlerNames = ['text', 'wild', 'num', 'headTail', 'obj'];

    this.cb = _.reduce(handlerNames, (acc, m) => {
      return _.merge({}, acc, { [m]: sinon.spy() });
    }, {});

    this.matcher = P(
      ['text',                     this.cb.text],
      [1,                          this.cb.num],
      [[P.P('head'), P.T('tail')], this.cb.headTail],
      [{ x: 1, y: 2 },             this.cb.obj],
      [P._,                        this.cb.wild]
    );

    this.expectOnly = (s) => {
      _.each(_.without(_.keys(this.cb), s), s => expect(this.cb[s].called).to.be.false);
      expect(this.cb[s].called).to.be.true;
      return this.cb[s].getCall(0).args[0];
    }

    this.matchAndExpectOnly = (t, s) => {
      this.matcher(t);
      return this.expectOnly(s);
    }
  });

  it('should call text', function() {
    this.matchAndExpectOnly('text', 'text');
  });

  it('should call wild', function() {
    this.matchAndExpectOnly('wrong text', 'wild');
  });

  it('should call num', function() {
    this.matchAndExpectOnly(1, 'num');
  })

  it('should call wild', function() {
    this.matchAndExpectOnly(2, 'wild');
  });

  it('should call headTail', function() {
    const args = this.matchAndExpectOnly(['h', 't', 't'], 'headTail');
    expect(_.keys(args)).to.eql(['head', 'tail']);
    expect(args.head).to.eql('h');
    expect(args.tail).to.eql(['t', 't']);
  });

  it('should call headTail', function() {
    const args = this.matchAndExpectOnly(['h'], 'headTail');
    expect(_.keys(args)).to.eql(['head', 'tail']);
    expect(args.head).to.eql('h');
    expect(args.tail).to.eql([]);
  });

  it('should call headTail', function() {
    const args = this.matchAndExpectOnly([], 'wild');
    expect(_.keys(args)).to.eql([]);
    // expect(_.keys(args)).to.eql(['head', 'tail']);
    // expect(args.head).to.be.undefined;
    // expect(args.tail).to.eql([]);
  });

  it('should call obj', function() {
    this.matchAndExpectOnly({}, 'wild');
  });

  it('should call obj', function() {
    this.matchAndExpectOnly({ x: 1 }, 'wild');
  });

  it('should call obj', function() {
    this.matchAndExpectOnly({ x: 1, y: 3 }, 'wild');
  });

  it('should call obj', function() {
    this.matchAndExpectOnly({ x: 1, y: 2 }, 'obj');
  });

  it('should call obj', function() {
    this.matchAndExpectOnly({ x: 1, y: 2, z: 3 }, 'obj');
  });
});
