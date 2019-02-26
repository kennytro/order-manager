'use strict';
const request = require('request');
const _ = require('lodash');
const auth0ManagementClient = require('auth0').ManagementClient;
const tenantSettings = require('../../server/tenant');

module.exports = function(EndUser) {
  const CLIENT_ID = process.env.AUTH0_API_CLIENT_ID;
  const CLIENT_SECRET = process.env.AUTH0_API_CLIENT_SECRET;
  const DEFAULT_PW = process.env.DEFAULT_PW;

  /*
  ** @param {object} userObject
  ** @returns {EndUser} newUser
  */
  EndUser.createNewUser = async function(userObject) {
    if (!_.get(userObject, ['clientId']) ||
      !_.get(userObject, ['email'])) {
      throw new Error('New EndUser is missing required property.');
    }

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
          roles: ['customer']
        }
      });
    } catch (error) {
      if (error.statusCode !== 409) {
        console.error(`error while creating Auth0 user(email: ${userObject.email}, clientId: ${userObject.clientId}) - ${error.message}`);
        throw error;
      }
      let users = await management.getUsersByEmail(userObject.email);
      auth0User = users[0];
    }
    try {
      if (!auth0User.email_verified) {
        EndUser.sendPasswordResetEmail(userObject.email);
      }

      userObject.authId = auth0User.user_id;
      _.set(userObject, ['userSettings', 'roles'], ['customer']);
      return await EndUser.upsertWithWhere({ email: userObject.email }, userObject);
    } catch (error) {
      console.error(`error while creating user(email: ${userObject.email}, clientId: ${userObject.clientId}) - ${error.message}`);
      throw error;
    }
  };

  /*
  ** @param {string} id
  */

  EndUser.deleteUser = async function(id) {
    let user = await EndUser.findById(id);
    if (!user) {
      console.log(`EndUser(id: ${id}) does not exist.`);
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
        console.log(`successfully deleted user(id: ${id}, auth0Id: ${user.authId}`);
      }
      await EndUser.destroyById(id);
    } catch (error) {
      console.error(`error while deleting user(id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  /**
   * @param {string} email
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
      console.log(body);
    });
  };
};
