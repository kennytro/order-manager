'use strict';
process.env.ONE_OFF = true;    // disable various server initialization.
process.env.NODE_ENV = 'test';

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