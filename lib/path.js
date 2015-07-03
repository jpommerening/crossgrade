var util = require('./util');
var rule = require('./rule');

module.exports = function path() {
  return Path.apply(null, arguments);
};

module.exports.Path = Path;

/**
 * @constructor
 */
function Path(params) {
  if (typeof params !== 'object')
    return new Path({
      from: arguments[0],
      to: arguments[1],
      rules: arguments[2]
    });
  if (!(this instanceof Path))
    return new Path(params);

  var from = util.ensureRange(params.from);
  var to = util.ensureRange(params.to);

  var path = findPaths(from, to, params.rules, []).sort(function (lhs, rhs) {
    return lhs.length < rhs.length;
  })[ 0 ];

  if (path.length === 1)
    return path[0].rule;

  this.length = path.length;

  rule.Rule.call(this, {
    from: from,
    to: to,
    fn: function (from, to) {
      var args = [].slice.call(arguments, 2);
      var via = from;

      path[0].from = from;
      path[path.length-1].to = to;

      for (var i = 0; i < path.length; i++) {
        path[ i ].from = via;
        via = path[ i ].to;
        path[ i ].apply(this, args);
      }
    }
  });
}

util.inherits(Path, rule.Rule);

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
