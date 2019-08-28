'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const Promise = require('bluebird');
const debugInit = require('debug')('order-manager:Map:init');
const logger = require(appRoot + '/config/winston');

module.exports = async function(app) {
  if (process.env.ONE_OFF || !process.env.GOOGLE_GEOCODE_API_KEY) {
    return; // skip initialization for one off process.
  };

  const MAX_FAILURE_COUNT = 10;
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
      try {
        debugInit(`Getting geo code for ${client.address}`);
        let response = await app.mapClient.geocode({ address: client.address }).asPromise();
        let geocode = _.get(response, 'json.results[0].geometry.location');
        if (!geocode) {
          logger.error(`Can't find geometry location from ${JSON.stringify(response.json.results, null, 4)}`);
        } else {
          debugInit(`Client(id: ${client.id}) has geo code(${JSON.stringify(geocode, null, 4)})`);
          client.coordinates = geocode;
        }
      } catch (err) {
        logger.error(`Failed to get Google map geo code(address: ${client.address}) - ${err.json.error_message}`);
        client.coordinateFailCount = client.coordinateFailCount + 1;
        debugInit(`Client(id: ${client.id}) has new failure count ${client.coordinateFailCount}`);
      }

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
        let failCount = client.coordinateFailCount;
        if (failCount <= MAX_FAILURE_COUNT) {
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
