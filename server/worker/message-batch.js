'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const debugBatch = require('debug')('order-manager:Message:batch');
const moment = require('moment');
const logger = require(appRoot + '/config/winston');

/**
 * @params {Object} - application instance
 * @params {String} - time of execution
 * @returns {Number} - deleted message count
 */
module.exports.delExpiredMessage = async function(app, fireDate) {
  debugBatch(`${moment(fireDate).format()}: Running Message.delExpiredMessage()`);
  let info = { count: 0 };
  try {
    info = await app.models.Message.destroyAll({
      expiresAt: { lt: Date.now() }
    });

    if (info.count > 0) {
      logger.info(`Deleted ${info.count} expired message(s)`);
      if (app.redis) {
        debugBatch('Publishing to \'web-app\' channel (type: MESSAGE_DELETED)');
        app.redis.publish('web-app', JSON.stringify({
          type: 'MESSAGE_DELETED',
          data: {
            count: info.count,
            time: fireDate
          }
        }));
      }
    }
  } catch (error) {
    logger.error(`Error while deleting expired message - ${error.message}`);
  }

  debugBatch('Exiting Message.delExpiredMessage()');
  return info.count;
};
