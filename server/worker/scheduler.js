'use strict';
const _ = require('lodash');
const scheduler = require('node-schedule');
const yn = require('yn');
const messageBatch = require('./message-batch');
const metricBatch = require('./metric-batch');
const mockData = require('./mock-data');

module.exports = function(app) {
  if (yn(process.env.ONE_OFF) || !yn(process.env.IS_WORKER)) {
    return;  // skip if it's one off process or not a worker.
  }

  // schedule jobs to run every 10 seconds
  scheduler.scheduleJob('*/10 * * * * *', metricBatch.batchUpdate);

  // schedule jobs to run every midnight
  const everyMidnightRule = new scheduler.RecurrenceRule();
  everyMidnightRule.hour = 0;
  everyMidnightRule.minute = 0;
  scheduler.scheduleJob(everyMidnightRule, _.partial(messageBatch.delExpiredMessage, app));

  if (yn(process.env.CREATE_MOCK_DATA)) {
    // schedule job to create mock data. This job runs 4 times everyday.
    // 4 times are due to update order status to 4 different values.
    const mockRule = new scheduler.RecurrenceRule();
    mockRule.hour = [8, 12, 18, 20];
    mockRule.minute = 0;
    mockRule.second = 30;
    scheduler.scheduleJob(mockRule, mockData.create);

    // schedule job to remove old mock data to run at 23:00 on Sunday.
    const rmMockRule = new scheduler.RecurrenceRule();
    rmMockRule.dayOfWeek = [0];
    rmMockRule.hour = 23;
    rmMockRule.minute = 0;
    rmMockRule.second = 0;
    scheduler.scheduleJob(rmMockRule, mockData.remove);
  }
};
