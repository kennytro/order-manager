'use strict';
const _ = require('lodash');
const auth0ManagementClient = require('auth0').ManagementClient;
const tenantSettings = require('../tenant');

module.exports = async function(app) {
  if (process.env.ONE_OFF) {
    return;  // skip initialization for one off process.
  }

  const clientId = process.env.AUTH0_API_CLIENT_ID;
  const clientSecret = process.env.AUTH0_API_CLIENT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!clientId || !clientSecret || !adminEmail) {
    console.log('Auth0 client id/secret/admin email are not set - skipping auth0 initialization.');
    return;
  }
  const management = new auth0ManagementClient({
    domain: tenantSettings.domainId,
    clientId: clientId,
    clientSecret: clientSecret
  });

  try {
    let adminUser = await management.getUsersByEmail(adminEmail);
    if (_.isEmpty(adminUser)) {
      console.debug(`Creating admin(email: ${adminEmail}) user ...`);
      await management.createUser({
        connection: tenantSettings.connection,
        email: adminEmail,
        password: process.env.ADMIN_PW || 'AdminPassw0rd!',
        name: 'Administrator',
        nickname: 'admin',
        app_metadata: {
          roles: ['admin']
        }
      });
      console.log('Successfully created admin user.');
    }
  } catch (err) {
    console.log('error: ' + err);
  }
};
