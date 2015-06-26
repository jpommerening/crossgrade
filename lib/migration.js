var util = require('./util');
var rule = require('./rule');
var semver = require('semver');

module.exports = function migration() {
  return Migration.apply(null, arguments);
};

module.exports.Migration = Migration;

function Migration(params) {
  if (typeof params !== 'object')
    return new Migration({
      from: arguments[0],
      to: arguments[1],
      up: arguments[2],
      down: arguments[3]
    });
  if (params instanceof Migration)
    return params;
  if (!(this instanceof Migration))
    return new Migration(params);

  var up = this.up = params.up;
  var down = this.down = params.down;

  params.fn = function (from, to) {
    var fn = semver.lte(from, to) ? up : down;
    return fn.apply(this, arguments);
  };

  rule.Rule.call(this, params);
}

util.inherits(Migration, rule.Rule);
