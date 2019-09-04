'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const debugMetricMsg = require('debug')('order-manager:Metric:message');
const logger = require(appRoot + '/config/winston.js');

/**
 * @param {Object} - Instance of socket.id
 * @param {String} - socket namespace
 * @returns {Object} - socket.
 */
function createSocket(io, ns) {
  return io
    .of(ns)
    .on('connection', function(socket) {
      logger.debug(`${ns}: socket connected.`);
      socket.on('disconnect', function() {
        logger.debug(`${ns}: socket disconnected.`);
      });
    });
}

/**
 * @param {Object} - loopback app.
 * @param {Object} - Express server
 * @param {Object} - options in creating socketIO instance.
 */
module.exports.init = function(app, server, options) {
  app.io = require('socket.io')(server, _.assign({ pingInterval: 6000, pingTimeout: 70000 }, options));
  app.models().filter(model => model.supoortRealTime).forEach(model => {
    _.set(app, ['sockets', model.modelName.toLowerCase()], createSocket(app.io, model.socketNamespace));
    logger.debug(`Created a socket(model name: ${model.modelName.toLowerCase()}, namespace: ${model.socketNamespace})`);
  });
};

module.exports.onMessage = function(app, message) {
  if (message.eventType === 'METRIC_UPDATED') {
    const ns = 'metric';
    debugMetricMsg(`metrics updated = ${JSON.stringify(message.data)}`);
    let socket = _.get(app, ['sockets', ns]);
    if (socket) {
      socket.emit(ns, {
        operation: 'save',
        metricNames: _.get(message, ['data', 'names'], [])
      });
    } else {
      debugMetricMsg('app is missing a socket for metric');
    }
  }
};
