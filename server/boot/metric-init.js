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
      unitLabel: 'Amount',
      timeRange: 'None',
      modelName: 'System',
      sourceModelName: 'Order'
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
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'System',
      sourceModelName: 'Order'
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
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'System',
      sourceModelName: 'Order'
    },
    {
      id: uuidv5('total_sale_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'total_sale_yearly',
      description: 'Yearly total sale amount',
      displayName: 'Yearly Total Sale Amount',
      shortName: 'TSY',
      unit: 'Currency',
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'System',
      sourceModelName: 'Order'
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
      unitLabel: 'Count',
      timeRange: 'None',
      modelName: 'System',
      sourceModelName: 'Order'
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
      unitLabel: 'Count',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'System',
      sourceModelName: 'Order'
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
      unitLabel: 'Count',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'System',
      sourceModelName: 'Order'
    },
    {
      id: uuidv5('total_orders_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'total_orders_yearly',
      description: 'Yearly total order count',
      displayName: 'Yearly Total Order Count',
      shortName: 'TOY',
      unit: 'Integer',
      unitLabel: 'Count',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'System',
      sourceModelName: 'Order'
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
      unitLabel: 'Price',
      timeRange: 'None',
      modelName: 'Product'
    },
    // product sales count
    {
      id: uuidv5('product_sale', UUID_NAMESPACE),
      parentId: uuidv5('product_sale_daily', UUID_NAMESPACE),
      level: 0,
      name: 'product_sale',
      description: 'Product sale amount',
      displayName: 'Product Sale Amount',
      shortName: 'PS',
      unit: 'Currency',
      unitLabel: 'Amount',
      timeRange: 'None',
      modelName: 'Product',
      sourceModelName: 'Order'
    },
    {
      id: uuidv5('product_sale_daily', UUID_NAMESPACE),
      parentId: uuidv5('product_sale_monthly', UUID_NAMESPACE),
      level: 1,
      name: 'product_sale_daily',
      description: 'Product total sale daily',
      displayName: 'Product Total Sale Daily',
      shortName: 'PSD',
      unit: 'Currency',
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'Product',
      sourceModelName: 'Order'
    },
    {
      id: uuidv5('product_sale_monthly', UUID_NAMESPACE),
      parentId: uuidv5('product_sale_yearly', UUID_NAMESPACE),
      level: 2,
      name: 'product_sale_monthly',
      description: 'Product total sale monthly',
      displayName: 'Product Total Sale Monthly',
      shortName: 'PSM',
      unit: 'Currency',
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'Product',
      sourceModelName: 'Order'
    },
    {
      id: uuidv5('product_sale_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'product_sale_yearly',
      description: 'Product total sale yearly',
      displayName: 'Product Total Sale Yearly',
      shortName: 'PSY',
      unit: 'Currency',
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'Product',
      sourceModelName: 'Order'
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
      unitLabel: 'Amount',
      timeRange: 'None',
      modelName: 'Client',
      sourceModelName: 'Order'
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
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Daily',
      modelName: 'Client',
      sourceModelName: 'Order'
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
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Monthly',
      modelName: 'Client',
      sourceModelName: 'Order'
    },
    {
      id: uuidv5('client_sale_yearly', UUID_NAMESPACE),
      level: 3,
      name: 'client_sale_yearly',
      description: 'Yearly sale amount by client',
      displayName: 'Yearly Sale Amount By Client',
      shortName: 'CSY',
      unit: 'Currency',
      unitLabel: 'Amount',
      aggregationType: 'Sum',
      timeRange: 'Yearly',
      modelName: 'Client',
      sourceModelName: 'Order'
    }
  ];

  // Seed metric definition if not exists already.
  try {
    await Promise.map(SEED_METRICS, async (metricDef) => {
      // const metric = await app.models.Metric.findById(metricDef.id, { fields: { id: true } });
      // if (!metric) {
      //   await app.models.Metric.create(metricDef);
      //   logger.info(`Seeded metric definition for ${metricDef.name}`);
      // }
      await app.models.Metric.upsert(metricDef);
    }, {
      concurrency: 4    // avoid EventEmitter memory leak
    });
  } catch (error) {
    logger.error(`Error while initializing metric definitions - ${error.message}`);
    throw error;
  }

  // Data conversion. Convert metric data of 'product_sale' if 'sourceInstanceId'
  // is not set.
  // NOTE: This code block should be removed after converting all environments.
  const productSaleMID = uuidv5('product_sale', UUID_NAMESPACE);
  let mData = await app.models.MetricData.findOne({ where: { metricId: productSaleMID, sourceInstanceId: null } });
  if (mData) {
    let mDataArray = await app.models.MetricData.find({ where: { metricId: productSaleMID, sourceInstanceId: null } });
    logger.debug(`Converting ${mDataArray.length} metric data of 'product_sale'...`);
    try {
      await Promise.map(mDataArray, async (mData) => {
        const orderItem = await app.models.OrderItem.findById(mData.instanceId);
        if (!orderItem) {
          await mData.destroy();
          logger.debug(`Destroyed metric data(id: ${mData.id})`);
        } else {
          // Two properties to update:
          // 1. update instanceId from OrderItem.id to OrderItem.productId
          // 2. update sourceInstanceId to OrderItem.orderId
          mData.instanceId = orderItem.productId;
          mData.sourceInstanceId = orderItem.orderId;
          await mData.save();
          logger.debug(`Updated metric data(id: ${mData.id})`);
        }
      }, {
        concurrency: 4
      });
    } catch (error) {
      logger.error(`Error while converting metric data - ${error.message}`);
      throw error;
    }
    logger.debug('Conversion done.');
  }
};
