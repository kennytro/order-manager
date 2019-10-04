'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');
const morgan = require('morgan');
const cluster = require('cluster');
const pgTypes = require('pg').types;
const yn = require('yn');

// read .env before requiring other app files.
require('dotenv').config();
const logger = require(appRoot + '/config/winston.js');
const tenantSettings = require(appRoot + '/config/tenant');
const getPublicContent = require('./middleware/public-content');
const submitInquiry = require('./middleware/inquiry');
const checkJwt = require('./middleware/check-jwt');
const modelSockets = require('./model-sockets');

const worker = require('./worker/worker');

const app = module.exports = loopback();
const ENV = process.env.NODE_ENV || 'production';

if (ENV === 'production') {
  process.on('unhandledRejection', (reason, p) => {
    logger.error(`Unhandled Rejection at: Promise ${p} reason: ${reason}`);
  });
}

// Shutdown procedures
let shutdownInProgress = false;
async function shutdown(signal) {
  logger.info(`Shutting down application(signal = ${signal})...`);
  if (shutdownInProgress) {
    logger.info('Shutdown already in progress');
    return;
  }
  shutdownInProgress = true;
  if (app.redis) {
    const quitRedis = Promise.promisify(app.redis.quit).bind(app.redis);
    try {
      await quitRedis().timeout(3000);
    } catch (error) {
      if (error instanceof Promise.TimeoutError) {
        logger.warn('Could not quit redis connection within 3 seconds');
      }
      logger.error(`Error while quitting Redis - ${error.message}`);
    }
  }
  process.exit();
}
process.on('SIGINT', _.partial(shutdown, 'SIGINT'));
process.on('SIGTERM', _.partial(shutdown, 'SIGTERM'));

// Start worker process
if (!yn(process.env.DISABLE_CLUSTER)) {
  // start a worker
  if (cluster.isMaster) {
    logger.info('Master process started.');
    let worker = cluster.fork({
      IS_WORKER: true
    });
    cluster.on('exit', (worker, code, signal) => {
      logger.info(`worker ${worker.process.pid} died.`);
      if (!shutdownInProgress) {
        let newWorker = cluster.fork({
          IS_WORKER: true
        });
        logger.info(`Starting replacement worker ${newWorker.process.pid}.`);
      }
    });
  } else {
    logger.info('Worker process started.');
  }
}

if (!process.env.ONE_OFF) {
  app.use(morgan('combined', { stream: logger.stream }));
}

if (cluster.isMaster) {
  // Get the local tenant settings from environment variables.
  app.get('/tenant', function(req, res, next) {
    res.send(tenantSettings);
  });

  // Getting public page content bypasses authentication.
  app.get('/public/:name', function(req, res, next) {
    getPublicContent(app, req, res, next);
  });

  // Post inquiry messsage
  app.post('/inquiry', function(req, res, next) {
    submitInquiry(app, req, res, next);
  });

  // check JWT access token for all request hitting '/api'
  app.use('/api', checkJwt, loopback.rest());

  app.use(function(err, req, res, next) {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (err.name === 'UnauthorizedError') {
      res.status(401).send('Invalid token. You must be logged in to access this API.');
    }
    next(err);
  });

  app.use(loopback.static(path.resolve(__dirname, '../dist')));
  app.all('/*', function(req, res, next) {
    if (ENV !== 'production' &&
      app.get('loopback-component-explorer') &&
      req.path.startsWith(app.get('loopback-component-explorer').mountPath)) {
      next();   // enable explorer in non-production env.
    } else {
      res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    }
  });
}

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    logger.info(`Web server listening at: ${baseUrl}`);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      logger.info(`Browse your REST API at ${baseUrl + explorerPath}`);
    }
  });
};

/* convert numeric columns so that we have actual numbers instead
 * of strings. This is important for column sorting and arithmatic operation.
 * https://github.com/brianc/node-pg-types/issues/28 */
pgTypes.setTypeParser(1700, 'text', parseFloat);

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (cluster.isMaster && require.main === module) {
    let server = app.start();
    modelSockets.init(app, server);
    require('./web-app-redis-sub')(app);
  }
  if (cluster.isWorker && require.main === module) {
    worker.start(app);
  }
});
