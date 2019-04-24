'use strict';
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const Promise = require('bluebird');
const _ = require('lodash');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');
const PdfMaker = require(appRoot + '/common/util/make-pdf');
const fileStorage = require(appRoot + '/common/util/file-storage');
const tenantSetting = require(appRoot + '/config/tenant');

module.exports = function(Order) {
  // Don't allow delete by ID. Instead cancel order.
  Order.disableRemoteMethodByName('deleteById');
  /**
   * Override 'destroyById()'.
   *
   * Check no statement is assigned, and perform cascade delete on
   * its OrderItem instances.
   */
  Order.on('dataSourceAttached', function(obj) {
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
    newOrder.generatePdf();  // run asynchronously
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
      throw new HttpErrors(500, `cannot update order - ${error.message}`);
    }
    newOrder.generatePdf();  // run asynchronously
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
    return {
      status: 200,
      message: `Order(id: ${existingOrder.id}) is cancelled.`,
      orderId: existingOrder.id
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
};
