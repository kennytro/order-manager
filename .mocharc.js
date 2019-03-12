'use strict';
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