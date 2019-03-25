'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const app = require(appRoot + '/server/server');

module.exports = function(Client) {
  const AllowedMethodsByRole = {
    customer: ['getMyClient'],
    manager: [],
    admin: []
  };
  /*
   * @param {string} role name
   * @returns {string[]} allowed method name array.
   */
  Client.allowedMethods = function(role) {
    if (AllowedMethodsByRole[role]) {
      return AllowedMethodsByRole[role];
    }
    return [];
  };

  /* @param {number} id
   * @returns {Client}
   */
  Client.getMyClient = async function(clientId) {
    return await app.models.Client.findById(clientId);
  };

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
