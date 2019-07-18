'use strict';
const appRoot = require('app-root-path');
const debugMockData = require('debug')('order-manager:Client:mockData');
const Promise = require('bluebird');
const yn = require('yn');
const _ = require('lodash');
const app = require(appRoot + '/server/server');
const metricSetting = require(appRoot + '/config/metric');
module.exports = function(Client) {
  const REDIS_CLIENT_DELETED_KEY = metricSetting.redisClientDeletedSetKey;

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
            // NOTE: we must delete statement first, so that orders can be
            // deleted without referential intergrity issue.
            await Statement.destroyAll({ clientId: id });

            await Promise.all([
              EndUser.destroyAll({ clientId: id }),
              Order.destroyAll({ clientId: id })
            ]);
            await target.destroy();
            target.addToRedisSet();    // run asynchronously
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

  /**
   * create 5 mock clients. Mock clients have an email 'mockClient@etr.com'
   * @returns {Client[]} - array of mock clients
   */
  Client.mockData = async function() {
    if (!yn(process.env.CREATE_MOCK_DATA)) {
      return [];
    }
    debugMockData('Client.mockData() - Begins');
    let clients = [];
    const MockEmail = 'mockClient@etr.com';
    clients = await Client.find({ where: { email: MockEmail } });
    if (clients.length === 0) {
      const MockClients = [
        {
          name: 'Kenny Market',
          addressStreet: '3508 W 3rd St.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90020',
          phone: '213-555-1111', email: MockEmail, contactPersonName: 'Kenny T. Ro', contactPersonPhone: '213-555-1112',
          feeType: 'Rate', feeValue: 3.50, showPublic: false
        },
        {
          name: 'Jose Food',
          addressStreet: '928 S Western Ave #257.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90006',
          phone: '213-555-2222', email: MockEmail, contactPersonName: 'Jose Ro', contactPersonPhone: '213-555-2221',
          feeType: 'Rate', feeValue: 4.50, showPublic: false
        },
        {
          name: 'LA Grocery',
          addressStreet: '2915 W Olympic Blvd.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90006',
          phone: '213-555-3333', email: MockEmail, contactPersonName: 'Kenny La', contactPersonPhone: '213-555-3332',
          feeType: 'Fixed', feeValue: 100.00, showPublic: false
        },
        {
          name: 'Kim\'s Dollar Store',
          addressStreet: '3917 W 6th St.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90020',
          phone: '213-555-4444', email: MockEmail, contactPersonName: 'Lan Y. Kim', contactPersonPhone: '213-555-4442',
          feeType: 'Rate', feeValue: 4.00, showPublic: false
        },
        {
          name: 'USA Market',
          addressStreet: '1471 W Jefferson Blvd.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90007',
          phone: '213-555-5551', email: MockEmail, contactPersonName: 'Steve Trump', contactPersonPhone: '213-555-5552',
          feeType: 'Rate', feeValue: 5.50, showPublic: false
        }
      ];
      try {
        const routes = await app.models.DeliveryRoute.find();
        MockClients.forEach(function(client, index) {
          client.deliveryRouteId = routes[index % routes.length].id;
        });
        clients = await Client.create(MockClients);
        clients.forEach(function(client) {
          debugMockData(`<Client[${client.id}]>: Created new client`);
        });
      } catch (error) {
        console.error(`Failed to create mock clients - ${error.message}`);
      }
    }
    debugMockData('Client.mockData() - Ends');
    return clients;
  };

  /**
   * Add client id to the 'delete' set in Redis.
   *
   * When a client is deleted, we add its id to a designated set in Redis
   * to notify worker process to update metrics as a result of this change.
   */
  Client.prototype.addToRedisSet = function() {
    /* Commented out for now because there isn't a metric for client, yet.
    if (app.redis) {
      app.redis.sadd(REDIS_CLIENT_DELETED_KEY, this.id);
    }
    */
  };
};
