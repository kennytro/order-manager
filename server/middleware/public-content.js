'use strict';
const _  = require('lodash');
const HttpErrors = require('http-errors');

module.exports = async function(app, req, res, next) {
  const name = _.get(req, 'params.name');

  let elements = await app.models.PublicPageElement.find({
    where: { name: name },
    order: 'sequenceNumber ASC'
  });
  if (_.isEmpty(elements)) {
    return next(new HttpErrors(404, `No element of ${name} found`));
  }

  res.send({ html: _(elements).map('value').join('') });
};
