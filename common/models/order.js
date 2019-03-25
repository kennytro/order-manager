'use strict';
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const Promise = require('bluebird');
const _ = require('lodash');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(Order) {
  Order.createNew = async function(orderData, orderItems, metadata) {
    let result = {};
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order, OrderItem } = models;
        if (_.get(metadata, ['endUserId'])) {
          orderData.createdBy = metadata.endUserId;
        }
        let newOrder = await Order.create(orderData);
        let newOrderItems = _.each(orderItems, oi =>  oi.orderId = newOrder.id);
        newOrderItems = await OrderItem.create(newOrderItems);
        result = {
          status: 200,
          message: `New order(id: ${newOrder.id}) created.`,
          orderId: newOrder.id
        };
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot create new order - ${error.message}`);
    }
    return result;
  };

  Order.updateOrder = async function(orderData, orderItems, metadata) {
    let result = {};
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order, OrderItem } = models;
        await _checkDataVersion(orderData);
        logger.debug(`Updating order(id: ${orderData.id})...`);
        // update metadata
        if (_.get(metadata, ['endUserId'])) {
          orderData.updatedBy = metadata.endUserId;
        }
        let newOrder = await Order.upsert(orderData);
        logger.debug(`Updated order(id: ${newOrder.id})`);
        logger.debug('Deleting order items...');
        await OrderItem.destroyAll({ orderId: orderData.id });
        let newOrderItems = _.each(orderItems, oi =>  oi.orderId = newOrder.id);
        newOrderItems = await OrderItem.create(newOrderItems);
        logger.debug(`  Created ${newOrderItems.length} order items`);
        result = {
          status: 200,
          message: `Order(id: ${newOrder.id}) is updated.`,
          orderId: newOrder.id
        };
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot update order - ${error.message}`);
    }
    return result;
  };

  Order.cancelOrder = async function(orderData, metadata) {
    let result = {};
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Order } = models;
        let existingOrder = await _checkDataVersion(orderData);
        // update metadata
        if (_.get(metadata, ['endUserId'])) {
          existingOrder.updatedBy = metadata.endUserId;
        }
        existingOrder.status = 'Cancelled';
        await existingOrder.save();
        logger.info(`Cancelled order(id: ${existingOrder.id})`);
        result = {
          status: 200,
          message: `Order(id: ${existingOrder.id}) is cancelled.`,
          orderId: existingOrder.id
        };
      });
    } catch (error) {
      if (error instanceof HttpErrors) {
        throw error;
      }
      throw new HttpErrors(500, `cannot cancel order(id: ${orderData.id}) - ${error.message}`);
    }
    return result;
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
};
