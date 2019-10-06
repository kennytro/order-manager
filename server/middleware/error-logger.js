'use strict';
const appRoot = require('app-root-path');
const logger = require(appRoot + '/config/winston');

module.exports = function(options) {
  return function logError(err, req, res, next) {
    logger.error('unhandled error ', err);
    next(err);
  };
};
