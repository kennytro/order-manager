'use strict';
process.env.DISABLE_CLUSTER = true;
process.env.ONE_OFF = true;
module.exports = {
  diff: true,
  extension: ['js'],
  opts: './test/mocha.opts',
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 5000,
  ui: 'bdd'
};