'use strict';
const redis = require('redis');
const appRoot = require('app-root-path');
const logger = require(appRoot + '/config/winston');
const tenantSetting = require(appRoot + '/config/tenant');

module.exports = function(app) {
  if (process.env.ONE_OFF) {
    return;
  }
  if (!process.env.REDIS_URL) {
    logger.warn('REDIS_URL environment variable is not set.');
    return;
  }
  app.redis = redis.createClient(process.env.REDIS_URL, {
    prefix: tenantSetting.id,
    retry_unfulfilled_commands: true,
    retry_strategy: retryStrategy
  });
  app.redis
    .on('ready', () => {
      logger.info(`Redis is ready at ${app.redis.address}`);
    })
    .on('connect', () => {
      logger.info(`Connected to Redis at ${app.redis.address}`);
    })
    .on('reconnecting', () => {
      logger.info(`Redis is reconnecting to ${app.redis.address}`);
    })
    .on('end', () => {
      logger.warn(`Redis is ending connect to ${app.redis.address}`);
    });

  function retryStrategy(options) {
    if (options.error) {
      logger.error(`Redis connection error - ${options.error.message}`);
      if (options.error.code === 'ECONNREFUSED') {
        return new Error(options.error.message);
      }
      let reconnectAfter = Math.min(options.attempt * 1000, 30000);
      logger.warn('Attempting Redis re-connect in ' + (reconnectAfter / 1000) + ' seconds...');
      return reconnectAfter;
    }
  }
};
