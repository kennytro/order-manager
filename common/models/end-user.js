'use strict';
const appRoot = require('app-root-path');
const request = require('request');
const debugAuth0 = require('debug')('order-manager:EndUser:auth0');
const _ = require('lodash');
const auth0ManagementClient = require('auth0').ManagementClient;
const tenantSettings = require(appRoot + '/config/tenant');
const logger = require(appRoot + '/config/winston');
const app = require(appRoot + '/server/server');

module.exports = function(EndUser) {
  const CLIENT_ID = process.env.AUTH0_API_CLIENT_ID;
  const CLIENT_SECRET = process.env.AUTH0_API_CLIENT_SECRET;
  const DEFAULT_PW = process.env.DEFAULT_PW;

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
    admin: ['sendMeResetPasswordEmail']
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
    const management = new auth0ManagementClient({
      domain: tenantSettings.domainId,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    let auth0User = null;
    try {
      auth0User = await management.createUser({
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
      let users = await management.getUsersByEmail(userObject.email);
      auth0User = users[0];
      debugAuth0(`User(email: ${userObject.email}, auth0 id: ${auth0User.user_id}) already exists.`);
    }
    try {
      if (!auth0User.email_verified) {
        EndUser.sendPasswordResetEmail(userObject.email);
      }

      userObject.authId = auth0User.user_id;
      return await EndUser.upsertWithWhere({ email: userObject.email }, userObject);
    } catch (error) {
      logger.error(`Error while creating user(email: ${userObject.email}, clientId: ${userObject.clientId}) - ${error.message}`);
      throw error;
    }
  };

  EndUser.updateUser = async function(userObject) {
    const management = new auth0ManagementClient({
      domain: tenantSettings.domainId,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    let existingUser = await EndUser.findById(userObject.id);
    if (!existingUser) {
      logger.info(`EndUser(id: ${userObject.id}) does not exist.`);
      return;
    }
    if (existingUser.clientId !== userObject.clientId) {
      try {
        await management.updateAppMetadata({ id: existingUser.authId },
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
        await management.updateAppMetadata({ id: existingUser.authId },
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
    let user = await EndUser.findById(id);
    if (!user) {
      logger.info(`EndUser(id: ${id}) does not exist.`);
      return;
    }
    const management = new auth0ManagementClient({
      domain: tenantSettings.domainId,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    });
    try {
      if (user.authId) {
        await management.deleteUser({ id: user.authId });
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
   * @param {string} email
   * DEPRECATED. Use 'sendMeResetPasswordEmail'
   */
  EndUser.sendPasswordResetEmail = function(email) {
    const options = {
      method: 'POST',
      url: 'https://' + tenantSettings.domainId + '/dbconnections/change_password',
      headers: { 'content-type': 'application/json' },
      body: {
        client_id: CLIENT_ID,
        email: email,
        connection: tenantSettings.connection
      },
      json: true
    };
    request(options, function(error, response, body) {
      if (error) throw new Error(error);
      logger.info(body);
    });
  };
};
