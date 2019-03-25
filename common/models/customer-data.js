'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const jwksClient = require('jwks-rsa');
const jwtNode = require('jsonwebtoken');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(CustomerData) {
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

  CustomerData.genericFind = async function(idToken, modelName, filter) {
    if (!idToken) {
      // TO DO: parse idToken to obtain user's client id. Ensure user only accesses
      // data of matching client id
      logger.info('CustomerData.genericFind() needs to parse idToken');
      // throwAuthError();
    }
    try {
      return await app.models[modelName].find(filter || {});
    } catch (error) {
      logger.error(`Cannot find ${modelName} - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericFindById = async function(idToken, modelName, id, filter) {
    if (!idToken) {
      // TO DO: parse idToken to obtain user's client id. Ensure user only accesses
      // data of matching client id
      logger.info('CustomerData.genericFindById() needs to parse idToken');
      // throwAuthError();
    }
    try {
      return await app.models[modelName].findById(id, filter);
    } catch (error) {
      logger.error(`Cannot find by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericUpsert = async function(idToken, modelName, modelObj) {
    if (!idToken) {
      // TO DO: parse idToken to obtain user's client id. Ensure user only accesses
      // data of matching client id
      logger.info('CustomerData.genericUpsert() needs to parse idToken');
      // throwAuthError();
    }
    try {
      if (modelName === 'EndUser' && _.isUndefined(modelObj.id)) {
        throwAuthError();
      }
      return await app.models[modelName].upsert(modelObj);
    } catch (error) {
      logger.error(`Cannot upsert ${modelName} - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericDestroyById = async function(idToken, modelName, id) {
    if (!idToken) {
      // TO DO: parse idToken to obtain user's client id. Ensure user only accesses
      // data of matching client id
      logger.info('CustomerData.genericDestroyById() needs to parse idToken');
      // throwAuthError();
    }
    try {
      if (modelName === 'EndUser') {
        throwAuthError();
      }
      return await app.models[modelName].destroyById(id);
    } catch (error) {
      logger.error(`Cannot destroy by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericMethod = async function(idToken, modelName, methodName, params) {
    try {
      let decoded = await decodeIdToken(idToken);
      const role = app.models.EndUser.getHighestRole(_.get(decoded, [APP_METADATA_KEY, 'roles'], []));
      if ((modelName === 'EndUser' || modelName === 'Client')) {
        // EndUser and Client requires additional access checking
        if (!_.includes(app.models[modelName].allowedMethods(role), methodName)) {
          throwAuthError();
        }
        // EndUser methods must have 'authId' as the first argument.
        if (modelName === 'EndUser' && decoded.sub !== _.get(params, '0')) {
          throwAuthError();
        }
        // Client method must have 'clientId' as the first argument.
        if (modelName === 'Client' && _.get(decoded, [APP_METADATA_KEY, 'clientId']) !== _.get(params, '0')) {
          throwAuthError();
        }
      }

      let metadata = {};
      let endUser = await app.models.EndUser.findOne({ where: { authId: decoded.sub } });
      if (endUser) {
        logger.debug(`EndUser id: ${endUser.id}`);
        metadata.endUserId = endUser.id;
        params = [].concat(params || [], metadata);
      }
      return await app.models[modelName][methodName].apply(app.models[modelName], params);
    } catch (error) {
      logger.error(`Cannot execute ${modelName}.${methodName}(${JSON.stringify(params)}) - ${error.message}`);
      throw error;
    }
  };

  // TO DO: replace this function with genericMethod.
  CustomerData.resetPassword = async function(idToken) {
    try {
      let decoded = await decodeIdToken(idToken);
      let endUser = await app.models.EndUser.findOne({ where: { authId: decoded.sub } });
      if (endUser) {
        await app.models.EndUser.sendPasswordResetEmail(endUser.email);
      }
    } catch (error) {
      logger.error(`Cannot reset user password - ${error.message}`);
      throw error;
    }
  };

  function throwAuthError() {
    let error = new Error('User not authenticated');
    error.status = 403;
    throw error;
  }

  CustomerData.remoteMethod('genericFind', {
    http: { path: '/find', verb: 'get' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'filter', type: 'object' }
    ],
    returns: { type: 'array', root: true }
  });
  CustomerData.remoteMethod('genericFindById', {
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
  CustomerData.remoteMethod('genericUpsert', {
    http: { path: '/upsert', verb: 'put' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'modelObj', type: 'object', required: true }
    ],
    returns: { type: 'object', root: true }
  });
  CustomerData.remoteMethod('genericDestroyById', {
    http: { path: '/delete/:id', verb: 'delete' },
    accepts: [
      // { arg: 'req', type: 'object', http: { source: 'req' } },
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true }
    ]
  });
  CustomerData.remoteMethod('genericMethod', {
    http: { path: '/method', verb: 'post' },
    accepts: [
      { arg: 'idToken', type: 'string', required: true },
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'methodName', type: 'string', required: true },
      { arg: 'params', type: 'array', default: '[]' }
    ],
    returns: { type: 'object', root: true }
  });
  CustomerData.remoteMethod('resetPassword', {
    http: { path: '/resetPassword', verb: 'post' },
    accepts: [
      { arg: 'idToken', type: 'string', required: true }
    ]
  });
};
