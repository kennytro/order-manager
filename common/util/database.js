'use strict';
const appRoot = require('app-root-path');
const { Pool } = require('pg');
const url = require('url');
const logger = require(appRoot + '/config/winston');

let pool = {};
module.exports = {
  /*
   * @param {string} data source name
   * @param {string} connection URL
   * @returns {object} Pool
   */
  getPool: function(dataSource, connectUrl) {
    if (pool[dataSource]) {
      return pool[dataSource];
    }

    // parse DB URL
    const params = url.parse(connectUrl, true);
    const auth = params.auth.split(':');

    pool[dataSource] = new Pool({
      user: auth[0],
      password: auth[1],
      host: params.hostname,
      port: params.port,
      database: params.pathname.split('/')[1],
      ssl: params.query.ssl
    });

    // the pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    pool[dataSource].on('error', (err, client) => {
      logger.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
    return pool[dataSource];
  }
};
