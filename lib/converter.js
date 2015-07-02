var assert = require('assert');
var util = require('./util');
var rule = require('./rule');
var path = require('./path');

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
  return path({
    from: this.params.from,
    to: this.params.to,
    rules: this.rules
  });
};

Converter.prototype.rule = function () {
  if (arguments.length > 0) {
    this.rules.push(rule.apply(null, arguments));
    return this;
  } else {
    var path = this.path();
    if (path.length > 1) this.rules.push(path);
    return path;
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
