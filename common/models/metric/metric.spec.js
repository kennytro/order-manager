'use strict';
const expect = require('chai').expect;
const appRoot = require('app-root-path');

describe('Metric test', function() {
  const app = require(appRoot + '/server/server');
  const TS_NAME = 'total_sale';
  before(function(done) {
    setTimeout(async () => {
      const totalSaleMetric = await app.models.Metric.findOne({ where: { name: TS_NAME } });
      await app.models.MetricData.create({
        metricId: totalSaleMetric.id,
        value: 100.01,
        metricDate: new Date()
      });
      done();
    }, 100);  // allow metrics to be seeded.
  });
  it('should count seeded metrics', async function() {
    expect(await app.models.Metric.count()).to.equal(22, 'expect seeded metrics');
  });
  it('should not find metric data by bad metric name', async function() {
    let mData = await app.models.Metric.findMetricDataByName(['non-existing']);
    expect(mData.length).to.equal(0, 'expect no metric data');
  });
  it('should find metric data', async function() {
    let mData = await app.models.Metric.findMetricDataByName([TS_NAME]);
    expect(mData.length).to.equal(1, 'expect a metric data');
  });
  it('should use metric name instead of id', async function() {
    let mData = await app.models.Metric.findMetricDataByName([TS_NAME]);
    mData.forEach((md) => {
      expect(md.metricId).to.equal(TS_NAME, 'expect metric name');
    });
  });
});
