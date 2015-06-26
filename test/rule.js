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

  context('#apply(this, [args])', function () {

    it('applies the function that was specified when custructing the object', function () {
      var obj = {test: 'test'};
      var that, from, to;
      var r = rule({fn: function (f, t) {
        that = this;
        from = f;
        to = t;
      }});

      r.apply(obj, [ 1, 2 ]);
      expect(that).to.be(obj);
      expect(from).to.equal(1);
      expect(to).to.equal(2);
    });

  });

  context('#call(this, [...args])', function () {

    it('calls the function that was specified when custructing the object', function () {
      var obj = {test: 'test'};
      var that, from, to;
      var r = rule({fn: function (f, t) {
        that = this;
        from = f;
        to = t;
      }});

      r.call(obj, 1, 2);
      expect(that).to.be(obj);
      expect(from).to.equal(1);
      expect(to).to.equal(2);
    });

  });


  context('#bind(this, [...args])', function () {

    it('binds the function that was specified when custructing the object', function () {
      var obj = {test: 'test'};
      var that, from, to;
      var r = rule({fn: function (f, t) {
        that = this;
        from = f;
        to = t;
      }});

      var fn = r.bind(obj, 1);;
      expect(fn).to.be.a(Function);
      fn(2);
      expect(that).to.be(obj);
      expect(from).to.equal(1);
      expect(to).to.equal(2);
    });

  });

});
