'use strict';
const scheduler = require('node-schedule');
const yn = require('yn');

module.exports = function(app) {
  if (yn(process.env.ONE_OFF) || !yn(process.env.IS_WORKER)) {
    return;  // skip if it's one off process or not a worker.
  }

  // schedule jobs to run every minute
  const everyMinRule = new scheduler.RecurrenceRule();
  everyMinRule.second = 0;
  scheduler.scheduleJob(everyMinRule, app.models.Metric.batchUpdate);

  if (yn(process.env.CREATE_MOCK_DATA)) {
    const mockRule = new scheduler.RecurrenceRule();
    mockRule.hour = [8, 12, 18, 20];
    mockRule.minute = 0;
    mockRule.second = 30;
    scheduler.scheduleJob(mockRule, app.models.Metric.mockData);
  }

  // schedule jobs to run every midnight
  // const everyMidnightRule = new scheduler.RecurrenceRule();
  // everyMidnightRule.hour = 0;
  // scheduler.scheduleJob(everyMidnightRule, app.models.Metric.removeOldData);
};
