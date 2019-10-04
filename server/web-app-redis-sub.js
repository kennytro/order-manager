'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const debugPS = require('debug')('order-manager:PubSub');

module.exports = function(app) {
  if (app.redisSubscriber) {
    app.redisSubscriber.on('message', function(channel, message) {
      debugPS(`Web app received message(${message})`);
      let msgObj = JSON.parse(message);
      if (msgObj.type === 'ORDER_CHANGED') {
        app.models.Order.emitEvent(_.get(app, ['sockets', 'order']), 'save');
      }
    });
    debugPS('Subscribing to channel \'web-app\'.');
    app.redisSubscriber.subscribe('web-app');
  }
};
