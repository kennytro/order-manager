'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const Promise = require('bluebird');
const debugInit = require('debug')('order-manager:Map:init');
const logger = require(appRoot + '/config/winston');

/**
 * Get an array of client without a location coordinate.
 * If a client has failed to get coordiate too often, log its ID and skip it.
 * @param {Object} - application.
 * @returns {Client[]} - clients without coordinates.
 */
async function getClientsMissingCoordinates(app) {
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

/**
 * Update 'location_lat' and 'location_lng' in company_info table.
 * @param {Object} - application.
 */
async function updateCompanyCoordinates(app) {
  let companyInfo = await app.models.CompanyInfo.getCompanyInfo();
  if (_.isUndefined(companyInfo.addressStreet) ||
    _.isUndefined(companyInfo.addressCity) ||
    _.isUndefined(companyInfo.addressState) ||
    _.isUndefined(companyInfo.addressZip)) {
    logger.warn('Company information lacks address to lookup geocodes.');
    return;
  }
  const address = [companyInfo.addressStreet, companyInfo.addressCity, companyInfo.addressState, companyInfo.addressZip].join(' ');
  let geocode;
  try {
    debugInit(`Getting geo code for ${address}`);
    let response = await app.mapClient.geocode({ address: address }).asPromise();
    geocode = _.get(response, 'json.results[0].geometry.location');
    if (geocode) {
      debugInit(`Address(${address}) has geo code(${JSON.stringify(geocode, null, 4)})`);
    } else {
      logger.error(`Can't find geometry location from ${JSON.stringify(response.json.results, null, 4)}`);
    }
  } catch (err) {
    logger.error(`Failed to get Google map geo code(address: ${address}) - ${err}`);
  }

  if (geocode &&
    geocode.lat !== companyInfo.locationLat &&
    geocode.lng !== companyInfo.locationLng) {
    debugInit('Updating geo code of company');
    try {
      await app.models.CompanyInfo.upsert({
        key: 'locationLat', value: geocode.lat
      });
      await app.models.CompanyInfo.upsert({
        key: 'locationLng', value: geocode.lng
      });
    } catch (err) {
      logger.error(`Failed to update geo codeof company - ${err.message}`);
    }
  }
}

/**
 * In case client doesn't have geo coordinates(e.g. clients loaded through back-door),
 * we get coordinates from map service provider by simply saving the clients.
 */
module.exports = async function(app) {
  // Save client location coordinates if missing
  try {
    let clients = await getClientsMissingCoordinates(app);
    await Promise.each(clients, async (client) => {
      // Client.observer('before save') updates Geo codes
      await client.save();
    });
  } catch (error) {
    logger.error(`Error while updating client location coordinates - ${error.message}`);
  }

  try {
    await updateCompanyCoordinates(app);
  } catch (error) {
    logger.error(`Error while updating company location coordinates - ${error.message}`);
  }
};
