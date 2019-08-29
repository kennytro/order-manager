'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const Promise = require('bluebird');
const debugInit = require('debug')('order-manager:Map:init');
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

  if (!process.env.IS_WORKER) {
    return;  // leave updating clients' missing Geo coding to worker process.
  }

  // Save client location coordinates if missing
  try {
    let clients = await getClientsMissingCoordinates();
    await Promise.each(clients, async (client) => {
      // Client.observer('before save') updates Geo codes
      await client.save();
    });
  } catch (error) {
    logger.error(`Error while updating client location coordinates - ${error.message}`);
  }

  /**
   * Get an array of client without a location coordinate.
   * If a client has failed to get coordiate too often, log its ID and skip it.
   * @returns {Client[]} - clients without coordinates.
   */
  async function getClientsMissingCoordinates() {
    let clients = await app.models.Client.find();
    clients = clients.filter(client => {
      if (client.hasFullAddress && !client.hasCoordinates) {
        if (client.retryGeoCoding()) {
          return true;
        }
        logger.info(`Client(id: ${client.id}) has reached max failure count to get location coordinates.`);
      }
    });
    if (!_.isEmpty(clients)) {
      debugInit(`Found ${clients.length} client(s) without location coordinates.`);
    }
    return clients;
  }
};
