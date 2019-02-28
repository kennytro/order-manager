'use strict';
const appRoot = require('app-root-path');
const Transport = require('winston-transport');
const winston = require('winston');
const _ = require('lodash');
const db = require(appRoot + '/common/util/database');

/*
 * Custom Winston transport to save error in postgres database.
*/
class Postgres extends Transport {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    if (!opts.dataSourceName || !opts.url) {
      throw new Error('Postgres transport requires data source name and connection URL');
    }

    if (!opts.tableName) {
      throw new Error('Postgres transport requires table name');
    }

    // Postgres transport options
    this.sqlCmd = `INSERT INTO ${opts.tableName} (level, message, metadata) VALUES ($1, $2, $3)`;
    this.pool = db.getPool(opts.dataSourceName, opts.url);
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    (async () => {
      const client = await this.pool.connect();
      try {
        client.query(this.sqlCmd, [info.level, info.message, info.meta]);
      } finally {
        client.release();      // IMPORTANT: must release connection to avoid leak.
      }
    })().catch(e => console.log(e.stack));
    callback();
  }
};

// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  },
  pg: {
    level: 'error',
    handleExceptions: true,
    json: true,
    dataSourceName: 'OrderManager',
    url: process.env.DATABASE_URL,
    tableName: 'app_error'
  }
};

// instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
    new Postgres(options.pg)
  ],
  exitOnError: false // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  }
};

module.exports = logger;
