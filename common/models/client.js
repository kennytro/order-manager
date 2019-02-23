'use strict';
const Promise = require('bluebird');
const _ = require('lodash');
const app = require('../../server/server');

module.exports = function(Client) {
  Client.observe('before delete', async function(ctx) {
    let clientId = _.get(ctx, ['where', 'id'], null);
    if (clientId) {
      /* TO DO: perform cascade delete of owned objects
      await Promise.all([
        app.models.Order.destroyAll({ clientId: clientId })
        ]);
        */
    }
  });
};
