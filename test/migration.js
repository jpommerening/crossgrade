var expect = require('expect.js');
var semver = require('semver');
var migration = require('../lib/migration');
var rule = require('../lib/rule');

describe('Migration', function () {

  var fn = function (from, to) {
    this.from = from;
    this.to = to;
  };
  var up = function () {
    fn.apply(this, arguments);
    this.up = true;
  };
  var down = function () {
    fn.apply(this, arguments);
    this.down = true;
  };

  it('extends Rule', function () {
    var r = migration();
    expect(r).to.be.a(rule.Rule);
  });

  it('can be created with `migration()`', function () {
    var m = migration();
    expect(m).to.be.a(migration.Migration);
  });

  it('can be created with `rule(from, to, up, down)`', function () {
    var m = migration('0.1.0', '0.2.0', up, down);
    expect(m).to.be.a(migration.Migration);
  });

  context('#test(from, to)', function () {
    var m = migration('0.1.0', '0.2.0', up, down);

    it('returns a conversion function if the rule can be applied to convert between the two versions', function () {
      var step = m.test(semver.Range('0.1.0'), semver.Range('0.2.0'));
      expect(step).to.be.a(Function);
      expect(step.from).to.eql(semver('0.1.0'));
      expect(step.to).to.eql(semver('0.2.0'));
      expect(step.rule).to.be(m);
    });

    it('returns a conversion function if the rule can be applied to convert from the `from` version', function () {
      var step = m.test(semver.Range('0.1.0'), semver.Range('0.3.0'));
      expect(step).to.be.a(Function);
      expect(step.from).to.eql(semver('0.1.0'));
      expect(step.to).to.be(undefined);
      expect(step.rule).to.be(m);
    });

    it('returns a conversion function if the rule can be applied to convert to the `to` version', function () {
      var step = m.test(semver.Range('0.1.5'), semver.Range('0.2.0'));
      expect(step).to.be.a(Function);
      expect(step.from).to.be(undefined);
      expect(step.to).to.eql(semver('0.2.0'));
      expect(step.rule).to.be(m);
    });

    it('returns `undefined` if the rule cannot be applied to convert between the two versions', function () {
      var step = m.test(semver.Range('0.1.5'), semver.Range('0.3.0'));
      expect(step).to.be(undefined);
    });
  });


});
