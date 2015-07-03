var expect = require('expect.js');
var semver = require('semver');
var path = require('../lib/path');
var rule = require('../lib/rule');

describe('Path', function () {

  var fn = function (from, to) {
    this.from = from;
    this.to = to;
  };
  var rules = [
    { from: '0.1.0', to: '0.2.0', fn: fn },
    { from: '0.2.0', to: '0.3.0', fn: fn },
    { from: '0.3.0', to: '0.4.0', fn: fn },
    { from: '0.4.0', to: '0.5.0', fn: fn }
  ].map(rule);

  it('extends Rule', function () {
    var p = path('0.1.0', '0.5.0', rules);
    expect(p).to.be.a(rule.Rule);
  });

  it('can be created with `path(from, to, rules)`', function () {
    var p = path('0.1.0', '0.5.0', rules);
    expect(p).to.be.a(path.Path);
  });

  context('#test(from, to)', function () {
    var p = path('0.2.0', '0.4.0', rules)

    it('returns a conversion function if the rule can be applied to convert between the two versions', function () {
      var step = p.test(semver.Range('0.2.0'), semver.Range('0.4.0'));
      expect(step).to.be.a(Function);
      expect(step.from).to.eql(semver('0.2.0'));
      expect(step.to).to.eql(semver('0.4.0'));
      expect(step.rule).to.be(p);
    });

    it('returns a conversion function if the rule can be applied to convert from the `from` version', function () {
      var step = p.test(semver.Range('0.2.0'), semver.Range('0.5.0'));
      expect(step).to.be.a(Function);
      expect(step.from).to.eql(semver('0.2.0'));
      expect(step.to).to.be(undefined);
      expect(step.rule).to.be(p);
    });

    it('returns a conversion function if the rule can be applied to convert to the `to` version', function () {
      var step = p.test(semver.Range('0.1.0'), semver.Range('0.4.0'));
      expect(step).to.be.a(Function);
      expect(step.from).to.be(undefined);
      expect(step.to).to.eql(semver('0.4.0'));
      expect(step.rule).to.be(p);
    });

    it('returns `undefined` if the rule cannot be applied to convert between the two versions', function () {
      var step = p.test(semver.Range('0.1.0'), semver.Range('0.5.0'));
      expect(step).to.be(undefined);
    });
  });

});
