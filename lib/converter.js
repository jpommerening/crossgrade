var assert = require('assert');
var util = require('./util');
var rule = require('./rule');

module.exports = function converter() {
  return Converter.apply(null, arguments);
};

module.exports.Converter = Converter;

var ANY = util.ensureRange();

/**
 * @constructor
 * @param {Array} rules the rules the converter should adhere to
 */
function Converter(rules) {
  if (!(this instanceof Converter))
    return new Converter(rules);

  this.rules = rules.map(rule);
  this.params = {
    from: ANY,
    to: ANY
  };
}

function proxyParams(obj, params) {
  var original = obj.original || obj;
  var proxy = Object.create(original);
  proxy.original = original;
  proxy.params = util.defaults(params, obj.params);
  return proxy;
}

Converter.prototype.from = function (version) {
  return proxyParams(this, {from: util.ensureRange(version)});
};

Converter.prototype.to = function (version) {
  return proxyParams(this, {to: util.ensureRange(version)});
};

Converter.prototype.paths = function () {
  return findPaths(this.params.from, this.params.to, this.rules, []);
};

Converter.prototype.path = function () {
  return this.paths().sort(function (lhs, rhs) {
    return lhs.length < rhs.length;
  })[ 0 ];
};

Converter.prototype.rule = function () {
  if (arguments.length > 0) {
    this.rules.push(rule.apply(null, arguments));
    return this;
  } else {
    var p = this.path();
    var r = ruleFromPath(p);

    if (p.length > 1) this.rule(r);

    return r;
  }
};

Converter.prototype.fn = function (fn) {
  if (arguments.length > 0) {
    return this.rule(this.params.from, this.params.to, fn);
  } else {
    return this.rule().test(this.params.from, this.params.to);
  }
};

Converter.prototype.apply = function () {
  var fn = this.fn();
  return fn.apply.apply(fn, arguments);
};

Converter.prototype.call = function () {
  var fn = this.fn();
  return fn.call.apply(fn, arguments);
};

Converter.prototype.bind = function () {
  var fn = this.fn();
  return fn.bind.apply(fn, arguments);
};

function findSegments(from, to, rules, omit) {
  return rules.map(function (rule) {
    for (var i = 0; i < omit.length; i++)
      if (omit[i].rule === rule)
        return;

    return rule.test(from, to);
  }).filter(function (segment) {
    return !!segment;
  });
}

function findPaths(from, to, rules, tail) {
  var segments = findSegments(from, to, rules, tail);

  var start = segments.filter(function (segment) {
    return segment.from;
  });

  if (start.length === 0) return [];

  var direct = start.filter(function (segment) {
    return segment.to;
  });

  if (direct.length > 0) return direct.map(function(segment) {
    return [segment].concat(tail);
  });

  var end = segments.filter(function (segment) {
    return segment.to;
  });

  if (end.length === 0) return [];

  return util.flatten(end.map(function (segment) {
    return findPaths(from, segment.rule.from, rules, [segment].concat(tail));
  }));
}

function ruleFromPath(path) {
  var params = {
    from: path[0].rule.from,
    to: path[path.length-1].rule.to,
    fn: function (from, to) {
      var args = [].slice.call(arguments, 2);
      var via = from;

      assert(params.from.test(from));
      assert(params.to.test(to));

      path[0].from = from;
      path[path.length-1].to = to;

      for (var i = 0; i < path.length; i++) {
        path[ i ].from = via;
        via = path[ i ].to;
        path[ i ].apply(this, args);
      }
    }
  };
  return path.length === 1 ? path[0].rule : rule(params);
}
