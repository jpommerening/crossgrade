var util = require('./util');

module.exports = function rule() {
  return Rule.apply(null, arguments);
};

module.exports.Rule = Rule;

/**
 * A conversion rule.
 * @constructor
 * @param {Object} params parameters for instantiating the object
 * @param {semver.Range|semver.SemVer|String} params.from the version to start from
 * @param {semver.Range|semver.SemVer|String} params.to the version to convert to
 * @param {Function} params.fn the function to execute
 */
function Rule(params) {
  if (typeof params !== 'object')
    return new Rule({
      from: arguments[0],
      to: arguments[1],
      fn: arguments[2]
    });
  if (params instanceof Rule)
    return params;
  if (!(this instanceof Rule))
    return new Rule(params);

  this.from = util.ensureRange(params.from);
  this.to = util.ensureRange(params.to);

  if (params.fn) {
    this.fn = params.fn;
  }

  /*
  var version = util.satisfy(this.from, this.to);
  if (version) {
    throw new Error('Circular rule from ' + this.from.raw + ' to ' + this.to.raw + ' detected. ' +
                    'Version ' + version + ' matches both "from" and "to" ranges.');
  }
  */
}

Rule.prototype.test = function (from, to) {
  var fn = this.fn;

  function step() {
    return fn.apply(this, [step.from, step.to].concat([].slice.apply(arguments)));
  }

  step.from = util.satisfy(from, this.from),
  step.to = util.satisfy(to, this.to),
  step.rule = this;


  return (step.from || step.to) && step;
};

Rule.prototype.describe = function () {
  return this.fn.toString();
};

