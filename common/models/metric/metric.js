'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const moment = require('moment');
const uuidv5 = require('uuid/v5');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');
const metricSetting = require(appRoot + '/config/metric');
module.exports = function(Metric) {
  const METRIC_NS_UUID = metricSetting.uuidNamespace;
  const TS_METRIC_ID = uuidv5('total_sale', METRIC_NS_UUID);
  const TO_METRIC_ID = uuidv5('total_orders', METRIC_NS_UUID);
  const CS_METRIC_ID = uuidv5('client_sale', METRIC_NS_UUID);
  const CONCURRENCY_LIMIT = process.env.CONCURRENCY_LIMIT ? parseInt(process.env.CONCURRENCY_LIMIT) : 3;  // avoid connection exhaustion
  /**
   * Get a list of id of orders that have changed since last update.
   *
   * @returns {string[]} - list of order id.
   */
  async function getChangedOrderIds() {
    const REDIS_ORDER_CHANGED_KEY = metricSetting.redisOrderChangedSetKey;
    const MAX_ORDER_ID_COUNT = 1000;    // avoid memory exhaustion

    if (!app.redis) {
      return [];
    }
    const scardAsync = Promise.promisify(app.redis.scard).bind(app.redis);
    const spopAsync = Promise.promisify(app.redis.spop).bind(app.redis);
    let idCount = await scardAsync(REDIS_ORDER_CHANGED_KEY);
    if (idCount === 0) {
      return [];
    }
    logger.debug(`${idCount} order(s) created.`);
    idCount = Math.min(idCount, MAX_ORDER_ID_COUNT);

    return await spopAsync(REDIS_ORDER_CHANGED_KEY, idCount);
  }

  /**
   * Functions that update metrics.
  **/

  async function updateAggregationMetric(metric, orders) {
    if (!metric || !metric.parentId) {
      return;
    }
    // find aggregation metric definition (TODO: refactor code)
    const aggrMetric = await Metric.findById(metric.parentId);

    let aggrMDArray = [];
    if (aggrMetric.groupByKey) {
      const groupByOrders = _.groupBy(orders, aggrMetric.groupByKey);
      aggrMDArray = await Promise.map(_.keys(groupByOrders), async (key) => {
        let grouped = groupByOrders[key];
        let dateArray = aggrMetric.getDateArray(_.map(grouped, 'createdAt'));
        return await Promise.map(dateArray, async (date) => {
          let aggrMD = await app.models.MetricData.findOne({
            where: { and: [
              { metricId: aggrMetric.id },
              { metricDate: date },
              { groupByValue: key }] }
          });
          if (!aggrMD) {
            aggrMD = await app.models.MetricData.create({
              metricId: aggrMetric.id,
              value: 0,
              metricDate: date,
              groupByValue: key
            });
          }
          return aggrMD;
        }, {
          concurrency: CONCURRENCY_LIMIT
        });
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
      aggrMDArray = _.flatten(aggrMDArray);
    } else {
      let dateArray = aggrMetric.getDateArray(_.map(orders, 'createdAt'));
      aggrMDArray = await Promise.map(dateArray, async (date) => {
        let aggrMD = await app.models.MetricData.findOne({
          where: { and: [{ metricId: aggrMetric.id }, { metricDate: date }] }
        });
        if (!aggrMD) {
          aggrMD = await app.models.MetricData.create({
            metricId: aggrMetric.id,
            value: 0,
            metricDate: date
          });
        }
        return aggrMD;
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
    }

    // update aggregation data value.
    await Promise.map(aggrMDArray, async (aggrMD) => {
      // find all data of child metric.
      const [beginDate, endDate] = aggrMetric.getTimeRange(aggrMD.metricDate);
      let filter = {
        where: { and: [
          { metricId: metric.id }, { metricDate: { between: [beginDate, endDate] } }
        ] }
      };
      if (aggrMetric.groupByKey) {
        filter.where.and.push({ groupByValue: aggrMD.groupByValue });
      }
      const childrendMD = await app.models.MetricData.find(filter);
      if (_.isEmpty(childrendMD)) {
        await aggrMD.destroy();  // delete aggretation data with no child.
      } else {
        const newValue = aggrMetric.aggregateData(childrendMD);
        await aggrMD.updateAttribute('value', newValue);
      }
    }, {
      concurrency: CONCURRENCY_LIMIT
    });

    // recursively update parent.
    await updateAggregationMetric(aggrMetric, orders);
  }

  /**
   * Update total sale metrics
   * @param {String} leafMetricId - Id of leaf metric
   * @param {Object[]} orders -     Array of changed orders
  **/
  async function updateOrderMetrics(leafMetricId, orders) {
    if (_.isEmpty(orders)) {
      return;
    }
    const leafMetric = await Metric.findById(leafMetricId);
    logger.debug(`updateOrderMetrics(${leafMetric.name}, ${orders.length}) - Begins.`);

    // remove data of cancelled order
    const cancelled = _.filter(orders, { status: 'Cancelled' });
    if (!_.isEmpty(cancelled)) {
      await app.models.MetricData.destroyAll({ and: [
        { metricId: leafMetric.id },
        { instanceId: { inq: _.map(cancelled, 'id') } }
      ] });
    }

    // upsert data of changed order
    const changed = _.filter(orders, (o) => o.status !== 'Cancelled');
    if (!_.isEmpty(changed)) {
      await Promise.map(changed, async (order) => {
        const metricData = await app.models.MetricData.findOne({
          where: { and: [{ metricId: leafMetric.id }, { instanceId: order.id }] }
        });
        if (metricData) {
          await metricData.updateAttribute('value', leafMetric.getValue(order));
        } else {
          await app.models.MetricData.create({
            metricId: leafMetric.id,
            instanceId: order.id,
            value: leafMetric.getValue(order),
            metricDate: order.createdAt,
            groupByValue: leafMetric.groupByKey ? order[leafMetric.groupByKey] : null
          });
        }
      }, {
        concurrency: CONCURRENCY_LIMIT
      });
    }

    await updateAggregationMetric(leafMetric, orders);
    logger.debug(`updateOrderMetrics(${leafMetric.name}, ${orders.length}) - Ends.`);
  }

  Metric.batchUpdateOnOrder = async function() {
    const orderIds = await getChangedOrderIds();
    if (_.isEmpty(orderIds)) {
      return;
    }
    try {
      let orders = await app.models.Order.find({ where: { id: { inq: orderIds } } });
      await Promise.all([
        updateOrderMetrics(TS_METRIC_ID, orders),
        updateOrderMetrics(TO_METRIC_ID, orders),
        updateOrderMetrics(CS_METRIC_ID, orders)
      ]);
    } catch (error) {
      logger.error(`Error while updating metric data on Order model - ${error.message}`);
      throw error;
    }
  };

  /**
   * Wrapper of all functions updating metric data.
   */
  Metric.batchUpdate = async function(fireDate) {
    logger.debug(`${moment(fireDate).format()}: Running Metric.batchUpdate()`);
    await Metric.batchUpdateOnOrder();
    // [Note] any batch update on model other than 'Order' should come here.
  };

  Metric.removeOldData = async function(fireDate) {
    logger.debug(`${moment(fireDate).format()}: Running Metric.removeOldData()`);
    // TO DO: remove old metric data
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

  Metric.prototype.getValue = function(dataObject) {
    if (this.modelName === 'Order') {
      if (this.unit === 'Currency') {
        return dataObject.totalAmount;
      }
      if (this.unit === 'Integer') {
        return 1;
      }
      logger.error(`Metric(id: ${this.id}, name: ${this.name}) has unsupported unit(${this.unit}) on 'Order' model.`);
      throw new Error('Unsupported unit');
    }
    logger.error(`Metric(id: ${this.id}, name: ${this.name}) has unsupported model(${this.modelName}).`);
    throw new Error('Unsupported model');
  };
};
