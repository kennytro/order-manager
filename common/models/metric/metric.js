'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const Promise = require('bluebird');
const moment = require('moment');
const uuidv5 = require('uuid/v5');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');
const metricNamespace = require(appRoot + '/config/redis-keys').metricNamespace;

module.exports = function(Metric) {
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
        id: uuidv5(name, metricNamespace)
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
    let metricdataArray = await app.models.MetricData.find({ where: whereFilter });

    // replace 'metricId' with name
    return _.each(metricdataArray, md => {
      md.metricId = _.find(metricIds, { id: md.metricId }).name;
    });
  };

  Metric.findAdHocMetricData = async function(metric, whereFilter, instanceId) {
    if (!metric.adHoc) {
      throw new HttpErrors(400, `Invalid metric(name: ${metric.name}) - not an ad Hoc metric.`);
    }
    if (!instanceId) {
      throw new HttpErrors(400, `Invalid instanceId(${instanceId}) - instance id is required.`);
    }
    whereFilter = await modifyWhereFilter(metric, whereFilter, instanceId);
    const realMetricName = getUnderlyingMetricName(metric);
    return await Metric.findMetricDataByName([realMetricName], whereFilter);
  };

  async function modifyWhereFilter(metric, whereFilter, instanceId) {
    if (metric.name === 'client_sale_by_delivery_route_daily') {
      /* We want metric data of clients in the given delivery route. */
      let deliveryRoute = await app.models.DeliveryRoute.findById(instanceId,
        { include:
          {
            relation: 'clients',
            scope: { fields: ['id'] }
          }
        });
      if (deliveryRoute) {
        let clients = deliveryRoute.toJSON().clients;
        whereFilter.instanceId = { inq: _.map(clients, 'id') };
      }
    }

    if (metric.name === 'product_sale_by_client_daily') {
      /* We want metric data of product sale that belongs to client's orders. */
      let metricDateFilter = whereFilter.metricDate;
      let orderFindFilter = {
        where: {
          clientId: instanceId,
          status: 'Completed'
        },
        fields: ['id']
      };
      if (metricDateFilter) {
        orderFindFilter.where['updatedAt'] = metricDateFilter;
      } else {
        logger.warn(`Querying ${metric.name} metric without metricDate filter.`);
      }
      let orders = await app.models.Order.find(orderFindFilter);
      whereFilter.sourceInstanceId = { inq: _.map(orders, 'id') };
    }
    return whereFilter;
  }

  function getUnderlyingMetricName(metric) {
    if (metric.name === 'client_sale_by_delivery_route_daily') {
      return 'client_sale_daily';
    }
    if (metric.name === 'product_sale_by_client_daily') {
      return 'product_sale';
    }
    throw new HttpErrors(400, `Invalid metric(${metric.name}) - has no underlying metric.`);
  }

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
