'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const P = require('../lib/ptrn');
const _ = require('lodash');


describe('PTRN', function() {
  beforeEach(function() {
    const handlerNames = ['text', 'wild', 'num', 'headTail', 'obj', 'nan', 'blankList', 'array', 'arrInObj', 'doubleTail'];

    this.cb = _.reduce(handlerNames, (acc, m) => {
      return _.merge({}, acc, { [m]: sinon.spy() });
    }, {});

    this.matcher = P(
      ['text',                         this.cb.text],
      [1,                              this.cb.num],
      [NaN,                            this.cb.nan],
      [[1, P.P('two'), 3],             this.cb.array],
      [
        P.HT(P._, P.HT(P._, [[3, { wow: P.P('nested') }], 4])),
        this.cb.doubleTail
      ],
      [P.HT(P.P('head'), P.P('tail')), this.cb.headTail],
      [[],                             this.cb.blankList],
      [{ x: 1, y: 2 },                 this.cb.obj],

      [
        {
          x: P.HT({ wow: P.P('nested') }, P._)
        },
        this.cb.arrInObj
      ],

      [P._,                            this.cb.wild]
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

  it('should call wild', function() {
    const args = this.matchAndExpectOnly([], 'blankList');
    expect(_.keys(args)).to.eql([]);
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

  it('should call nan', function() {
    this.matchAndExpectOnly(NaN, 'nan');
  });

  it('should call array', function() {
    const args = this.matchAndExpectOnly([1, 2, 3], 'array');
    expect(_.keys(args)).to.eql(['two']);
    expect(args.two).to.eql(2);
  });

  it('should call arrInObj', function() {
    const target = { x: [{ wow: 'Ok' }, 1, 2, 3] };
    const args = this.matchAndExpectOnly(target, 'arrInObj');
    expect(_.keys(args)).to.eql(['nested']);
    expect(args.nested).to.eql('Ok');
  });

  it('should call doubleTail', function() {
    const target = [1, 2, [3, { wow: 'Ok' }], 4];
    const args = this.matchAndExpectOnly(target, 'doubleTail');
    expect(_.keys(args)).to.eql(['nested']);
    expect(args.nested).to.eql('Ok');
  });

  describe('fib', function() {
    beforeEach(function() {
      const fib = P(
        [0,        () => 0],
        [1,        () => 1],
        [P.P('n'), r => fib(r.n - 1) + fib(r.n - 2)]
      );

      this.subject = fib;
    });

    it('should compute 5', function() {
      expect(this.subject(5)).to.eql(5);
    });

    it('should compute 55', function() {
      expect(this.subject(10)).to.eql(55);
    });
  });

  describe('array sum', function() {
    beforeEach(function() {
      const sum = P(
        [[],                       () => 0],
        [P.HT(P.P('h'), P.P('t')), r => r.h + sum(r.t)]
      );

      this.subject = sum;
    });

    it('should eq 10', function() {
      expect(this.subject([1, 2, 3, 4])).to.eql(10);
    });
  });

  describe('tree sum', function() {
    beforeEach(function() {
      const sum = P(
        [{ left: P.P('l'), right: P.P('r') }, r => sum(r.l) + sum(r.r)],
        [P.P('n'),                            r => r.n]
      );

      this.subject = sum;
    });

    it('should eq 100', function() {
      const tree = {
        left: {
          left: 10,
          right: {
            left: 20,
            right: 30
          }
        },
        right: 40
      }

      expect(this.subject(tree)).to.eql(100);
    });
  });
});
