'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const uuidv5 = require('uuid/v5');
const logger = require(appRoot + '/config/winston');
const metricSetting = require(appRoot + '/config/metric');

module.exports = async function(app) {
  /* skip if it's one-off process or not a worker. Since metric is not
   * essential to application functions, leave the initialization to worker
   * process.(NOTE: Currently there is only 1 worker. When we have multiple
   * workers, use a lock to avoid race condition.)
   */
  if (process.env.NODE_ENV !== 'unit_test' && (process.env.ONE_OFF || !process.env.IS_WORKER)) {
    return;
  };
  const UUID_NAMESPACE = metricSetting.uuidNamespace;

  const SEED_METRICS = [
    // ----- Company wide metric -----
    // total sales metric
    {
      id: uuidv5('total_sale', UUID_NAMESPACE),
      parentId: uuidv5('total_sale_daily', UUID_NAMESPACE),
      level: 0,
      name: 'total_sale',
      description: 'Order total sale amount',
      displayName: 'Order Total Sale Amount',
      shortName: 'TS',
      unit: 'Currency',
      timeRange: 'None',
      modelName: 'Order'
    },
    {
      id: uuidv5('total_sale_daily', UUID_NAMESPACE),
      parentId: uuidv5('total_sale_monthly', UUID_NAMESPACE),
      level: 1,
      name: 'total_sale_daily',
      description: 'Daily total sale amount',
      displayName: 'Daily Total Sale Amount',
      shortName: 'TSD',
      unit: 'Currency',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'Order'
    },
    {
      id: uuidv5('total_sale_monthly', UUID_NAMESPACE),
      parentId: uuidv5('total_sale_yearly', UUID_NAMESPACE),
      level: 2,
      name: 'total_sale_monthly',
      description: 'Monthly total sale amount',
      displayName: 'Monthly Total Sale Amount',
      shortName: 'TSM',
      unit: 'Currency',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'Order'
    },
    {
      id: uuidv5('total_sale_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'total_sale_yearly',
      description: 'Yearly total sale amount',
      displayName: 'Yearly Total Sale Amount',
      shortName: 'TSY',
      unit: 'Currency',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'Order'
    },
    // total orders metric
    {
      id: uuidv5('total_orders', UUID_NAMESPACE),
      parentId: uuidv5('total_orders_daily', UUID_NAMESPACE),
      level: 0,
      name: 'total_orders',
      description: 'Total order count',
      displayName: 'Total Order Count',
      shortName: 'TO',
      unit: 'Integer',
      timeRange: 'None',
      modelName: 'Order'
    },
    {
      id: uuidv5('total_orders_daily', UUID_NAMESPACE),
      parentId: uuidv5('total_orders_monthly', UUID_NAMESPACE),
      level: 1,
      name: 'total_orders_daily',
      description: 'Daily total order count',
      displayName: 'Daily Total Order Count',
      shortName: 'TOD',
      unit: 'Integer',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'Order'
    },
    {
      id: uuidv5('total_orders_monthly', UUID_NAMESPACE),
      parentId: uuidv5('total_orders_yearly', UUID_NAMESPACE),
      level: 2,
      name: 'total_orders_monthly',
      description: 'Monthly total order count',
      displayName: 'Monthly Total Order Count',
      shortName: 'TOM',
      unit: 'Integer',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'Order'
    },
    {
      id: uuidv5('total_orders_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'total_orders_yearly',
      description: 'Yearly total order count',
      displayName: 'Yearly Total Order Count',
      shortName: 'TOY',
      unit: 'Integer',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'Order'
    },
    // product unit price
    {
      id: uuidv5('product_unit_price', UUID_NAMESPACE),
      level: 0,
      name: 'product_unit_price',
      description: 'Product unit price daily',
      displayName: 'Product Unit Price',
      shortName: 'PUP',
      unit: 'Currency',
      timeRange: 'None',
      modelName: 'Product'
    },
    // Client specific metric
    // total sales by client
    {
      id: uuidv5('client_sale', UUID_NAMESPACE),
      parentId: uuidv5('client_sale_daily', UUID_NAMESPACE),
      level: 0,
      name: 'client_sale',
      description: 'Sale amount by client',
      displayName: 'Sale Amount By Client',
      shortName: 'CS',
      unit: 'Currency',
      timeRange: 'None',
      modelName: 'Order',
      groupByKey: 'clientId'
    },
    {
      id: uuidv5('client_sale_daily', UUID_NAMESPACE),
      parentId: uuidv5('client_sale_monthly', UUID_NAMESPACE),
      level: 1,
      name: 'client_sale_daily',
      description: 'Daily sale amount by client',
      displayName: 'Daily Sale Amount By Client',
      shortName: 'CSD',
      unit: 'Currency',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'Order',
      groupByKey: 'clientId'
    },
    {
      id: uuidv5('client_sale_monthly', UUID_NAMESPACE),
      parentId: uuidv5('client_sale_yearly', UUID_NAMESPACE),
      level: 2,
      name: 'client_sale_monthly',
      description: 'Monthly sale amount by client',
      displayName: 'Monthly Sale Amount By Client',
      shortName: 'CSM',
      unit: 'Currency',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'Order',
      groupByKey: 'clientId'
    },
    {
      id: uuidv5('client_sale_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'client_sale_yearly',
      description: 'Yearly sale amount by client',
      displayName: 'Yearly Sale Amount By Client',
      shortName: 'CSY',
      unit: 'Currency',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'Order',
      groupByKey: 'clientId'
    }
  ];

  // Seed metric definition if not exists already.
  try {
    await Promise.map(SEED_METRICS, async (metricDef) => {
      const metric = await app.models.Metric.findById(metricDef.id, { fields: { id: true } });
      if (!metric) {
        await app.models.Metric.create(metricDef);
        logger.info(`Seeded metric definition for ${metricDef.name}`);
      }
    }, {
      concurrency: 4    // avoid EventEmitter memory leak
    });
  } catch (error) {
    logger.error(`Error while initializing metric definitions - ${error.message}`);
    throw error;
  }
};
