'use strict';
const _ = require('lodash');
const Promise = require('bluebird');
const appRoot = require('app-root-path');
const debugPdf = require('debug')('order-manager:Pdf');
const logger = require(appRoot + '/config/winston');
const redisKeys = require(appRoot + '/config/redis-keys');

const CONCURRENCY_LIMIT = process.env.CONCURRENCY_LIMIT ? parseInt(process.env.CONCURRENCY_LIMIT) : 3;  // avoid connection exhaustion

/**
 * @param {Object} - Redis client
 * @param {String} - set key name
 * @returns {String[]} - elements in set.
 */
async function getInstanceIds(redisClient, setName) {
  const scardAsync = Promise.promisify(redisClient.scard).bind(redisClient);
  const spopAsync = Promise.promisify(redisClient.spop).bind(redisClient);
  let instanceIds = [];
  let idCount = await scardAsync(setName);
  if (idCount > 0) {
    debugPdf(`Found ${idCount} IDs in ${setName}`);

    instanceIds = await spopAsync(setName, idCount);
    if (debugPdf.enabled) {
      debugPdf(`IDs in ${setName}(count: ${instanceIds.length}): ${JSON.stringify(instanceIds)}.`);
    }
  }
  return instanceIds;
}

module.exports = {
  makeInvoice: async function(app) {
    if (app.redis) {
      const orderIds = await getInstanceIds(app.redis, redisKeys.orderInvoiceSetKey);
      if (_.isEmpty(orderIds)) {
        return;
      }
      let result = await Promise.map(orderIds, async (oid) => {
        let order = await app.models.Order.findById(oid);
        if (!order) {
          return { orderId: oid, clientId: null, error: 'Not found.' };
        }
        await order.generatePdf();
        debugPdf(`Generated invoice of Order(id: ${order.id})`);
        return { orderId: oid, clientId: order.clientId };
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
      let failed = _.remove(result, function(e) { return e.error; });
      failed.forEach(function(e) {
        logger.error(`Failed to make invoice of Order(id: ${e.orderId}) - ${e.error}`);
      });
      debugPdf('Publishing to \'web-app\' channel (type: ORDER_CHANGED)');
      app.redis.publish('web-app', JSON.stringify({
        type: 'ORDER_CHANGED',
        data: {
          orders: result
        }
      }));
    }
  },
  makeStatement: async function(app) {
    if (app.redis) {
      logger.info('makeStatement() is called');
    }
  }
};
