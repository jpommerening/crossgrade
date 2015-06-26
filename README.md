# crossgrade
An abstract migration framework for use in versioned APIs and databases.

```js
var xg = require('crossgrade');

var migration = xg([
  // Migrations are function that are applied to
  // get from one semantic version to another
  { from: '0.1.0',  to: '0.2.0', fn: migrationFunction },

  // You can also use semantic version ranges if your function
  // can handle multiple versions
  { from: '~0.2.0', to: '~0.3.0', fn: migrationFunction },

  // If you want to support conversion in both directions,
  // you can supply an "up" and a "down" function
  { from: '~0.2.0', to: '1.0.0', up: upgradeFunction, down: downgradeFunction },

  // Also, sub-migrations may be embedded as Crossgrade instances
  { from: '^1.0.0', to: '2.0.0', fn: xg(require('./1.0-to-2.0-migration-steps')) },

  // Of course, you are free to split your migrations into multiple files
  require( './3.0-migration-module' )
]);

migration.from('0.1.0')
         .to('1.0.0')
         .apply(instanceToUpgrade,
                ['args', 'passed', 'to', 'migration', 'methods']);

// Migration functions receive the versions as semantic version objects,
// the arguments that are passed in and the instance they are applied on
function migrationFunction(from, to, args, passed, to, migration, methods) {
  from instanceof semver.SemVer === true;
  to instanceof semver.SemVer === true;

  doSomethingWith(this);
}
```

