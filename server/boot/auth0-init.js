'use strict';
const _ = require('lodash');
const auth0ManagementClient = require('auth0').ManagementClient;
const tenantSettings = require('../tenant');

/* During boot-up, check and create both Auth0 and EndUser for admin.
*/
module.exports = async function(app) {
  if (process.env.ONE_OFF) {
    return;  // skip initialization for one off process.
  }

  const CLIENT_ID = process.env.AUTH0_API_CLIENT_ID;
  const CLIENT_SECRET = process.env.AUTH0_API_CLIENT_SECRET;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (!CLIENT_ID || !CLIENT_SECRET || !ADMIN_EMAIL) {
    console.log('Auth0 client id/secret/admin email are not set - skipping auth0 initialization.');
    return;
  }
  const management = new auth0ManagementClient({
    domain: tenantSettings.domainId,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  });

  let adminUsers = [];    // plural because getUsersByEmail returns an array.
  try {
    adminUsers = await management.getUsersByEmail(ADMIN_EMAIL);
    if (_.isEmpty(adminUsers)) {
      console.debug(`Creating admin(email: ${ADMIN_EMAIL}) user ...`);
      adminUsers[0] = await management.createUser({
        connection: tenantSettings.connection,
        email: ADMIN_EMAIL,
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
    console.log('error while checking admin user in Auth0 - ' + err);
  }

  let user = await app.models.EndUser.findOne({ where: { email: ADMIN_EMAIL } });
  if (!user && !_.isEmpty(adminUsers)) {
    app.models.EndUser.create({
      authId: adminUsers[0].user_id,
      email: ADMIN_EMAIL,
      userSettings: {
        roles: ['admin']
      }
    });
  }
};
