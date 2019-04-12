'use strict';
const appRoot = require('app-root-path');
const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');
const morgan = require('morgan');

// read .env before requiring other app files.
require('dotenv').config();
const logger = require(appRoot + '/config/winston.js');
const tenantSettings = require(appRoot + '/config/tenant');
const getPublicContent = require('./middleware/public-content');
const checkJwt = require('./middleware/check-jwt');

const app = module.exports = loopback();
const ENV = process.env.NODE_ENV || 'production';

if (ENV === 'production') {
  process.on('unhandledRejection', (reason, p) => {
    logger.error(`Unhandled Rejection at: Promise ${p} reason: ${reason}`);
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

if (!process.env.ONE_OFF) {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Get the local tenant settings from environment variables.
app.get('/tenant', function(req, res, next) {
  res.send(tenantSettings);
});

// Getting public page content bypasses authentication.
app.get('/public/:name', function(req, res, next) {
  getPublicContent(app, req, res, next);
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
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
