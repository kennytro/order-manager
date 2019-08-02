'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const debugBatch = require('debug')('order-manager:Metric:batch');
const debugMockData = require('debug')('order-manager:Metric:mockData');
const Promise = require('bluebird');
const moment = require('moment');
const uuidv5 = require('uuid/v5');
const yn = require('yn');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');
const metricSetting = require(appRoot + '/config/metric');
module.exports = function(Metric) {
  const METRIC_NS_UUID = metricSetting.uuidNamespace;
  const TS_METRIC_ID = uuidv5('total_sale', METRIC_NS_UUID);
  const TO_METRIC_ID = uuidv5('total_orders', METRIC_NS_UUID);
  const CS_METRIC_ID = uuidv5('client_sale', METRIC_NS_UUID);
  const PS_METRIC_ID = uuidv5('product_sale', METRIC_NS_UUID);
  const PUP_METRIC_ID = uuidv5('product_unit_price', METRIC_NS_UUID);
  const CONCURRENCY_LIMIT = process.env.CONCURRENCY_LIMIT ? parseInt(process.env.CONCURRENCY_LIMIT) : 3;  // avoid connection exhaustion

  /**
   * Get a list of id of products that have changed since last update.
   * @param {String} redisSetName - Set name in Redis
   * @param {String} modelName - Model name
   * @returns {string[]} - list of product id.
   */
  async function getChangedInstanceIds(modelName) {
    const MAX_ORDER_ID_COUNT = 1000;    // avoid memory exhaustion
    if (!app.redis) {
      return [];
    }

    let redisSetName;
    if (modelName === 'Order') {
      redisSetName = metricSetting.redisOrderChangedSetKey;
    } else if (modelName === 'Product') {
      redisSetName = metricSetting.redisProductChangedSetKey;
    } else {
      return [];
    }

    const scardAsync = Promise.promisify(app.redis.scard).bind(app.redis);
    const spopAsync = Promise.promisify(app.redis.spop).bind(app.redis);
    let idCount = await scardAsync(redisSetName);
    if (idCount === 0) {
      return [];
    }
    debugBatch(`${idCount} ${modelName}(s) created.`);
    idCount = Math.min(idCount, MAX_ORDER_ID_COUNT);

    const instanceIds = await spopAsync(redisSetName, idCount);
    if (debugBatch.enabled) {
      debugBatch(`${modelName} IDs in ${redisSetName}(count: ${instanceIds.length}): ${JSON.stringify(instanceIds)}.`);
    }
    return instanceIds;
  }

  /**
   * Functions that update metrics.
  **/

  /**
   * Update total sale metrics
   * @param {String} leafMetricId - Id of leaf metric
   * @param {Object[]} orders -     Array of changed orders
  **/
  async function updateSystemMetrics(leafMetricId, orders) {
    if (_.isEmpty(orders)) {
      return;
    }
    const leafMetric = await Metric.findById(leafMetricId);
    if (!leafMetric) {
      return;
    }
    debugBatch(`updateSystemMetrics(${leafMetric.name}) - Begins.`);
    let metricDataArray = [];
    // remove data of cancelled order
    const cancelled = _.filter(orders, { status: 'Cancelled' });
    if (!_.isEmpty(cancelled)) {
      await app.models.MetricData.destroyAll({ and: [
        { metricId: leafMetric.id },
        { sourceInstanceId: { inq: _.map(cancelled, 'id') } }
      ] });
      debugBatch(`<${leafMetric.name}>: Removed metric data of ${JSON.stringify(_.map(cancelled, 'id'))}.`);
      cancelled.forEach(order => metricDataArray.push({
        instanceId: null,
        metricDate: order.createdAt
      }));
    }

    // upsert data of changed order
    const changed = _.filter(orders, (o) => o.status !== 'Cancelled');
    if (!_.isEmpty(changed)) {
      await Promise.map(changed, async (order) => {
        let metricValue = 0;
        if (leafMetric.name === 'total_sale') {
          metricValue = order.totalAmount;
        }
        if (leafMetric.name === 'total_orders') {
          metricValue = 1;
        }
        const metricData = await app.models.MetricData.findOne({
          where: { and: [{ metricId: leafMetric.id }, { sourceInstanceId: order.id }] }
        });
        if (metricData) {
          await metricData.updateAttribute('value', metricValue);
          debugBatch(`<${leafMetric.name}>: Updated metric data(${metricData.id}) value to ${metricData.value}.`);
        } else {
          const newMetricData = await app.models.MetricData.create({
            metricId: leafMetric.id,
            instanceId: null,
            value: metricValue,
            metricDate: order.createdAt,
            sourceInstanceId: order.id
          });
          debugBatch(`<${leafMetric.name}>: Created new metric data(${newMetricData.id}) with value ${newMetricData.value}.`);
        }
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
      changed.forEach(order => metricDataArray.push({
        instanceId: null,
        metricDate: order.createdAt
      }));
    }

    await updateAggregationMetric(leafMetric, metricDataArray);
    debugBatch(`updateSystemMetrics(${leafMetric.name}) - Ends.`);
  }

  /**
   * Update client sale metrics
   * @param {String} leafMetricId - Id of leaf metric
   * @param {Object[]} orders -     Array of changed orders
  **/
  async function updateClientSaleMetrics(leafMetricId, orders) {
    if (_.isEmpty(orders)) {
      return;
    }
    const leafMetric = await Metric.findById(leafMetricId);
    if (!leafMetric) {
      return;
    }
    debugBatch(`updateClientSaleMetrics(${leafMetric.name}) - Begins.`);
    let metricDataArray = [];
    // remove data of cancelled order
    const cancelled = _.filter(orders, { status: 'Cancelled' });
    if (!_.isEmpty(cancelled)) {
      await app.models.MetricData.destroyAll({ and: [
        { metricId: leafMetric.id },
        { sourceInstanceId: { inq: _.map(cancelled, 'id') } }
      ] });
      debugBatch(`<${leafMetric.name}>: Removed metric data of ${JSON.stringify(_.map(cancelled, 'id'))}.`);
      cancelled.forEach(order => metricDataArray.push({
        instanceId: order.clientId,
        metricDate: order.createdAt
      }));
    }

    // upsert data of changed order
    const changed = _.filter(orders, (o) => o.status !== 'Cancelled');
    if (!_.isEmpty(changed)) {
      await Promise.map(changed, async (order) => {
        const metricData = await app.models.MetricData.findOne({
          where: { and: [
            { metricId: leafMetric.id },
            { instanceId: order.clientId },
            { sourceInstanceId: order.id }
          ] }
        });
        if (metricData) {
          await metricData.updateAttribute('value', Number(order.totalAmount));
          debugBatch(`<${leafMetric.name}>: Updated metric data(${metricData.id}) value to ${metricData.value}.`);
        } else {
          const newMetricData = await app.models.MetricData.create({
            metricId: leafMetric.id,
            instanceId: order.clientId,
            value: Number(order.totalAmount),
            metricDate: order.createdAt,
            sourceInstanceId: order.id
          });
          debugBatch(`<${leafMetric.name}>: Created new metric data(${newMetricData.id}) with value ${newMetricData.value}.`);
        }
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
      changed.forEach(order => metricDataArray.push({
        instanceId: order.clientId,
        metricDate: order.createdAt
      }));
    }

    await updateAggregationMetric(leafMetric, metricDataArray);
    debugBatch(`updateClientSaleMetrics(${leafMetric.name}) - Ends.`);
  }

  /**
   * Update product metrics or orders
   * @param {String} leafMetricId - Id of leaf metric
   * @param {Object[]} products -     Array of changed orders
  **/
  async function updateProductSaleMetrics(leafMetricId, orders) {
    // product metrics of orders are updated only on 'Completed' orders
    // because metric value may change or cancelled throughout order processing.
    orders = orders.filter(order => order.status === 'Completed');
    if (_.isEmpty(orders)) {
      return;
    }
    const leafMetric = await Metric.findById(leafMetricId);
    if (!leafMetric) {
      return;
    }
    debugBatch(`updateProductSaleMetrics(${leafMetric.name}) - Begins.`);
    let metricDataArray = [];
    orders.forEach(function(order) {
      let oItems = order.toJSON().orderItem;
      oItems.forEach(function(orderItem) {      // assign order creation date to each order item.
        metricDataArray.push({
          metricId: leafMetricId,
          instanceId: orderItem.productId,
          value: Number(orderItem.unitPrice) * Number(orderItem.quantity),
          metricDate: order.createdAt,
          sourceInstanceId: order.id
        });
      });
    });
    try {
      await Promise.map(metricDataArray, async (mData) => {
        let metricData = await app.models.MetricData.findOne({
          where: { and: [
            { metricId: mData.metricId },
            { instanceId: mData.instanceId },
            { sourceInstanceId: mData.sourceInstanceId }
          ] }
        });
        if (metricData) {
          await metricData.updateAttribute('value', Number(mData.value));
          debugBatch(`<${leafMetric.name}>: Updated metric data(${metricData.id}) value to ${metricData.value}.`);
        } else {
          const newMetricData = await app.models.MetricData.create(mData);
          debugBatch(`<${leafMetric.name}>: Created new metric data(${newMetricData.id}) with value ${newMetricData.value}.`);
        }
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
    } catch (error) {
      logger.error(`Error while updating metric data of ${leafMetric.name} - ${error.message}`);
      return;
    }

    // delete properties no longer needed.
    metricDataArray.forEach(data => {
      delete data.metricId;
      delete data.value;
      delete data.sourceInstanceId;
    });
    await updateAggregationMetric(leafMetric, metricDataArray);
    debugBatch(`updateProductSaleMetrics(${leafMetric.name}) - Ends.`);
  }

  /**
   * Update product metrics
   * @param {String} leafMetricId - Id of leaf metric
   * @param {Object[]} products -     Array of changed products
  **/
  async function updateProductMetrics(leafMetricId, products) {
    if (_.isEmpty(products)) {
      return;
    }
    const leafMetric = await Metric.findById(leafMetricId);
    if (!leafMetric) {
      return;
    }
    debugBatch(`updateProductMetrics(${leafMetric.name}) - Begins.`);
    const TODAY = moment().startOf('day').toDate();
    try {
      await Promise.map(products, async (product) => {
        let metricData = await app.models.MetricData.findOne({
          where: { and: [
            { metricId: leafMetric.id },
            { instanceId: product.id },
            { metricDate: TODAY }
          ] }
        });
        if (metricData) {
          await metricData.updateAttribute('value', Number(product.unitPrice));
          debugBatch(`<${leafMetric.name}>: Updated metric data(${metricData.id}) value to ${metricData.value}.`);
        } else {
          const newMetricData = await app.models.MetricData.create({
            metricId: leafMetric.id,
            instanceId: product.id,
            value: Number(product.unitPrice),
            metricDate: TODAY
          });
          debugBatch(`<${leafMetric.name}>: Created new metric data(${newMetricData.id}) with value ${newMetricData.value}.`);
        }
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
    } catch (error) {
      logger.error(`Error while updating metric data of ${leafMetric.name} - ${error.message}`);
      return;
    }
    // TO DO: update aggregation metric if needed.
    debugBatch(`updateProductMetrics(${leafMetric.name}) - Ends.`);
  }

  /**
   * Update aggregation metrics recursively.
   * @param {Object} metric - Id of leaf metric
   * @param {Object[]} metricDataArray -     Array of changed metric data
  **/
  async function updateAggregationMetric(metric, dataArray) {
    if (!metric || !metric.parentId) {
      return;
    }
    const aggrMetric = await Metric.findById(metric.parentId);
    debugBatch(`Updating aggregate metric(id: ${aggrMetric.id}, name: ${aggrMetric.name})`);
    // get aggregation metrics. Create one if not exist.
    let aggrMDArray = await Promise.mapSeries(dataArray, async (mData) => {
      let metricDate = aggrMetric.getAggregationDate(mData.metricDate);
      debugBatch(`<${aggrMetric.name}>: Metric date: ${metricDate} -`);
      let aggrMD = await app.models.MetricData.findOne({
        where: { and: [
          { metricId: aggrMetric.id },
          { instanceId: mData.instanceId },
          { metricDate: metricDate }] }
      });
      if (!aggrMD) {
        aggrMD = await app.models.MetricData.create({
          metricId: aggrMetric.id,
          instanceId: mData.instanceId,
          value: 0,
          metricDate: metricDate
        });
        debugBatch(`<${aggrMetric.name}>: Created new metric data(id: ${aggrMD.id}).`);
      } else {
        debugBatch(`<${aggrMetric.name}>: Found metric data(id: ${aggrMD.id}).`);
      }
      return aggrMD;
    });

    aggrMDArray = _.uniqBy(aggrMDArray, 'id');
    // update aggregation data value.
    await Promise.map(aggrMDArray, async (aggrMD) => {
      // find all data of child metric.
      const [beginDate, endDate] = aggrMetric.getTimeRange(aggrMD.metricDate);
      debugBatch(`<${aggrMetric.name}>: Updating aggregate metric data(id: ${aggrMD.id}, begin: ${beginDate}, end: ${endDate}) -`);
      const childrendMD = await app.models.MetricData.find({
        where: { and: [
          { metricId: metric.id },
          { instanceId: aggrMD.instanceId },
          { metricDate: { between: [beginDate, endDate] } }
        ] }
      });
      if (_.isEmpty(childrendMD)) {
        debugBatch(`<${aggrMetric.name}>: Destroying metric data(id: ${aggrMD.id}).`);
        await aggrMD.destroy();  // delete aggretation data with no child.
      } else {
        const newValue = aggrMetric.aggregateData(childrendMD);
        await aggrMD.updateAttribute('value', newValue);
        debugBatch(`<${aggrMetric.name}>: Updated metric data(id: ${aggrMD.id}, value: ${aggrMD.value}).`);
      }
    }, {
      concurrency: CONCURRENCY_LIMIT
    });

    // recursively update parent.
    await updateAggregationMetric(aggrMetric, dataArray);
  }

  Metric.batchUpdateOnOrder = async function() {
    // const orderIds = await getChangedOrderIds();
    const orderIds = await getChangedInstanceIds('Order');
    if (_.isEmpty(orderIds)) {
      return;
    }

    try {
      let orders = await app.models.Order.find({ where: { id: { inq: orderIds } }, include: 'orderItem' });
      if (debugBatch.enabled) {
        orders.forEach(function(order) {
          const id = order.id;
          const cDate = order.createdAt;
          const cId = order.clientId;
          const amount = order.totalAmount;
          const status = order.status;
          debugBatch(`Order ${id} - date: ${cDate}, client: ${cId}, amount: ${amount}, status: ${status}`);
        });
      }
      await Promise.all([
        updateSystemMetrics(TS_METRIC_ID, orders),
        updateSystemMetrics(TO_METRIC_ID, orders),
        updateClientSaleMetrics(CS_METRIC_ID, orders),
        updateProductSaleMetrics(PS_METRIC_ID, orders)
        // updateOrderItemMetrics(PS_METRIC_ID, orders)
      ]);
    } catch (error) {
      logger.error(`Error while updating metric data on Order model - ${error.message}`);
      throw error;
    }
  };

  Metric.batchUpdateOnProduct = async function() {
    const productIds = await getChangedInstanceIds('Product');
    if (_.isEmpty(productIds)) {
      return;
    }
    try {
      let products = await app.models.Product.find({ where: { id: { inq: productIds } } });
      if (debugBatch.enabled) {
        products.forEach(function(product) {
          const id = product.id;
          const name = product.name;
          const price = product.unitPrice;
          debugBatch(`Product ${id} - name: ${name}, price: ${price}`);
        });
      }
      await Promise.all([
        updateProductMetrics(PUP_METRIC_ID, products)
      ]);
    } catch (error) {
      logger.error(`Error while updating metric data on Product model - ${error.message}`);
      throw error;
    }
  };

  /**
   * Wrapper of all functions updating metric data.
   */
  Metric.batchUpdate = async function(fireDate) {
    debugBatch(`${moment(fireDate).format()}: Running Metric.batchUpdate()`);
    await Metric.batchUpdateOnOrder();
    await Metric.batchUpdateOnProduct();
    // [Note] any batch update on other model should come here.
  };

  Metric.removeOldData = async function(fireDate) {
    debugBatch(`${moment(fireDate).format()}: Running Metric.removeOldData()`);
    // TO DO: remove old metric data
  };

  /**
   *  create mock data using random number generator.
   * [NOTE] this function is called 4 times a day, at 8, 12, 18, 20.
   */
  Metric.mockData = async function(fireDate) {
    if (!yn(process.env.CREATE_MOCK_DATA)) {
      return;
    }
    debugMockData(`${moment(fireDate).format()}: Running Metric.mockData()`);
    if (fireDate.getHours() === 8) {
      await app.models.Product.mockData();
    }

    let clients = await app.models.Client.mockData();
    if (fireDate.getDay() > 0) {  // skip Sunday
      await app.models.Order.mockData(clients);
    } else {
      await app.models.Statement.mockData(clients);
    }
  };

  Metric.removeOldMockData = async function(fireDate) {
    if (!yn(process.env.CREATE_MOCK_DATA)) {
      return;
    }

    debugMockData(`${moment(fireDate).format()}: Running Metric.removeOldMockData()`);
    const threeMonthAgo = moment().subtract(3, 'months').toDate();
    let productMetrics = await Metric.find({ where: { modelName: 'Product' } });
    await app.models.MetricData.destroyAll({
      metricId: { inq: productMetrics.map(metric => metric.id) },
      metricDate: { lt: threeMonthAgo }
    });
    debugMockData(`Removed all product metric data older than ${threeMonthAgo.toLocaleDateString('en-US')}`);

    let clients = await app.models.Client.mockData();
    await app.models.Statement.removeOldData(clients, threeMonthAgo);
  };

  /**
   * Find metric data of given metric names.
   * @param {string[]} names - array of metric name
   * @param {object} where - where filter on MetricData
   * @returns {object[]} data - array of metric data
   */
  Metric.findMetricDataByName = async function(names, whereFilter) {
    const metricIds = _.map(names, name => {
      return {
        name: name,
        id: uuidv5(name, METRIC_NS_UUID)
      };
    });
    let metricIdClause;
    if (metricIds.length === 1) {
      metricIdClause = { metricId: metricIds[0].id };      // single metric query
    } else {
      metricIdClause = { metricId: { inq: _.map(metricIds, 'id') } }; // multiple metric query
    }
    if (whereFilter) {      // combine with user filter
      let andArray = [metricIdClause];
      if (whereFilter.and) {
        andArray = _.cat(andArray, whereFilter.add);
      } else {
        andArray.push(whereFilter);
      }
      whereFilter = { and: andArray };
    } else {
      whereFilter = metricIdClause;
    }
    let metricdataArray = await app.models.MetricData.find({
      where: whereFilter,
      fields: { instanceId: false }
    });

    // replace 'metricId' with name
    return _.each(metricdataArray, md => {
      md.metricId = _.find(metricIds, { id: md.metricId }).name;
    });
  };

  Metric.prototype.getTimeRange = function(date) {
    if (this.timeRange === 'Daily') {
      return [moment(date).startOf('day').toDate(), moment(date).endOf('day').toDate()];
    }
    if (this.timeRange === 'Monthly') {
      return [moment(date).startOf('month').toDate(), moment(date).endOf('month').toDate()];
    }
    if (this.timeRange === 'Yearly') {
      return [moment(date).startOf('year').toDate(), moment(date).endOf('year').toDate()];
    }
    logger.error(`Unsupported metric time range(${this.timeRange})`);
    throw new Error('Unsupported time range');
  };

  /**
   * Get a list of unique day/month/year(e.g. Order.createdAt.startOf('year')) of given dates.
   * @param {Date[]} dateArray -   Array of dates
  **/
  Metric.prototype.getDateArray = function(dateArray) {
    let convertedDataArray;
    if (this.timeRange === 'Daily') {
      convertedDataArray = _.map(dateArray, d => moment(d).startOf('day').toDate());
    } else if (this.timeRange === 'Monthly') {
      convertedDataArray = _.map(dateArray, d => moment(d).startOf('month').toDate());
    } else if (this.timeRange === 'Yearly') {
      convertedDataArray = _.map(dateArray, d => moment(d).startOf('year').toDate());
    } else {
      logger.error(`Unsupported metric time range(${this.timeRange})`);
      throw new Error('Unsupported time range');
    }
    return _.uniqBy(convertedDataArray, d => d.getTime());
  };

  /**
   * Convert the given date to a date appropriate for this metric.
   * @param {Date} date
   * @returns {Date}
  **/
  Metric.prototype.getAggregationDate = function(date) {
    if (this.timeRange === 'Daily') {
      return moment(date).startOf('day').toDate();
    }
    if (this.timeRange === 'Monthly') {
      return moment(date).startOf('month').toDate();
    }
    if (this.timeRange === 'Yearly') {
      return moment(date).startOf('year').toDate();
    }
    logger.error(`Unsupported metric time range(${this.timeRange})`);
    throw new Error('Unsupported time range');
  };

  Metric.prototype.aggregateData = function(childrenMD) {
    if (this.aggregationType === 'Sum') {
      return _.reduce(childrenMD, (sum, data) => {
        return sum + Number(data.value);
      }, 0);
    }
    if (this.aggregationType === 'Product') {
      return _.reduce(childrenMD, (product, data) => {
        return product * Number(data.value);
      }, 0);
    }
    if (this.aggregationType === 'Average') {
      return _.reduce(childrenMD, (sum, data) => {
        return sum * Number(data.value);
      }, 0) / childrenMD.length;
    }
    logger.error(`Unsupported metric aggregation type(${this.aggregationType})`);
    throw new Error('Unsupported aggregation type');
  };
};
