'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const path = require('path');

require('dotenv').config();
const tenantSettings = require('./tenant');
const getPublicContent = require('./middleware/public-content');

const app = module.exports = loopback();
const ENV = process.env.NODE_ENV || 'production';

if (ENV === 'production') {
  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  });
}

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Get the local tenant settings from environment variables.
app.get('/tenant', function(req, res, next) {
  res.send(tenantSettings);
});

// Getting public page content bypasses authentication.
app.get('/public/:name', function(req, res, next) {
  getPublicContent(app, req, res, next);
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
