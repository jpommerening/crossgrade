var expect = require('expect.js');
var semver = require('semver');
var converter = require('../lib/converter');

describe('Converter', function () {

  function storeCalls() {
    this.calls = (this.calls || []);
    this.calls.push([].slice.apply(arguments));
  }

  var data = [
    { from: '0.1.0',  to: '0.2.0',  fn: storeCalls },
    { from: '0.2.0',  to: '~0.3.0', fn: storeCalls },
    { from: '~0.3.4', to: '0.4.0',  fn: storeCalls }
  ];


  context('#apply([...args])', function () {

    it('...', function () {
      var c = converter( data );
      var o = {};
      c.from('0.1.0').to('0.2.0').call(o, 1, 2);

      expect(o).to.eql({
        calls: [
          [ new semver.SemVer('0.1.0'), new semver.SemVer('0.2.0'), 1, 2 ]
        ]
      });
    });


    it('...', function () {
      var c = converter( data );
      var o = {};
      c.from('0.1.0').to('0.4.0').call(o, 1, 2);

      expect(o).to.eql({
        calls: [
          [ new semver.SemVer('0.1.0'), new semver.SemVer('0.2.0'), 1, 2 ],
          [ new semver.SemVer('0.2.0'), new semver.SemVer('0.3.4'), 1, 2 ],
          [ new semver.SemVer('0.3.4'), new semver.SemVer('0.4.0'), 1, 2 ]
        ]
      });
    });

  });

});
