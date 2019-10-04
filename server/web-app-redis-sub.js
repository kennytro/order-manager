'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const debugPS = require('debug')('order-manager:PubSub');
const logger = require(appRoot + '/config/winston.js');

/**
 * @param {Object} - application instance
 * @param {String} - socket namespace, i.e. model name
 * @param {Object} - message to emit
 */
function emitToSocket(app, namespace, message) {
  let socket = _.get(app, ['sockets', namespace]);
  if (socket) {
    socket.emit(namespace, message);
  } else {
    debugPS(`app is missing a socket for ${namespace}`);
  }
}

/**
 * @param {Object} - application instance
 * @param {String} - channel
 * @param {String} - message
 */
function subscriberListener(app, channel, message) {
  debugPS(`Web app received message(${message})`);
  let msgObj = JSON.parse(message);
  switch (msgObj.type) {
    case 'ORDER_CHANGED':
      emitToSocket(app, 'order', { operation: 'save', clientId: null });
      break;
    case 'METRIC_UPDATED':
      emitToSocket(app, 'metric', {
        operation: 'save',
        metricNames: _.get(msgObj, ['data', 'names'], [])
      });
      break;
    case 'MESSAGE_DELETED':
      /* because batch delete(using destroyAll) doesn't provide 'toUserId', we emit
       * message without a filter. */
      emitToSocket(app, 'message', { operation: 'delete' });
      break;

    default:
      logger.warn(`Unhandled message type(${msgObj.type}) - ${message}`);
      break;
  }
}

module.exports = function(app) {
  if (app.redisSubscriber) {
    app.redisSubscriber.on('message', _.partial(subscriberListener, app));

    debugPS('Subscribing to channel \'web-app\'.');
    app.redisSubscriber.subscribe('web-app');
  }
};
