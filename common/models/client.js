'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const app = require(appRoot + '/server/server');

module.exports = function(Client) {
  /* Replace built-in 'destroyById' with custom function that performs
   * cascade deletion. */
  Client.on('dataSourceAttached', function(obj) {
    Client.destroyById = async function(id, callback) {
      callback = callback || function() { };
      try {
        await app.dataSources.OrderManager.transaction(async models => {
          const { Client, EndUser, Order, Statement } = models;
          let target = await Client.findById(id);
          if (target) {
            await Promise.all([
              EndUser.destroyAll({ clientId: id }),
              Order.destroyAll({ clientId: id }),
              Statement.destroyAll({ clientId: id })
            ]);
            await target.destroy();
          }
        });
      } catch (error) {
        callback(error);
      }
    };
  });

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
   * @returns {Client[]} - list of client instances with at least one
   *   statement-ready order - completed order with no statement assigned.
   */
  Client.getMyClient = async function(clientId) {
    return await app.models.Client.findById(clientId);
  };

  Client.findStatementReady = async function() {
    let candidateClients = await Client.find({
      include: {
        relation: 'orders',
        scope: {
          where: { and: [{ status: 'Completed' }, { statementId: null }] },
          limit: 1
        }
      }
    });

    return _.filter(candidateClients, client => {
      const client2 = client.toJSON();
      return !_.isEmpty(client2.orders);
    });
  };
};
