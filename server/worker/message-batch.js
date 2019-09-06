'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const debugBatch = require('debug')('order-manager:Message:batch');
const moment = require('moment');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

/**
 * @params {String} - time of execution
 * @returns {Number} - deleted message count
 */
module.exports.delExpiredMessage = async function(fireDate) {
  debugBatch(`${moment(fireDate).format()}: Running Metric.delExpiredMessage()`);
  let info = { count: 0 };
  try {
    info = await app.models.Message.destroyAll({
      expiresAt: { lt: Date.now() }
    });

    if (info.count > 0) {
      logger.info(`Deleted ${info.count} expired message(s)`);
      process.send({
        eventType: 'MESSAGE_DELETED',
        data: {
          count: info.count,
          time: fireDate
        }
      });
    }
  } catch (error) {
    logger.error(`Error while deleting expired message - ${error.message}`);
  }

  debugBatch('Exiting Metric.delExpiredMessage()');
  return info.count;
};
