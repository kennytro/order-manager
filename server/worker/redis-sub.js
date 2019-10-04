'use strict';
const appRoot = require('app-root-path');
const debugPS = require('debug')('order-manager:PubSub');
const PdfMaker = require('./make-pdf');

module.exports = function(app) {
  if (app.redisSubscriber) {
    app.redisSubscriber.on('message', function(channel, message) {
      debugPS(`Worker received message(${message})`);
      let msgObj = JSON.parse(message);
      if (msgObj.type === 'GENERATE_ORDER_INVOICE') {
        PdfMaker.makeInvoice(app);
      }
      if (msgObj.type === 'GENERATE_STATEMENT') {
        PdfMaker.makeStatement(app);
      }
    });
    debugPS('Subscribing to channel \'worker\'.');
    app.redisSubscriber.subscribe('worker');
  }
};
