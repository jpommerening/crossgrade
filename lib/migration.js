var util = require('./util');
var rule = require('./rule');
var semver = require('semver');

module.exports = function migration() {
  return Migration.apply(null, arguments);
};

module.exports.Migration = Migration;

/**
 * A more clever conversion rule, able to reverse its actions.
 *
 * Depending on whether converting from a greater version to a smaller or
 * vice versa, the conversion rule calls either the `up` or `down` function.
 * @constructor
 * @param {Object} params parameters for instantiating the object
 * @param {semver.Range|semver.SemVer|String} params.from the version to start from
 * @param {semver.Range|semver.SemVer|String} params.to the version to convert to
 * @param {Function} params.up the function to execute when upgrading
 * @param {Function} params.down the function to execute when downgrading
 */
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

  params.reversible = !!(up && down);
  params.fn = function (from, to) {
    var fn = semver.lte(from, to) ? up : down;
    return fn.apply(this, arguments);
  };

  rule.Rule.call(this, params);
}

util.inherits(Migration, rule.Rule);
