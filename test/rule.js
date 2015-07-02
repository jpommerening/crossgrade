var expect = require('expect.js');
var semver = require('semver');
var rule = require('../lib/rule');

describe('Rule', function () {

  it('can be created with `rule()`', function () {
    var r = rule();
    expect(r).to.be.a(rule.Rule);
  });

  it('can be created with `from` and `to` versions', function () {
    var r = rule('0.1.0', '0.2.0');
    expect(r).to.be.a(rule.Rule);
  });

  [ 'from', 'to' ].forEach(function (prop) {
    context('#' + prop, function () {

      it('holds a `semver.Range` with the specified version', function () {
        var p = {};
        p[ prop ] = '0.1.0';
        var r = rule(p);
        expect(r[prop]).to.be.a(semver.Range);
        expect(r[prop].test('0.1.0')).to.be(true);
      });

      it('holds a `semver.Range` matching anything if no version was specified', function () {
        var r = rule({});
        expect(r[prop]).to.be.a(semver.Range);
        expect(r[prop].test('0.0.9')).to.be(true);
        expect(r[prop].test('0.9.0')).to.be(true);
        expect(r[prop].test('9.0.0')).to.be(true);
      });

    });
  });

  context('#test(from, to)', function () {
    var r = rule({
      from: '0.1.0',
      to: '0.2.x'
    });

    it('returns a conversion path segment if the rule can be applied to convert between the two versions', function () {
      var step = r.test(semver.Range('0.1.x'), semver.Range('0.2.1'));
      expect(step).to.be.a(Function);
      expect(step.from).to.eql(semver('0.1.0'));
      expect(step.to).to.eql(semver('0.2.1'));
      expect(step.rule).to.be(r);
    });

    it('returns a conversion path segment if the rule can be applied to convert from the `from` version', function () {
      var step = r.test(semver.Range('0.1.x'), semver.Range('0.4.1'));
      expect(step).to.be.a(Function);
      expect(step.from).to.eql(semver('0.1.0'));
      expect(step.to).to.be(undefined);
      expect(step.rule).to.be(r);
    });

    it('returns a conversion path segment if the rule can be applied to convert to the `to` version', function () {
      var step = r.test(semver.Range('0.4.1'), semver.Range('0.2.1'));
      expect(step).to.be.a(Function);
      expect(step.from).to.be(undefined);
      expect(step.to).to.eql(semver('0.2.1'));
      expect(step.rule).to.be(r);
    });

    it('returns `undefined` if the rule cannot be applied to convert between the two versions', function () {
      var step = r.test(semver.Range('0.2.0'), semver.Range('0.1.0'));
      expect(step).to.be(undefined);
    });
  });

});
