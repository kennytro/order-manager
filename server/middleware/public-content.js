'use strict';
const appRoot = require('app-root-path');
const _  = require('lodash');
const HttpErrors = require('http-errors');
const logger = require(appRoot + '/config/winston');

/**
 * @param {Object} - application
 * @returns {Object[]} - cleaned product list.
 */
async function getPublicProducts(app) {
  let products = [];
  try {
    products = await app.models.Product.find({
      where: { showPublic: true },
      fields: {
        name: true,
        description: true,
        category: true,
        unitPrice: true,
        unit: true,
        createdDate: true,
        settings: true
      },
      order: ['category ASC', 'name ASC']
    });
  } catch (error) {
    logger.error(`Error returned from Product.find() - ${error.message}`);
    throw error;
  }

  // include only imageURL in setting for security.
  return products.map(product => {
    let imageUrl = '';
    if (_.get(product, ['settings', 'hasImage'], false)) {
      imageUrl = _.get(product, ['settings', 'imageUrl']);
    }
    product.imageUrl = imageUrl;
    product.unsetAttribute('settings');
    return product;
  });
}

/**
 * @param {Object} - application
 * @returns {Object[]} - object containing location of company and its clients.
 */
async function getPublicClientLocations(app) {
  let result = {
    company: null,
    clients: []
  };

  try {
    let [companyInfo, clients] = await Promise.all([
      app.models.CompanyInfo.getCompanyInfo(),
      app.models.Client.find({
        where: { showPublic: true },
        fields: {
          name: true,
          settings: true
        },
        order: 'name ASC'
      })
    ]);
    result.company = {
      name: companyInfo.name,
      lat: Number(companyInfo.locationLat),
      lng: Number(companyInfo.locationLng)
    };
    result.clients = clients.map(client => {
      return {
        name: client.name,
        lat: _.get(client, ['settings', 'location', 'lat']),
        lng: _.get(client, ['settings', 'location', 'lng'])
      };
    });
  } catch (error) {
    logger.error(`Error returned from Company/Client.find() - ${error.message}`);
    throw error;
  }

  return result;
}

module.exports = async function(app, req, res, next) {
  const name = _.get(req, 'params.name');

  if (name === 'products') {
    return res.send(await getPublicProducts(app));
  }
  if (name === 'clients') {
    return res.send(await getPublicClientLocations(app));
  }
  let elements = await app.models.PublicPageElement.find({
    where: { name: name },
    order: 'sequenceNumber ASC'
  });
  if (_.isEmpty(elements)) {
    return next(new HttpErrors(404, `No element of ${name} found`));
  }

  res.send({ html: _(elements).map('value').join('') });
};
