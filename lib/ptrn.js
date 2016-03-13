'use strict';

const _ = require('lodash');

const PTRN = _.rest(definePatternMatcher);

PTRN._      = '__PTRN_WILDCARD';
PTRN.P_DEF  = '__PTRN_PARAMETER';
PTRN.HT_DEF = '__PTRN_HEADTAIL';

PTRN.P = pName =>
  _.merge({}, { _DEF: PTRN.P_DEF, name: pName })
PTRN.HT = (hName, tName) =>
  _.merge({}, { _DEF: PTRN.HT_DEF, head: hName, tail: tName })

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

    return handler(bindings);
  }
}

function matchPattern(target, pattern) {
  if (target !== target && pattern !== pattern) {
    return matchNaN(target, pattern);
  } else if (pattern === target) {
    return matchEquals(target, pattern);
  } else if (pattern === PTRN._) {
    return matchWildcard(target, pattern);
  } else if (_.isArray(pattern)) {
    return matchArray(target, pattern);
  } else if (_.isPlainObject(pattern)) {
    if (pattern._DEF === PTRN.P_DEF) {
      return matchParameter(target, pattern);
    } else if (pattern._DEF === PTRN.HT_DEF) {
      return matchHeadTail(target, pattern);
    } else {
      return matchObject(target, pattern);
    }
  }
}

function matchNaN(target, pattern) {
  return {};
}

function matchWildcard(target, pattern) {
  return {};
}

function matchEquals(target, pattern) {
  return {};
}

function matchParameter(target, pattern) {
  return { [pattern.name]: target }
}

function matchHeadTail(target, pattern) {
  if (_.isArrayLikeObject(target) && target.length > 0) {
    const matches = [
      matchPattern(target[0], pattern.head),
      matchPattern(target.slice(1), pattern.tail)
    ]
    if (_.every(matches)) {
      return _.reduce(matches, function(acc, binding) {
        return _.merge({}, acc, binding);
      }, {});
    }
  }
}

function matchObject(target, pattern) {
  if (_.isObject(target)) {
    const matches = _.map(pattern, function(pat, key) {
      return matchPattern(target[key], pat);
    });
    if (_.every(matches)) {
      return _.reduce(matches, function(acc, binding) {
        return _.merge({}, acc, binding);
      }, {});
    }
  }
}

function matchArray(target, pattern) {
  if (_.isArrayLikeObject(target)) {
    const matches = _.map(pattern, function(pat, i) {
      return matchPattern(target[i], pat);
    });
    if (_.every(matches)) {
      return _.reduce(matches, function(acc, binding) {
        return _.merge({}, acc, binding);
      }, {});
    }
  }
}
