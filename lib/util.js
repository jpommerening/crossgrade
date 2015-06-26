var util = require('util');
var semver = require('semver');

/**
 * Flatten an array of arrays.
 * @param {Array} array the array to be flattened
 * @return {Array} the concatenated contents of each array
 */
function flatten(array) {
  return [].concat.apply([], array);
}

/**
 * Generate a version that satisfies a given semantic version comparator.
 * @param {semver.Comparator} comp the semantic version comparator to satisfy
 * @return {semver.SemVer} a semantic version that satisfies `comp`
 */
function sat(comp) {
  var version = comp.semver;
  switch (comp.operator) {
    case '>=':
      return version;
    case '': case '=': case '==': case '===':
      return version;
    case '>':
      return new semver.SemVer(version.raw).inc('patch');
  }
}

/**
 * Generate a version that satisfies all given semantic version ranges.
 * @param {...semver.Range} range the semantic version ranges to satisfy
 * @return {semver.SemVer} a semantic version that satisfies each `range`.
 */
function satisfy() {
  var ranges = [].slice.apply(arguments);
  var versions = flatten(ranges.map(function (range) {
    return flatten(range.set).map(sat);
  }));

  return ranges.reduce(function (versions, range) {
    return versions.filter(range.test.bind(range));
  }, versions)[ 0 ];
}

/**
 * Make sure the given parameter is a semantic version range.
 * @param {Object} obj the object that is supposed to be a range
 * @return {semver.Range} the range object
 */
function ensureRange(obj) {
  if (obj instanceof semver.Range)
    return obj;

  if (obj instanceof semver.SemVer)
    return new semver.Range(obj.raw);

  return new semver.Range(obj || '');
}

module.exports = {
  flatten: flatten,
  satisfy: satisfy,
  ensureRange: ensureRange,
  inherits: util.inherits
};
