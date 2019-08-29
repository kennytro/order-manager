'use strict';
const appRoot = require('app-root-path');
const debugMockData = require('debug')('order-manager:Client:mockData');
const debugMap = require('debug')('order-manager:Map:update');
const Promise = require('bluebird');
const yn = require('yn');
const _ = require('lodash');
const app = require(appRoot + '/server/server');
const metricSetting = require(appRoot + '/config/metric');
const logger = require(appRoot + '/config/winston');

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
            // destroy models that use external resources(e.g. S3).
            // NOTE: we must delete statement first, so that orders can be
            // deleted without referential intergrity issue.
            let statements = await Statement.find({ where: { clientId: id }, fields: { id: true } });
            await Promise.map(statements, async function(statement) {
              await Statement.destroyById(statement.id, Promise.reject);
            });
            let orders = await Order.find({ where: { clientId: id }, fields: { id: true } });
            await Promise.map(orders, async function(order) {
              await Order.destroyById(order.id, Promise.reject);
            });

            // finally remove other model instances.
            await EndUser.destroyAll({ clientId: id });
            await target.destroy();
          }
        });
      } catch (error) {
        callback(error);
      }
    };
  });

  /* Before client is saved, we translate address to geo coordinates.
   */
  Client.observe('before save', async function(ctx) {
    if (app.mapClient) {
      if (ctx.instance) {
        let client = ctx.instance;
        if (client.hasFullAddress && !client.hasCoordinates && client.retryGeoCoding()) {
          let result = await Client.getGeoCodes(client.address, app.mapClient);
          if (result.coordinates) {
            debugMap(`Client(id: ${client.id}) has new coordinates(${JSON.stringify(result.coordinates)})`);
            client.coordinates = result.coordinates;
          } else {
            client.coordinateFailCount = client.coordinateFailCount + 1;
            debugMap(`Client(id: ${client.id}) has new coordinate fail count(${client.coordinateFailCount})`);
          }
        }
      } else if (ctx.currentInstance && ctx.data) {
        let client = ctx.currentInstance;
        if (!client.sameAddress(ctx.data) &&
          ctx.data.addressStreet &&
          ctx.data.addressCity &&
          ctx.data.addressState &&
          ctx.data.addressZip) {
          let newAddress = ctx.data.addressStreet + ' ' + ctx.data.addressCity + ' ' + ctx.data.addressState + ' ' + ctx.data.addressZip;
          debugMap(`Client(id: ${ctx.currentInstance.id}) has new address(${newAddress})`);
          let result = await Client.getGeoCodes(newAddress, app.mapClient);
          if (result.coordinates) {
            debugMap(`Client(id: ${client.id}) has new coordinates(${JSON.stringify(result.coordinates)})`);
            _.set(ctx.data, ['settings', 'location'], result.coordinates);
          } else {
            _.set(ctx.data, ['settings', 'location', 'failureCount'], 0);
            debugMap(`Client(id: ${client.id}) has new coordinate fail count(1)`);
          }
        }
      }
    }
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
   * Use Google Geocoding API to translate client address to geographic
   * coordinates.
   * @param {String} - address
   * @param {Object} - map client
   * @returns {Object} - {error_message:String, coordinates:Object}
   */
  Client.getGeoCodes = async function(address, mapClient) {
    let result = {
      error_message: null,
      coordinates: null
    };
    try {
      debugMap(`Getting geo code for ${address}`);
      let response = await mapClient.geocode({ address: address }).asPromise();
      let geocode = _.get(response, 'json.results[0].geometry.location');
      if (geocode) {
        debugMap(`Address(${address}) has geo code(${JSON.stringify(geocode, null, 4)})`);
        result.coordinates = geocode;
      } else {
        logger.error(`Can't find geometry location from ${JSON.stringify(response.json.results, null, 4)}`);
        result.error_message = 'Cannot find geometry location data';
      }
    } catch (err) {
      logger.error(`Failed to get Google map geo code(address: ${address}) - ${err}`);
      result.error_message = err;
    }
    return result;
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

  /**
   * checks if given client data has same address.
   * @returns {Boolean} - TRUE if address is same.
   */
  Client.prototype.sameAddress = function(clientData) {
    return this.addressStreet === clientData.addressStreet &&
      this.addressCity === clientData.addressCity &&
      this.addressState === clientData.addressState &&
      this.addressZip === clientData.addressZip;
  };

  /**
   * Can we run this client through Google Geocoding service?
   * If this client has failed more than max count(10), then we
   * give up unless its address changes.
   * @returns {Boolean} - TRUE if this client should use Geocoding.
   */
  Client.prototype.retryGeoCoding = function() {
    const MAX_FAILURE_COUNT = 10;
    return this.coordinateFailCount <= MAX_FAILURE_COUNT;
  };
};
