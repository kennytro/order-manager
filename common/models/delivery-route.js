'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const HttpErrors = require('http-errors');
const debugMap = require('debug')('order-manager:Map:update');
const logger = require(appRoot + '/config/winston');

module.exports = function(DeliveryRoute) {
  /**
   * @param {String} - delivery route id
   * @returns {Object[]} - location information of clients in the route.
   */
  DeliveryRoute.getClientLocation = async function(routeId) {
    let deliveryRoute = await DeliveryRoute.findById(routeId, {
      include: 'clients'
    });
    if (!deliveryRoute) {
      throw new HttpErrors(404, `cannot find delivery route(id: ${routeId})`);
    }
    return deliveryRoute.toJSON().clients.map(client => {
      return {
        id: client.id,
        name: client.name,
        location: _.get(client, ['settings', 'location'])
      };
    });
  };
};
