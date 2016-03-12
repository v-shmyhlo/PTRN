'use strict';

const _ = require('lodash');

const PTRN = _.rest(definePatternMatcher);

PTRN._     = '__PTRN_WILDCARD';
PTRN.P_DEF = '__PTRN_PARAMETER';
PTRN.T_DEF = '__PTRN_TAIL';

PTRN.P = pName => _.merge({}, { _DEF: PTRN.P_DEF, name: pName })
PTRN.T = pName => _.merge({}, { _DEF: PTRN.T_DEF, name: pName })

module.exports = PTRN;

function definePatternMatcher(defs) {
  return target => {
    let bindings;

    const def = _.find(defs, def => {
      let pattern = _.first(def);
      return bindings = matchPattern(target, pattern);
    });

    let handler = _.last(def);

    if (!handler) {
      throw new Error('Pattern not found');
    }

    handler(bindings);
  }
}

function matchPattern(target, pattern) {
  if (pattern === target) {
    return matchEquals(target, pattern);
  } else if (pattern === PTRN._) {
    return 'WILD BIND';
  } else if (_.isArray(pattern)) {
    return matchArray(target, pattern);
  } else if (_.isPlainObject(pattern)) {
    if (pattern._DEF === PTRN.P_DEF) {
      return matchParameter(target, pattern);
    } else if (pattern._DEF === PTRN.T_DEF) {
      throw new Error('Invalid tail pattern position');
    } else {
      return matchObject(target, pattern);
    }
  }
}

function matchEquals(target, pattern) {
  return {};
}

function matchObject(target, pattern) {
  if (_.isObject(target)) {
    var matches = _.map(pattern, function(pat, key) {
      return matchPattern(target[key], pat);
    });
    if (_.every(matches)) {
      return _.reduce(matches, function(acc, binding) {
        return _.merge({}, acc, binding);
      }, {});
    }
  }
}

function matchParameter(target, pattern) {
  var res = {};
  res[pattern.name] = target;
  return res;
}

function matchArray(target, pattern) {
  if (_.isArrayLikeObject(target)) {
    var matches = _.map(pattern, function(pat, i) {
      if (pat._DEF === PTRN.T_DEF) {
        var res = {};
        res[pat.name] = target.slice(i);
        return res;
      } else {
        return matchPattern(target[i], pat);
      }
    });
    if (_.every(matches)) {
      return _.reduce(matches, function(acc, binding) {
        return _.merge({}, acc, binding);
      }, {});
    }
  }
}
