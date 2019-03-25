'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const auth0ManagementClient = require('auth0').ManagementClient;
const tenantSettings = require(appRoot + '/config/tenant');
const logger = require(appRoot + '/config/winston');

/* During boot-up, initialize Auth0 tenant.
*/
module.exports = async function(app) {
  if (process.env.ONE_OFF) {
    return;  // skip initialization for one off process.
  }

  const CLIENT_ID = process.env.AUTH0_API_CLIENT_ID;
  const CLIENT_SECRET = process.env.AUTH0_API_CLIENT_SECRET;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  if (!CLIENT_ID || !CLIENT_SECRET || !ADMIN_EMAIL) {
    logger.info('Auth0 client id/secret/admin email are not set - skipping auth0 initialization.');
    return;
  }
  const management = new auth0ManagementClient({
    domain: tenantSettings.domainId,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  });

  await createAdminUser(management);
  await createRules(management);
  /*
   * @param{Auth0.ManagementClient} - mgmtClient
   * check and create both Auth0 and EndUser for admin.
   */
  async function createAdminUser(mgmtClient) {
    let adminUsers = [];    // plural because getUsersByEmail returns an array.
    try {
      adminUsers = await mgmtClient.getUsersByEmail(ADMIN_EMAIL);
      if (_.isEmpty(adminUsers)) {
        logger.debug(`Creating admin(email: ${ADMIN_EMAIL}) user ...`);
        adminUsers[0] = await mgmtClient.createUser({
          connection: tenantSettings.connection,
          email: ADMIN_EMAIL,
          password: process.env.ADMIN_PW || 'AdminPassw0rd!',
          name: 'Administrator',
          nickname: 'admin',
          app_metadata: {
            roles: ['admin']
          }
        });
        logger.info('Successfully created admin user.');
      }
    } catch (err) {
      logger.info('error while checking admin user in Auth0 - ' + err);
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
  }

  /*
   * @param{Auth0.ManagementClient} - mgmtClient
   * check and create 3 rules.
   */
  async function createRules(mgmtClient) {
    const rulesToSeed = [
      {
        name: 'Force email verification',
        script: `function (user, context, callback)
  { if (!user.email_verified) {
    return callback(new UnauthorizedError('Please verify your email before logging in.'));
  } else {
    return callback(null, user, context);
  }
}`,
        order: 1,
        enabled: true
      },
      {
        name: 'Check user role',
        script: `function (user, context, callback) {
  if (user.app_metadata) {
    const roles = user.app_metadata.roles || [];
    if (roles.includes('customer') ||
        roles.includes('manager') ||
        roles.includes('admin')) {
      return callback(null, user, context);
    }
  }
  callback(new UnauthorizedError('This user does not have a role assigned.'));
}`,
        order: 2,
        enabled: true
      },
      {
        name: 'Add user and app metadata to access token',
        script: `function (user, context, callback) {
  const namespace = 'https://om.com/';
  if (user.user_metadata) {
    context.idToken[namespace + 'user_metadata'] = user.user_metadata;
  }
  if (user.app_metadata) {
    context.idToken[namespace + 'app_metadata'] = user.app_metadata;
  }
  callback(null, user, context);
}`,
        order: 3,
        enabled: true
      }
    ];
    let existingRules = await mgmtClient.getRules({ per_page: 5, page: 0 });
    await Promise.each(rulesToSeed, async (rule) => {
      if (_.find(existingRules, existingRule => existingRule.name === rule.name)) {
        logger.debug(`Auth0 rule(name: ${rule.name}) already exists.`);
        return;
      }
      try {
        await mgmtClient.createRule(rule);
        logger.info(`Auth0 rule(name: ${rule.name}) is created.`);
      } catch (error) {
        logger.info(`Error while creating Auth0 rule(name: ${rule.name}) - ${error.message}`);
      }
    });
  }
};
