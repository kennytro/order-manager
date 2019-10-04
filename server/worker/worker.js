'use strict';
const appRoot = require('app-root-path');
const cluster = require('cluster');
const yn = require('yn');
const logger = require(appRoot + '/config/winston');

/**
 * Main function of worker process.
 */
module.exports.start = async function(app) {
  if (yn(process.env.ONE_OFF) || !yn(process.env.IS_WORKER)) {
    return;  // skip if it's one off process or not a worker
  }
  await require('./business-geo-loc')(app);
  require('./scheduler')(app);
  require('./redis-sub')(app);

  logger.info('Worker is running...');
};
