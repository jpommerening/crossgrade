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

Converter.prototype.path = function () {
  return findPaths(this.params.from, this.params.to, this.rules, []).sort(function (a, b) {
    return a.length < b.length;
  })[ 0 ];
};

Converter.prototype.rule = function () {
  this.rules.push(rule.apply(this, arguments));
  return this;
};

Converter.prototype.fn = function (fn) {
  return this.rule(this.params.from, this.params.to, fn);
};

Converter.prototype.conversion = function () {
  var path = this.path();
  var rule = ruleFromPath(path);
  var from = util.satisfy(this.params.from, rule.from);
  var to = util.satisfy(this.params.to, rule.to);

  if (path.length > 1) {
    this.rule(rule);
  }

  return function () {
    return rule.apply(this, [from, to].concat([].slice.apply(arguments)));
  };
};

Converter.prototype.apply = function () {
  var conversion = this.conversion();
  return conversion.apply.apply(conversion, arguments);
};

Converter.prototype.call = function () {
  var conversion = this.conversion();
  return conversion.call.apply(conversion, arguments);
};

Converter.prototype.bind = function () {
  var conversion = this.conversion();
  return conversion.bind.apply(conversion, arguments);
};

function findSegments(from, to, rules, omit) {
  return rules.filter(function (rule) {
    for (var i = 0; i < omit.length; i++)
      if (omit[i].rule === rule)
        return false;
    return true;
  }).map(function (rule) {
    return {
      from: util.satisfy(from, rule.from),
      to: util.satisfy(to, rule.to),
      rule: rule
    };
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
  return path.length === 1 ? path[0].rule : rule({
    from: path[0].rule.from,
    to: path[path.length-1].rule.to,
    fn: function (from, to) {
      var args = [].slice.apply(arguments);
      var via = from;

      for (var i = 0; (i+1) < path.length; i++) {
        args[ 0 ] = via;
        args[ 1 ] = via = path[ i ].to;
        path[ i ].rule.apply(this, args);
      }
      args[ 0 ] = via;
      args[ 1 ] = to;
      path[ i ].rule.apply(this, args);
    }
  });
}
