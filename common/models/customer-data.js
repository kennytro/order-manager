'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const jwksClient = require('jwks-rsa');
const jwtNode = require('jsonwebtoken');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(CustomerData) {
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
      return await app.models[modelName].findById(id);
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
        return await app.models.EndUser.createNewUser(modelObj);
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
        return await app.models.EndUser.deleteUser(id);
      }
      return await app.models[modelName].destroyById(id);
    } catch (error) {
      logger.error(`Cannot destroy by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

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
  CustomerData.remoteMethod('resetPassword', {
    http: { path: '/resetPassword', verb: 'post' },
    accepts: [
      { arg: 'idToken', type: 'string', required: true }
    ]
  });
};
