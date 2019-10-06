'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const Promise = require('bluebird');
const yn = require('yn');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');
const PdfMaker = require(appRoot + '/common/util/make-pdf');
const fileStorage = require(appRoot + '/common/util/file-storage');
const tenantSetting = require(appRoot + '/config/tenant');
const redisKeys = require(appRoot + '/config/redis-keys');
/**
 * @param {Number} - subtotal
 * @param {Object} - Client instance
 * @returns {Number} - fee
 */
function calculateFee(subtotal, client) {
  let fee = 0;
  if (client && client.feeSchedule === 'Order') {
    if (client.feeType === 'Fixed') {
      fee = client.feeValue;
    } else if (client.feeType === 'Rate') {
      fee = subtotal * (client.feeValue / 100);
    }
  }
  return fee;
}

/**
 * @param {Number} - subtotal
 * @param {Number} - fee
 * @param {Object} - Client instance
 * @returns {String} - fee explanation
 */
function explainFee(subtotal, fee, client) {
  let explanation = null;
  if (client && client.feeSchedule === 'Order') {
    if (client.feeType === 'Fixed') {
      explanation = 'Fixed amount';
    } else if (client.feeType === 'Rate') {
      explanation = `$${subtotal.toFixed(2)} x ${client.feeValue}(%) = $${fee.toFixed(2)}`;
    }
  }
  return explanation;
}

/**
 * Given orderItem instances and price maps, update unit price of product
 *
 * @param {Object[]} - OrderItem instances
 * @param {Map<integer, Number>} - price map
 * @returns {Object[]} - updated order item list.
 */
function updateOrderItemPrice(orderItems, priceMap) {
  let updatedItems = [];
  orderItems.forEach(orderItem => {
    let unitPrice = priceMap.get(orderItem.productId);
    if (unitPrice && unitPrice !== orderItem.unitPrice) {
      orderItem.unitPrice = unitPrice;
      updatedItems.push(orderItem);
    }
  });
  return updatedItems;
}

/**
 * update order amounts and fee if applicable by client.
 * @param {Object} - Order instance
 * @param {Object[]} - OrderItem instances
 * @param {Object} - Client instance
 */
function updateOrderAmount(order, orderItems, client) {
  order.subtotal = _.reduce(orderItems, (sum, i) => sum + (i.unitPrice * i.quantity), 0);
  if (client && client.feeSchedule === 'Order') {
    order.fee = calculateFee(order.subtotal, client);
    order.feeExplanation = explainFee(order.subtotal, order.fee, client);
  }
  order.totalAmount = order.subtotal + order.fee;
}

module.exports = function(Order) {
  const REDIS_ORDER_CHANGED_KEY = require(appRoot + '/config/redis-keys').orderChangedSetKey;

  // Don't allow delete by ID. Instead cancel order.
  Order.disableRemoteMethodByName('deleteById');

  Order.on('dataSourceAttached', function(obj) {
    /**
     * Override 'destroyById()'.
     *
     * Check no statement is assigned, and delete invoice afterward.
     */
    Order.destroyById = async function(id, callback) {
      callback = callback || function() { };
      try {
        let invoiceFileName = null;
        let target = await Order.findById(id);
        if (target) {
          if (target.statementId) {
            let error = new Error(`Order(id: ${id}) cannot be deleted because it belongs to a Statement(id: ${target.statementId}`);
            error.status = 409;  // Conflict
            throw error;
          }
          invoiceFileName = target.getPdfName();
          await target.destroy();
        }
        if (invoiceFileName) {
          await fileStorage.deleteFile({
            path: 'om-private',
            fileName: invoiceFileName
          });
          logger.info(`Deleted order invoice PDF(${invoiceFileName})`);
        }
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
        origUpdateAll.call(this, where, data, (err, info) => {
          if (!err) {
            Order.emitEvent(_.get(app, ['sockets', 'order']), 'save');
          }
          callback(err, info);
        });
      } else {
        return origUpdateAll.call(this, where, data)
          .then(info => {
            Order.emitEvent(_.get(app, ['sockets', 'order']), 'save');
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
    // newOrder.generatePdf(); - generated by worker
    newOrder.addToRedisSet();
    Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', newOrder.clientId);
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
    // newOrder.generatePdf();  -- generated by worker
    newOrder.addToRedisSet();
    Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', newOrder.clientId);
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
    Order.emitEvent(_.get(app, ['sockets', 'order']), 'save', existingOrder.clientId);
    return {
      status: 200,
      message: `Order(id: ${existingOrder.id}) is cancelled.`,
      orderId: existingOrder.id
    };
  };

  /**
   * Update order status to 'Shipped' and may perform additional tasks:
   *  1. update ordered items' unit price and total amount
   *  2. generate PDF invoice.
   * @param{string[]} orderIds - array of order Id.
   * @param{object} metadata
  **/
  Order.shipOrders = async function(orderIds, metadata) {
    let updateCount = 0;
    if (yn(process.env.UPDATE_ORDER_UPON_SHIPPED)) {
      let [orders, products, clients] = await Promise.all([
        Order.find({
          where: { id: { inq: orderIds } },
          include: 'orderItem'
        }),
        app.models.Product.find({ fields: { id: true, unitPrice: true } }),
        app.models.Client.find({ fields: { id: true, feeType: true, feeValue: true, feeSchedule: true } })
      ]);
      orders.forEach(order => order.status = 'Shipped');
      let priceMap = new Map(products.map(product => [product.id, product.unitPrice]));
      let clientMap = new Map(clients.map(client => [client.id, client]));
      try {
        let updatedOrders = new Set();
        await app.dataSources.OrderManager.transaction(async models => {
          const { Order, OrderItem } = models;
          await Promise.each(orders, async (order) => {
            let orderItems = order.toJSON().orderItem;
            let updatedOrderItems = updateOrderItemPrice(orderItems, priceMap);
            if (!_.isEmpty(updatedOrderItems)) {
              // update order amount and orderItems
              updateOrderAmount(order, orderItems, clientMap.get(order.clientId));
              await Promise.each(updatedOrderItems, async (orderItem) => await OrderItem.upsert(orderItem));
              updatedOrders.add(order.id);
            }
            await order.save();
          });
        });
        // run the following commands asynchronously
        orders.forEach(function(order) { order.addToRedisSet(); });
        if (!_.isEmpty(orders)) {
          Order.emitEvent(_.get(app, ['sockets', 'order']), 'save');
        }
      } catch (error) {
        console.error(error);
        throw new HttpErrors(500, `cannot ship orders - ${error.message}`);
      }
    } else {
      // just update order status without updating.
      await Order.updateAll({ id: { inq: orderIds } }, { status: 'Shipped' });
    }

    // finally publish order IDs for worker to generate invoice PDF.
    if (app.redis) {
      app.redis.sadd(redisKeys.orderInvoiceSetKey, orderIds);
      app.redis.publish('worker', JSON.stringify({ type: 'GENERATE_ORDER_INVOICE' }));
    }
    return {
      status: 200,
      message: `Shipped ${orderIds.length} orders.`,
      orderIds: orderIds
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
    });
    if (!_.isEmpty(existingOrders)) {
      Order.emitEvent(_.get(app, ['sockets', 'order']), 'save');
    }

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
      fields: { id: true, clientId: true, hasInvoice: true }
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

  Order.makeInvoiceFileName = function(clientId, orderId) {
    return `${tenantSetting.id}/${clientId}/order/${orderId}.pdf`;
  };

  Order.prototype.getPdfName = function() {
    if (this.hasInvoice) {
      return Order.makeInvoiceFileName(this.clientId, this.id);
    }
    return null;
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
      fileName: Order.makeInvoiceFileName(this.clientId, this.id),
      fileType: 'application/pdf',
      ACL: 'private'
    });
    this.hasInvoice = true;
    await this.save();
    logger.info(`Order Invoice PDF of ${this.id} is saved`);
  };

  /**
   */
  Order.prototype.deletePdf = async function() {
    if (this.getPdfName()) {
      await fileStorage.deleteFile({
        path: 'om-private',
        fileName: this.getPdfName()
      });
      logger.info(`Deleted order invoice PDF of ${this.id}`);
    }
    this.hasInvoice = false;
  };

  Order.prototype.getPdfUrl = async function() {
    if (this.hasInvoice) {
      return await fileStorage.presignFileUrl('getObject', {
        path: 'om-private',
        fileName: this.getPdfName(),
        expires: 30
      });
    }
    return null;
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
   * emitted before transaction is committed). Instead we require all order
   * modifying APIs to call this funciton manually.
   *
   * @param {Object} - socket IO instance
   * @param {String} - operation type.
   * @param {Integer} - Client ID of order changed. NULL means orders of multiple
   *                    clients are changed.
   */
  Order.emitEvent = function(socket, operation, clientId) {
    if (socket) {
      socket.emit('order', {
        operation: operation,
        clientId: clientId
      });
    }
  };
};
