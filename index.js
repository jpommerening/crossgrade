var rule = require('./lib/rule');
var migration = require('./lib/migration');
var converter = require('./lib/converter');

module.exports = function crossgrade() {
  return converter.apply(this, arguments);
};

crossgrade.Rule = rule.Rule;
crossgrade.Migration = migration.Migration;
crossgrade.Converter = converter.Converter;
