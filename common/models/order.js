'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const Promise = require('bluebird');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');
const PdfMaker = require(appRoot + '/common/util/make-pdf');
const fileStorage = require(appRoot + '/common/util/file-storage');
const tenantSetting = require(appRoot + '/config/tenant');
const metricSetting = require(appRoot + '/config/metric');

module.exports = function(Order) {
  const REDIS_ORDER_CHANGED_KEY = metricSetting.redisOrderChangedSetKey;

  // Don't allow delete by ID. Instead cancel order.
  Order.disableRemoteMethodByName('deleteById');

  Order.on('dataSourceAttached', function(obj) {
    /**
     * Override 'destroyById()'.
     *
     * Check no statement is assigned, and perform cascade delete on
     * its OrderItem instances.
     */
    Order.destroyById = async function(id, callback) {
      callback = callback || function() { };
      try {
        await app.dataSources.OrderManager.transaction(async models => {
          const { Order, OrderItem } = models;
          let target = await Order.findById(id);
          if (target) {
            if (target.statementId) {
              throw new Error(`Order(id: ${id}) cannot be deleted because it belongs to a Statement(id: ${target.statementId}`);
            }
            await OrderItem.destroyAll({ orderId: id });
            await target.deletePdf();
            await target.destroy();
          }
        });
      } catch (error) {
        callback(error);
      }
    };

    /**
     * Override 'updateAll()'
     *
     * After updateAll() succeeds, emit an event.
     */
    let origUpdateAll = Order.updateAll;
    Order.updateAll = function(where, data, callback) {
      if (_.isFunction(callback)) {
        origUpdateAll.call(Order, where, data, (err, info) => {
          if (!err) {
            Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', null);
          }
          callback(err, info);
        });
      } else {
        return origUpdateAll.call(Order, where, data)
          .then(info => {
            Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', null);
            return info;
          });
      }
    };
  });

  Order.createNew = async function(orderData, orderItems, metadata) {
    let newOrder = null;
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order, OrderItem } = models;
        if (_.get(metadata, ['endUserId'])) {
          orderData.createdBy = metadata.endUserId;
        }
        newOrder = await Order.create(orderData);
        let newOrderItems = _.each(orderItems, oi =>  oi.orderId = newOrder.id);
        newOrderItems = await OrderItem.create(newOrderItems);
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot create new order - ${error.message}`);
    }
    // run the following commands asynchronously
    newOrder.generatePdf();
    newOrder.addToRedisSet();
    Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', newOrder);
    return {
      status: 200,
      message: `New order(id: ${newOrder.id}) created.`,
      orderId: newOrder.id
    };
  };

  Order.updateOrder = async function(orderData, orderItems, metadata) {
    let newOrder;
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order, OrderItem } = models;
        await _checkDataVersion(orderData);
        logger.debug(`Updating order(id: ${orderData.id})...`);
        // update metadata
        if (_.get(metadata, ['endUserId'])) {
          orderData.updatedBy = metadata.endUserId;
        }
        newOrder = await Order.upsert(orderData);
        logger.debug(`Updated order(id: ${newOrder.id})`);
        logger.debug('Deleting order items...');
        await OrderItem.destroyAll({ orderId: orderData.id });
        let newOrderItems = _.each(orderItems, oi =>  oi.orderId = newOrder.id);
        newOrderItems = await OrderItem.create(newOrderItems);
        logger.debug(`  Created ${newOrderItems.length} order items`);
      });
    } catch (error) {
      if (error instanceof HttpErrors) {
        throw error;
      }
      throw new HttpErrors(500, `cannot update order - ${error.message}`);
    }
    // run the following commands asynchronously
    newOrder.generatePdf();
    newOrder.addToRedisSet();
    Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', newOrder);
    return {
      status: 200,
      message: `Order(id: ${newOrder.id}) is updated.`,
      orderId: newOrder.id
    };
  };

  Order.cancelOrder = async function(orderData, metadata) {
    let existingOrder;
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order } = models;
        existingOrder = await _checkDataVersion(orderData);
        // update metadata
        if (_.get(metadata, ['endUserId'])) {
          existingOrder.updatedBy = metadata.endUserId;
        }
        existingOrder.status = 'Cancelled';
        await existingOrder.save();
        logger.info(`Cancelled order(id: ${existingOrder.id})`);
      });
    } catch (error) {
      if (error instanceof HttpErrors) {
        throw error;
      }
      throw new HttpErrors(500, `cannot cancel order(id: ${orderData.id}) - ${error.message}`);
    }
    // run the following commands asynchronously
    existingOrder.addToRedisSet();
    Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', existingOrder);
    return {
      status: 200,
      message: `Order(id: ${existingOrder.id}) is cancelled.`,
      orderId: existingOrder.id
    };
  };

  /**
   * Update order status to 'Completed'
   * @param{string[]} orderIds - array of order Id.
   * @param{object} metadata
  **/
  Order.completeOrders = async function(orderIds, metadata) {
    let existingOrders = [];
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order } = models;
        existingOrders = await Order.find({ where: { and: [
          { id: { inq: orderIds } },
          { status: { neq: 'Completed' } }
        ] } });
        await Promise.each(existingOrders, async (order) => {
          // update metadata
          if (_.get(metadata, ['endUserId'])) {
            order.updatedBy = metadata.endUserId;
          }
          order.status = 'Completed';
          await order.save();
          logger.info(`Completed order(id: ${order.id})`);
        });
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot complete orders - ${error.message}`);
    }

    // run the following commands asynchronously
    existingOrders.forEach(order => {
      order.addToRedisSet();
      Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', order);
    });
    return {
      status: 200,
      message: `Completed ${existingOrders.length} orders.`,
      orderIds: orderIds
    };
  };

  /*
   * Check if persistent data has been changed.
   * @param{Order} - orderData
   * @returns{Order} - order instance in database
   */
  async function _checkDataVersion(orderData) {
    let existingOrder = await app.models.Order.findById(orderData.id);
    if (!existingOrder) {
      throw new HttpErrors(404, `cannot find order(id: ${orderData.id})`);
    }
    if (existingOrder.updatedAt > orderData.updatedAt) {
      throw new HttpErrors(409, `Your order data(updated at ${orderData.updatedAt}) is older than the copy in database(updated at ${existingOrder.updatedAt})`);
    }
    return existingOrder;
  }

  /*
   * @param {number} client id
   * @returns {Order[]} - list of statement-ready order of given client.
   */
  Order.findStatementReady = async function(clientId) {
    return await Order.find({
      where: {
        and: [
          { clientId: clientId },
          { status: 'Completed' },
          { statementId: null }
        ]
      },
      include: 'orderItem'
    });
  };

  Order.getOrderInvoicePdfUrl = async function(orderId) {
    const order = await Order.findById(orderId, {
      fields: { id: true, clientId: true }
    });
    if (order) {
      return await order.getPdfUrl();
    }
    return null;
  };

  /**
   * Create a list of product order item of given orders.
   *
   * @param {string[]} - list of order id.
   * @returns {Object[]} - list of product with order count.
   */
  Order.getShoppingList = async function(orderIds) {
    if (_.isEmpty(orderIds)) {
      return [];
    }
    const [orders, products] = await Promise.all([
      Order.find({
        where: { id: { inq: orderIds } },
        include: 'orderItem',
        fields: { id: true }
      }),
      app.models.Product.find()
    ]);
    let groupedOItems = _(orders)
      .map(function(order) {
        order = order.toJSON();
        return order.orderItem;
      })
      .flatten()
      .groupBy('productId')
      .value();

    return _.map(_.keys(groupedOItems), key => {
      const intKey = parseInt(key);
      let product = _.find(products, { id: intKey });
      const items = groupedOItems[key];
      product.totalOrderCount = _.reduce(items, (sum, n) => sum + parseInt(n.quantity), 0);
      return product;
    });
  };

  /**
   * Generate a PDF file of shopping list of given orders.
   * @param {string[]} - array of order id.
   * @returns {Object} - JSON object containing content type and file object.
   */
  Order.getShoppingListInPdf = async function(orderIds) {
    try {
      const productList = await Order.getShoppingList(orderIds);
      const pdfDoc = await PdfMaker.makeShoppingList(productList);
      return {
        contentType: 'application/pdf',
        document: pdfDoc
      };
    } catch (error) {
      logger.error(`Error while generating shopping list pdf file - ${error.message}`);
      throw error;
    }
  };

  /**
   * Create a list of product order items along with delivery route and client.
   *
   * @param {string[]} - list of order id.
   * @returns {Map} - Map of route Id to product order item.
   */
  Order.getPackageDistributionMap = async function(orderIds) {
    if (_.isEmpty(orderIds)) {
      return [];
    }
    const [orders, products, routes] = await Promise.all([
      Order.find({
        where: { id: { inq: orderIds } },
        fields: { id: true, clientId: true },
        include: ['orderItem', 'client']
      }),
      app.models.Product.find(),
      app.models.DeliveryRoute.find()
    ]);

    let productMap = new Map();
    products.forEach(function(product) {
      productMap.set(product.id, product);
    });

    let routeClientMap = new Map();
    let routeMap = new Map();
    orders.forEach(function(order) {
      order = order.toJSON();
      const client = order.client;
      const routeId = client.deliveryRouteId;
      if (!routeMap.has(routeId)) {
        routeMap.set(routeId, new Map());
      }

      if (!routeClientMap.has(routeId)) {
        routeClientMap.set(routeId, new Set([client.name]));
      } else {
        let clientSet = routeClientMap.get(routeId);
        clientSet.add(client.name);
      }
      let itemMap = routeMap.get(routeId);
      order.orderItem.forEach(function(orderItem) {
        const product = productMap.get(orderItem.productId);
        let totalQuantity = orderItem.quantity;
        if (itemMap.has(product.id)) {
          let clientMap = itemMap.get(product.id);
          if (clientMap.has(client.name)) {
            totalQuantity += clientMap.get(client.name);
          }
          clientMap.set(client.name, totalQuantity);
        } else {
          itemMap.set(product.id, new Map([[client.name, orderItem.quantity]]));
        }
      });
    });

    routeMap.forEach(function(itemMap, routeId, rMap) {
      let routeData = {
        name: routeId,
        clients: Array.from(routeClientMap.get(routeId).values()),
        items: []
      };

      itemMap.forEach(function(clientMap, productId, iMap) {
        const product = productMap.get(productId);
        let prodData = {
          id: product.id,
          name: product.name,
          description: product.description,
          totalCount: 0
        };
        routeData.clients.forEach(function(clientName) {
          prodData[clientName] = 0;
        });
        clientMap.forEach(function(quantity, clientName) {
          prodData[clientName] = Number(quantity);
          prodData['totalCount'] += prodData[clientName];
        });
        routeData.items.push(prodData);
      });
      rMap.set(routeId, routeData);
    });
    return routeMap;
  };

  /**
   * Generate a PDF file of package distribution of given orders.
   * @param {string[]} - array of order id.
   * @returns {Object} - JSON object containing content type and file object.
   */
  Order.getPackageDistributionListInPdf = async function(orderIds) {
    try {
      const routeMap = await Order.getPackageDistributionMap(orderIds);
      const pdfDoc = await PdfMaker.makePackageDistributionList(routeMap);
      return {
        contentType: 'application/pdf',
        document: pdfDoc
      };
    } catch (error) {
      logger.error(`Error while generating package distribution list pdf file - ${error.message}`);
      throw error;
    }
  };

  Order.prototype.getPdfName = function() {
    return `${tenantSetting.id}/${this.clientId}/order/${this.id}.pdf`;
  };

  Order.prototype.generatePdf = async function() {
    const [client, orderItems] = await Promise.all([
      app.models.Client.findById(this.clientId),
      app.models.OrderItem.find({
        where: { orderId: this.id },
        include: {
          relation: 'product'
        }
      })
    ]);
    if (!client) {
      throw new Error(`Order(id: ${this.id}) is missing a client`);
    }
    const pdfDoc = await PdfMaker.makeOrderInvoicePdf(this, client, orderItems);
    await fileStorage.uploadFile(pdfDoc, {
      path: 'om-private',
      fileName: this.getPdfName(),
      fileType: 'application/pdf',
      ACL: 'private'
    });

    logger.info(`Order Invoice PDF of ${this.id} is saved`);
  };

  Order.prototype.deletePdf = async function() {
    await fileStorage.deleteFile({
      path: 'om-private',
      fileName: this.getPdfName()
    });
    logger.info(`Deleted order invoice PDF of ${this.id}`);
  };

  Order.prototype.getPdfUrl = async function() {
    return await fileStorage.presignFileUrl('getObject', {
      path: 'om-private',
      fileName: this.getPdfName(),
      expires: 30
    });
  };

  /**
   * Add order id to the 'change' set in Redis.
   *
   * Any change in an order(except for status change) is added
   * to a designated set in Redis to notify worker process to
   * update metrics as a result of this change.
   */
  Order.prototype.addToRedisSet = function() {
    if (app.redis) {
      app.redis.sadd(REDIS_ORDER_CHANGED_KEY, this.id);
    }
  };

  /**
   * We can't use operation hooks provided by 'realtime.js' mixin because most
   * order is updated insided a transaction(This creates a situation event is
   * emitted before transaction is committed). Instead we require all order modifying
   * APIs to call this funciton manually.
   *
   * @param {Object} - socket IO instance
   * @param {String} - operation type.
   * @param {Object?} - order instance.
   */
  Order.emitEvent = function(socket, operation, order) {
    if (socket) {
      socket.emit('order', {
        operation: operation,
        clientId: order ? order.clientId : undefined
      });
    }
  };
};
