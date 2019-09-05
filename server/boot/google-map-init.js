'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const logger = require(appRoot + '/config/winston');

module.exports = async function(app) {
  if (process.env.ONE_OFF) {
    return; // skip initialization for one off process.
  };

  if (!process.env.GOOGLE_GEOCODE_API_KEY) {
    logger.warn('Google geocode API key is not set. Address translation to geocode will not be available.');
  }

  const googleMapClient = require('@google/maps').createClient({
    key: process.env.GOOGLE_GEOCODE_API_KEY,
    Promise: Promise
  });

  app.mapClient = googleMapClient;
  logger.info('Created Google map client');
};
