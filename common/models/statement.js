'use strict';
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const Promise = require('bluebird');
const _ = require('lodash');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(Statement) {
  /* Override 'destroyById()' on Statement to update all orders
   * that are assigned the statement that is about to be deleted.
   */
  Statement.on('dataSourceAttached', function(obj) {
    Statement.destroyById = async function(id, callback) {
      callback = callback || function() { };
      try {
        await app.dataSources.OrderManager.transaction(async models => {
          const { Statement, Order } = models;
          let target = await Statement.findById(id);
          if (target) {
            await Order.updateAll({ statmentId: id }, { statementId: null });
            await target.destroy();
          }
        });
      } catch (error) {
        callback(error);
      }
    };
  });

  /*
   * @param {Object[]} - order objects to verify
   * @param {string} - [optional] statment id
   * @returns {string} - error message. Null if there is no error.
   */
  function verifyOrders(orders, statementId) {
    // all orders must be completed.
    let incompleteOrders = _.filter(orders, o => o.status !== 'Completed');
    if (!_.isEmpty(incompleteOrders)) {
      const openOrderIds = _(incompleteOrders).map('id').join(', ');
      return `Statement cannot contain order whose status is not 'Completed' - ${openOrderIds}`;
    }

    if (statementId) {
      // orders of existing statement must have same statement id or null
      let assignedOrders = _.filter(orders, o => o.statementId && o.statementId !== statementId);
      if (!_.isEmpty(assignedOrders)) {
        const assignedOrderIds = _(assignedOrders).map('id').join(', ');
        return `Statement cannot contain order already assigned another statement - ${assignedOrderIds}`;
      };
    } else {
      // orders of new statement cannot have order already assigned a statement
      let assignedOrders = _.filter(orders, o => o.statementId);
      if (!_.isEmpty(assignedOrders)) {
        const assignedOrderIds = _(assignedOrders).map('id').join(', ');
        return `Statement cannot contain order already assigned a statement - ${assignedOrderIds}`;
      }
    }
    if (_.isEmpty(orders)) {
      return 'Statement needs at least one completed order';
    }
    return null;
  }

  Statement.createNew = async function(statementData, orderIds, metadata) {
    let orders = await app.models.Order.find({ where: { id: { inq: orderIds } } });
    let errorMessage = verifyOrders(orders, null);
    if (errorMessage) {
      return {
        status: 400,
        message: errorMessage,
        statementId: null
      };
    }
    /* let incompleteOrders = _.filter(orders, o => o.status !== 'Completed');
    if (!_.isEmpty(incompleteOrders)) {
      const openOrderIds = _(incompleteOrders).map('id').join(', ');
      return {
        status: 400,
        message: `Statement cannot contain order whose status is not 'Completed' - ${openOrderIds}`,
        statementId: null
      };
    }

    let assignedOrders = _.filter(orders, o => o.statementId);
    if (!_.isEmpty(assignedOrders)) {
      const assignedOrderIds = _(assignedOrders).map('id').join(', ');
      return {
        status: 400,
        message: `Statement cannot contain order already assigned a statement - ${assignedOrderIds}`,
        statementId: null
      };
    }

    if (_.isEmpty(orders)) {
      return {
        status: 400,
        message: 'Statement needs at least one completed order',
        statementId: null
      };
    } */
    let result = {};
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Statement, Order } = models;
        if (_.get(metadata, ['endUserId'])) {
          statementData.createdBy = metadata.endUserId;
        }
        let newStatement = await Statement.create(statementData);
        await Order.updateAll({ id: { inq: orderIds } }, { statementId: newStatement.id });
        result = {
          status: 200,
          message: `New statement(id: ${newStatement.id}) created.`,
          statementId: newStatement.id
        };
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot create new statement - ${error.message}`);
    }
    return result;
  };

  Statement.updateStatement = async function(statementData, orderIds, metadata) {
    let orders = await app.models.Order.find({ where: { id: { inq: orderIds } } });
    let errorMessage = verifyOrders(orders, statementData.id);
    if (errorMessage) {
      return {
        status: 400,
        message: errorMessage,
        statementId: null
      };
    }

    let result = {};
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { Statement, Order } = models;
        if (_.get(metadata, ['endUserId'])) {
          statementData.updatedBy = metadata.endUserId;
        }
        let newStatement = await Statement.upsert(statementData);
        // update previously assigned orders
        await Order.updateAll({
          and: [
            { statementId: statementData.id },
            { id: { nin: orderIds } }
          ]
        }, {
          statementId: null
        });
        // update new orders
        await app.models.Order.updateAll({ id: { inq: orderIds } }, { statementId: newStatement.id });
        result = {
          status: 200,
          message: `Statement(id: ${newStatement.id}) is updated.`,
          statementId: newStatement.id
        };
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot update statement - ${error.message}`);
    }
    return result;
  };

  /* Similar to built-in 'findById' except it also queries any
   * 'candidate' orders
   * of same client.
   * @param {string} - statement id
   * @returns {Object} - statement along with array of 'candidate' order
   */
  Statement.findByIdDetail = async function(id, filter) {
    const statement = await Statement.findById(id, filter);
    if (!statement) {
      return null;
    }

    return {
      statement: statement,
      candidateOrders: await app.models.Order.findStatementReady(statement.clientId)
    };
  };
};
