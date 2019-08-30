'use strict';
const cacheManager = require('cache-manager');
module.exports = function(app) {
  app.memoryCache = cacheManager.caching({
    store: 'memory',
    max: 100,
    ttl: 10  /* seconds */
  });
};
