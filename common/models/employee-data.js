'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const jwksClient = require('jwks-rsa');
const jwtNode = require('jsonwebtoken');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(EmployeeData) {
  const APP_METADATA_KEY = 'https://om.com/app_metadata';
  const client = jwksClient({
    cache: true,
    rateLimit: true,
    jwksUri: `https://${process.env.AUTH0_DOMAIN_ID}/.well-known/jwks.json`
  });

  function getKey(header, callback) {
    client.getSigningKey(header.kid, function(err, key) {
      if (err) {
        callback(err);
      } else {
        let signingKey = key.publicKey || key.rasPublicKey;
        callback(null, signingKey);
      }
    });
  }

  async function decodeIdToken(idToken) {
    try {
      return await new Promise((resolve, reject) => {
        jwtNode.verify(idToken, getKey, { algorithms: ['RS256'] }, function(err, decoded) {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
    } catch (error) {
      logger.error(`Failed to verify idToken - ${error.message}`);
      throwAuthError();
    }
  }

  function throwAuthError() {
    let error = new Error('User not authenticated');
    error.status = 403;
    throw error;
  }

  /**
   * Decode given JWT Id token and verify the user role.
   *
   * User must have an employee role('manager' and/or 'admin') in order to
   * request employee data methods.
   *
   * 'admin' role have full privilege but 'manager' role has restriction
   * 'EndUser' model.
   *
   * @param {string} idToken -    JWT Id token
   * @param {string} modelName
   * @param {string} [methodName]
   * @returns {Object}            Decoded id token
   */
  async function verifyIdToken(idToken, modelName, methodName) {
    try {
      let decoded = await decodeIdToken(idToken);
      const role = app.models.EndUser.getHighestRole(_.get(decoded, [APP_METADATA_KEY, 'roles'], []));
      if (!_.includes(['manager', 'admin'], role)) {
        throwAuthError();
      }
      if (role === 'manager') {
        if (modelName === 'EndUser' && !_.includes(app.models.EndUser.allowedMethods(role), methodName)) {
          throwAuthError();
        }
      }
      return decoded;
    } catch (error) {
      logger.error(`Error while verifying idToken - ${error.message}`);
      throw error;
    }
  }

  EmployeeData.genericFind = async function(idToken, modelName, filter) {
    try {
      await verifyIdToken(idToken, modelName);
      return await app.models[modelName].find(filter || {});
    } catch (error) {
      logger.error(`Cannot find ${modelName} - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericFindById = async function(idToken, modelName, id, filter) {
    try {
      await verifyIdToken(idToken, modelName);
      return await app.models[modelName].findById(id, filter);
    } catch (error) {
      logger.error(`Cannot find by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericUpsert = async function(idToken, modelName, modelObj) {
    try {
      await verifyIdToken(idToken, modelName);
      if (modelName === 'EndUser' && _.isUndefined(modelObj.id)) {
        return await app.models.EndUser.createNewUser(modelObj);
      }
      return await app.models[modelName].upsert(modelObj);
    } catch (error) {
      logger.error(`Cannot upsert ${modelName} - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericDestroyById = async function(idToken, modelName, id) {
    try {
      await verifyIdToken(idToken, modelName);
      if (modelName === 'Order') {
        let error = new Error('You cannot delete Order instance.(Tip: you can cancel order instead');
        error.status = 405;  // Method Not Allowed
        throw error;
      }
      if (modelName === 'EndUser') {
        return await app.models.EndUser.deleteUser(id);
      }
      return await app.models[modelName].destroyById(id);
    } catch (error) {
      logger.error(`Cannot destroy by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericMethod = async function(idToken, modelName, methodName, params) {
    try {
      // let decoded = await decodeIdToken(idToken);
      // const role = app.models.EndUser.getHighestRole(_.get(decoded, [APP_METADATA_KEY, 'roles'], []));
      // if (!_.includes(['manager', 'admin'], role)) {
      //   throwAuthError();
      // }
      // if (role === 'manager') {
      //   if (modelName === 'EndUser' && !_.includes(app.models.EndUser.allowedMethods(role), methodName)) {
      //     throwAuthError();
      //   }
      // }
      let decoded = await verifyIdToken(idToken, modelName, methodName);
      let metadata = {};
      let endUser = await app.models.EndUser.findOne({ where: { authId: decoded.sub } });
      if (endUser) {
        logger.debug(`EndUser id: ${endUser.id}`);
        metadata.endUserId = endUser.id;
        params = [].concat(params || [], metadata);
      } else {
        logger.warn(`Could not find end user whose authId is '${decoded.sub}'`);
      }

      return await app.models[modelName][methodName].apply(app.models[modelName], params);
    } catch (error) {
      logger.error(`Cannot execute ${modelName}.${methodName}(${JSON.stringify(params)}) - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.resetPassword = async function(idToken) {
    try {
      // let decoded = await decodeIdToken(idToken);
      let decoded = await verifyIdToken(idToken, 'EndUser', 'sendPasswordResetEmail');
      let endUser = await app.models.EndUser.findOne({ where: { authId: decoded.sub } });
      if (endUser) {
        await app.models.EndUser.sendPasswordResetEmail(endUser.email);
      }
    } catch (error) {
      logger.error(`Cannot reset user password - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.remoteMethod('genericFind', {
    http: { path: '/find', verb: 'get' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'filter', type: 'object' }
    ],
    returns: { type: 'array', root: true }
  });
  EmployeeData.remoteMethod('genericFindById', {
    http: { path: '/findById/:id', verb: 'get' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true },
      { arg: 'filter', type: 'object' }
    ],
    returns: { type: 'object', root: true }
  });
  EmployeeData.remoteMethod('genericUpsert', {
    http: { path: '/upsert', verb: 'put' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'modelObj', type: 'object', required: true }
    ],
    returns: { type: 'object', root: true }
  });
  EmployeeData.remoteMethod('genericDestroyById', {
    http: { path: '/delete/:id', verb: 'delete' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true }
    ]
  });
  EmployeeData.remoteMethod('genericMethod', {
    http: { path: '/method', verb: 'post' },
    accepts: [
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'methodName', type: 'string', required: true },
      { arg: 'params', type: 'array', default: '[]' }
    ],
    returns: { type: 'object', root: true }
  });
  EmployeeData.remoteMethod('resetPassword', {
    http: { path: '/resetPassword', verb: 'post' },
    accepts: [
      { arg: 'idToken', type: 'string', required: true }
    ]
  });
};
