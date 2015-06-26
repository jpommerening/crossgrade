var expect = require('expect.js');
var semver = require('semver');
var migration = require('../lib/migration');
var rule = require('../lib/rule');

describe('Migration', function () {

  it('can be created with `migration()`', function () {
    var r = migration();
    expect(r).to.be.a(migration.Migration);
  });

  it('extends Rule', function () {
    var r = migration();
    expect(r).to.be.a(rule.Rule);
  });

});
