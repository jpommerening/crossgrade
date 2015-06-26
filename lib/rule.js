var util = require('./util');

module.exports = function rule() {
  return Rule.apply(null, arguments);
};

module.exports.Rule = Rule;

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

Rule.prototype.apply = function () {
  return this.fn.apply.apply(this.fn, arguments);
};

Rule.prototype.call = function () {
  return this.fn.call.apply(this.fn, arguments);
};

Rule.prototype.bind = function () {
  return this.fn.bind.apply(this.fn, arguments);
};
