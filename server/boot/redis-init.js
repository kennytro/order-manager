'use strict';
const redis = require('redis');
const yn = require('yn');
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

  // set up regular redis client
  app.redis = redis.createClient(process.env.REDIS_URL, {
    prefix: tenantSetting.id + ':',
    retry_unfulfilled_commands: true,
    retry_strategy: retryStrategy
  });
  addListener(app.redis, 'reg');

  // set up subscriber client
  app.redisSubscriber = app.redis.duplicate();
  addListener(app.redisSubscriber, 'sub');

  function addListener(redis, name) {
    redis
      .on('ready', () => {
        logger.info(`Redis(${name}) is ready at ${redis.address}`);
      })
      .on('connect', () => {
        logger.info(`Connected to Redis(${name}) at ${redis.address}`);
      })
      .on('reconnecting', () => {
        logger.info(`Redis(${name}) is reconnecting to ${redis.address}`);
      })
      .on('end', () => {
        logger.warn(`Redis(${name}) is ending connect to ${redis.address}`);
      })
      .on('warning', (msg) => {
        logger.warn(`Redis(${name}) at ${redis.address} issued an warning ${msg}`);
      })
      .on('error', (err) => {
        logger.error(`Redis(${name}) at ${redis.address} issued an error ${err}`);
      });
  }

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
