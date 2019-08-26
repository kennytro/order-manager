'use strict';
const appRoot = require('app-root-path');
const request = require('request');
const debugAuth0 = require('debug')('order-manager:EndUser:auth0');
const _ = require('lodash');
const auth0ManagementClient = require('auth0').ManagementClient;
const tenantSettings = require(appRoot + '/config/tenant');
const logger = require(appRoot + '/config/winston');
const app = require(appRoot + '/server/server');
const Auth0EventMap = require(appRoot + '/common/util/auth0-event-code-map');

module.exports = function(EndUser) {
  const CLIENT_ID = process.env.AUTH0_API_CLIENT_ID;
  const CLIENT_SECRET = process.env.AUTH0_API_CLIENT_SECRET;
  const DEFAULT_PW = process.env.DEFAULT_PW;

  /**
   * Helper function that checks Auth0 management client and throws
   * an error if it's not set up.
   */
  function checkAuth0Client() {
    if (!app.auth0MgmtClient) {
      let error =  new Error('Auth0 management client is not set');
      error.status = 500;
      throw error;
    }
  }

  /* clientId is required is user role is customer.
   */
  EndUser.validate('clientId', function(err) {
    if (this.role === 'customer' && !this.clientId) {
      err();
    }
  }, {
    message: 'Client ID is required for \'customer\' role.'
  });
  EndUser.validatesPresenceOf('email', { message: 'Cannot be blank' });

  const AllowedMethodsByRole = {
    customer: ['sendMeResetPasswordEmail', 'getMyUser', 'saveProductExclusionList'],
    manager: ['sendMeResetPasswordEmail'],
    admin: ['sendMeResetPasswordEmail', 'getAuth0Logs']
  };

  /**
   * @returns {string[]} - array of employee roles.
   */
  EndUser.employeeRoles = function() {
    return ['admin', 'manager'];
  };

  /*
   * @param {string} role name
   * @returns {string[]} allowed method name array.
   */
  EndUser.allowedMethods = function(role) {
    if (AllowedMethodsByRole[role]) {
      return AllowedMethodsByRole[role];
    }
    return [];
  };

  /*
   * @param {string[]} - roles
   * @returns {string} - role with highest privilege.
   */
  EndUser.getHighestRole = function(roles) {
    if (_.includes(roles, 'admin')) {
      return 'admin';
    }
    if (_.includes(roles, 'manager')) {
      return 'manager';
    }
    if (_.includes(roles, 'customer')) {
      return 'customer';
    }
    let error = new Error(`Unauthorized roles - ${JSON.stringify(roles)}`);
    error.status = 401;
    throw error;
  };

  /*
  ** @param {object} userObject
  ** @returns {EndUser} newUser
  */
  EndUser.createNewUser = async function(userObject) {
    checkAuth0Client();
    // if (!app.auth0MgmtClient) {
    //   let error =  new Error('Auth0 management client is not set');
    //   error.status = 500;
    //   throw error;
    // }
    // const management = new auth0ManagementClient({
    //   domain: tenantSettings.domainId,
    //   clientId: CLIENT_ID,
    //   clientSecret: CLIENT_SECRET
    // });
    let auth0User = null;
    try {
      auth0User = await app.auth0MgmtClient.createUser({
        connection: tenantSettings.connection,
        email: userObject.email,
        password: DEFAULT_PW,
        app_metadata: {
          clientId: userObject.clientId,
          roles: [userObject.role]
        }
      });
      debugAuth0(`Created new user(email: ${userObject.email}, auth0 id: ${auth0User.user_id})`);
    } catch (error) {
      if (error.statusCode !== 409) {
        logger.error(`Error while creating Auth0 user(email: ${userObject.email}, clientId: ${userObject.clientId}) - ${error.message}`);
        throw error;
      }
      let users = await app.auth0MgmtClient.getUsersByEmail(userObject.email);
      auth0User = users[0];
      debugAuth0(`User(email: ${userObject.email}, auth0 id: ${auth0User.user_id}) already exists.`);
    }
    try {
      userObject.authId = auth0User.user_id;
      let newUser = await EndUser.upsertWithWhere({ email: userObject.email }, userObject);

      if (!auth0User.email_verified) {
        EndUser.sendMeResetPasswordEmail(newUser.authId);  // send email asynchronously
      }

      return newUser;
    } catch (error) {
      logger.error(`Error while creating user(email: ${userObject.email}, clientId: ${userObject.clientId}) - ${error.message}`);
      throw error;
    }
  };

  EndUser.updateUser = async function(userObject) {
    checkAuth0Client();

    // if (!app.auth0MgmtClient) {
    //   let error =  new Error('Auth0 management client is not set');
    //   error.status = 500;
    //   throw error;
    // }
    // const management = new auth0ManagementClient({
    //   domain: tenantSettings.domainId,
    //   clientId: CLIENT_ID,
    //   clientSecret: CLIENT_SECRET
    // });
    let existingUser = await EndUser.findById(userObject.id);
    if (!existingUser) {
      logger.info(`EndUser(id: ${userObject.id}) does not exist.`);
      return;
    }
    if (existingUser.clientId !== userObject.clientId) {
      try {
        await app.auth0MgmtClient.updateAppMetadata({ id: existingUser.authId },
          {
            clientId: userObject.clientId,
            roles: [userObject.role]
          });
        debugAuth0(`Updated user(auth0 id: ${existingUser.authId}) app metadata.`);
      } catch (error) {
        logger.error(`Error while updating Auth0 user app metadata(email: ${userObject.email}, clientId: ${userObject.clientId} - ${error.message}`);
        throw error;
      }
    }

    try {
      return await EndUser.upsert(userObject);
    } catch (error) {
      logger.error(`Error while upserting user(id: ${userObject.id} - ${error.message}`);
      // we must role back Auth0 user app metadata
      if (existingUser.clientId !== userObject.clientId) {
        await app.auth0MgmtClient.updateAppMetadata({ id: existingUser.authId },
          {
            clientId: existingUser.clientId,
            roles: [existingUser.role]
          });
        debugAuth0(`Rolled back user(auth0 id: ${existingUser.authId}) app metadata.`);
      }
    }
  };

  /*
  ** @param {string} id
  */

  EndUser.deleteUser = async function(id) {
    checkAuth0Client();

    // if (!app.auth0MgmtClient) {
    //   let error =  new Error('Auth0 management client is not set');
    //   error.status = 500;
    //   throw error;
    // }
    let user = await EndUser.findById(id);
    if (!user) {
      logger.info(`EndUser(id: ${id}) does not exist.`);
      return;
    }
    // const management = new auth0ManagementClient({
    //   domain: tenantSettings.domainId,
    //   clientId: CLIENT_ID,
    //   clientSecret: CLIENT_SECRET
    // });
    try {
      if (user.authId) {
        await app.auth0MgmtClient.deleteUser({ id: user.authId });
        debugAuth0(`successfully deleted user(id: ${id}, auth0Id: ${user.authId}`);
      }
      await EndUser.destroyById(id);
    } catch (error) {
      logger.error(`error while deleting user(id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  EndUser.getMyUser = async function(authId) {
    return await app.models.EndUser.findOne({
      where: { authId: authId }
    });
  };

  /*
   * @param {string} Auth0 user id
   * @returns {{status: string}}
   */
  EndUser.sendMeResetPasswordEmail = async function(authId) {
    let endUser = await app.models.EndUser.findOne({
      where: { authId: authId }
    });
    if (!endUser) {
      return { status: `Cannot find user with Auth0 ID: ${authId}` };
    }
    const options = {
      method: 'POST',
      url: 'https://' + tenantSettings.domainId + '/dbconnections/change_password',
      headers: { 'content-type': 'application/json' },
      body: {
        client_id: CLIENT_ID,
        email: endUser.email,
        connection: tenantSettings.connection
      },
      json: true
    };
    let response = await new Promise((resolve, reject) => {
      request(options, function(error, response, body) {
        if (error) {
          debugAuth0(`Error while sending a change password email(${endUser.email}) - ${error.message}`);
          reject(new Error(error));
        } else {
          logger.info(body);
          debugAuth0(`Successfully send a change password email(${endUser.email})`);
          resolve(body);
        }
      });
    });
    return { status: response };
  };

  /**
   * @param {string[]} exList -  list of products to exclude from order page.
   */
  EndUser.saveProductExclusionList = async function(exList) {
    // TODO: CODE HERE
  };

  /**
   * Get Auth0 logs of given user ID.
   * @param {string} - auth0 user ID
   * @returns {Object[]} - Array of log record.
   */
  EndUser.getAuth0Logs = async function(authId) {
    checkAuth0Client();
    try {
      let logs = await app.auth0MgmtClient.getUserLogs({
        id: authId
      });
      return logs.map(log => {
        let fromLoc = _.get(log, ['location_info', 'city_name'], '') + '/' + _.get(log, ['location_info', 'country_code'], '');
        if (fromLoc === '/') {
          fromLoc = 'N/A';
        }
        return {
          date: log.date,
          type: log.type,
          description: Auth0EventMap.get(log.type),
          // ip: log.ip,
          // userAgent: log.user_agent,
          from: fromLoc
        };
      });
    } catch (error) {
      logger.error(`Error while getting user(id: ${authId}) log - ${error.message}`);
      throw error;
    }
  };
};
