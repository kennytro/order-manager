'use strict';
const appRoot = require('app-root-path');
const debugMockData = require('debug')('order-manager:Metric:mockData');
const moment = require('moment');
const yn = require('yn');
const app = require(appRoot + '/server/server');

/**
 * Mock product unit price. Randomly select 2/3 products and adjust
 * their unit price within range [-0.5%, +0.5%]
 */
async function mockProductData() {
  debugMockData('Product.mockData() - Begins');
  const products = await app.models.Product.find();
  await Promise.each(products, async product => {
    if (Math.random() >= 0.33) {
      let randomPercentage = ((Math.random() * 10) - 5) / 100.0;    // -0.05 .. 0.05
      let diffAmount = Number((product.unitPrice * randomPercentage).toFixed(2));
      const newPrice = Number(product.unitPrice) + diffAmount;
      // [HACK] In order to avoid operation hook for imageURL, use updateAll() instead.
      // await product.save();
      await  app.models.Product.updateAll({ id: product.id }, { unitPrice: newPrice });
      debugMockData(`<Product[${product.id}]>: Updated unit price to ${newPrice}`);
    }
  });
  debugMockData('Product.mockData() - Ends');
};

/**
 * create 5 mock clients. Mock clients have an email 'mockClient@etr.com'
 * @returns {Client[]} - array of mock clients
 */
async function getMockClients() {
  debugMockData('Client.mockData() - Begins');
  let clients = [];
  const MockEmail = 'mockClient@etr.com';
  clients = await app.models.Client.find({ where: { email: MockEmail } });
  if (clients.length === 0) {
    const MockClients = [
      {
        name: 'Kenny Market',
        addressStreet: '3508 W 3rd St.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90020',
        phone: '213-555-1111', email: MockEmail, contactPersonName: 'Kenny T. Ro', contactPersonPhone: '213-555-1112',
        feeType: 'Rate', feeValue: 3.50, showPublic: false
      },
      {
        name: 'Jose Food',
        addressStreet: '928 S Western Ave #257.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90006',
        phone: '213-555-2222', email: MockEmail, contactPersonName: 'Jose Ro', contactPersonPhone: '213-555-2221',
        feeType: 'Rate', feeValue: 4.50, showPublic: false
      },
      {
        name: 'LA Grocery',
        addressStreet: '2915 W Olympic Blvd.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90006',
        phone: '213-555-3333', email: MockEmail, contactPersonName: 'Kenny La', contactPersonPhone: '213-555-3332',
        feeType: 'Fixed', feeValue: 100.00, showPublic: false
      },
      {
        name: 'Kim\'s Dollar Store',
        addressStreet: '3917 W 6th St.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90020',
        phone: '213-555-4444', email: MockEmail, contactPersonName: 'Lan Y. Kim', contactPersonPhone: '213-555-4442',
        feeType: 'Rate', feeValue: 4.00, showPublic: false
      },
      {
        name: 'USA Market',
        addressStreet: '1471 W Jefferson Blvd.', addressCity: 'Los Angeles', addressState: 'CA', addressZip: '90007',
        phone: '213-555-5551', email: MockEmail, contactPersonName: 'Steve Trump', contactPersonPhone: '213-555-5552',
        feeType: 'Rate', feeValue: 5.50, showPublic: false
      }
    ];
    try {
      const routes = await app.models.DeliveryRoute.find();
      MockClients.forEach(function(client, index) {
        client.deliveryRouteId = routes[index % routes.length].id;
      });
      clients = await app.models.Client.create(MockClients);
      clients.forEach(function(client) {
        debugMockData(`<Client[${client.id}]>: Created new client`);
      });
    } catch (error) {
      console.error(`Failed to create mock clients - ${error.message}`);
    }
  }
  debugMockData('Client.mockData() - Ends');
  return clients;
};

/**
 *  create mock data using random number generator.
 * [NOTE] this function is called 4 times a day, at 8, 12, 18, 20.
 */
module.exports.create = async function(fireDate) {
  if (!yn(process.env.CREATE_MOCK_DATA)) {
    return;
  }
  debugMockData(`${moment(fireDate).format()}: Running Metric.mockData()`);
  if (fireDate.getHours() === 8) {
    await mockProductData();
  }

  let clients = await getMockClients();
  if (fireDate.getDay() > 0) {  // skip Sunday
    await app.models.Order.mockData(clients);
  } else {
    await app.models.Statement.mockData(clients);
  }
};

/**
 * Remove old metric data of mock clients -
 *  1. leaf level metric data older than 1 week.
 *  2. Product metric data older than 3 months
 *  3. Statements older than 3 months.
 */
module.exports.remove = async function(fireDate) {
  if (!yn(process.env.CREATE_MOCK_DATA)) {
    return;
  }

  debugMockData(`${moment(fireDate).format()}: Running Metric.removeOldMockData()`);
  let mockClients = await getMockClients();

  // remove leaf level metric data of mock orders that are older than 7 days.
  const sevenDaysAgo = moment().subtract(7, 'days').toDate();
  let mockOrders = await app.models.Order.find({
    where: { and: [
      { clientId: { inq: mockClients.map(client => client.id) } },
      { createdAt: { lt: sevenDaysAgo } }
    ] },
    fields: { id: true }
  });
  let orderLeafMetrics = await app.models.Metric.find({
    where: { and: [
      { level: 0 },
      { sourceModelName: 'Order' }
    ] },
    fields: { id: true }
  });
  await app.models.MetricData.destroyAll({ and: [
    { metricId: { inq: orderLeafMetrics.map(metric => metric.id) } },
    { sourceInstanceId: { inq: mockOrders.map(order => order.id) } }
  ] });
  debugMockData(`Removed all leaf metric data of mock data older than ${sevenDaysAgo.toLocaleDateString('en-US')}`);

  // remove product metric data that are older than 3 months.
  const threeMonthAgo = moment().subtract(3, 'months').toDate();
  let productMetrics = await app.models.Metric.find({ where: { modelName: 'Product' } });
  await app.models.MetricData.destroyAll({
    metricId: { inq: productMetrics.map(metric => metric.id) },
    metricDate: { lt: threeMonthAgo }
  });
  debugMockData(`Removed all product metric data older than ${threeMonthAgo.toLocaleDateString('en-US')}`);

  // remove statements of mock clients that are older than 3 months.
  await app.models.Statement.removeOldData(mockClients, threeMonthAgo);
};
