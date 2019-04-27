'use strict';
const scheduler = require('node-schedule');

module.exports = function(app) {
  if (process.env.ONE_OFF || !process.env.IS_WORKER) {
    return;  // skip if it's one off process or not a worker.
  }

  // schedule jobs to run every minute
  const everyMinRule = new scheduler.RecurrenceRule();
  everyMinRule.second = 0;
  scheduler.scheduleJob(everyMinRule, app.models.Metric.batchUpdate);

  // schedule jobs to run every midnight
  // const everyMidnightRule = new scheduler.RecurrenceRule();
  // everyMidnightRule.hour = 0;
  // scheduler.scheduleJob(everyMidnightRule, app.models.Metric.removeOldData);
};
