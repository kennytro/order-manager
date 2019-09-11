'use strict';
const appRoot = require('app-root-path');
const _  = require('lodash');
const HttpErrors = require('http-errors');
const logger = require(appRoot + '/config/winston');

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

module.exports = async function(app, req, res, next) {
  const name = _.get(req, 'params.name');

  if (name === 'products') {
    return res.send(await getPublicProducts(app));
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
