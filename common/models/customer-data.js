'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const jwksClient = require('jwks-rsa');
const jwtNode = require('jsonwebtoken');
const objectHash = require('object-hash');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(CustomerData) {
  const APP_METADATA_KEY = 'https://om.com/app_metadata';
  const CLIENT_MODELS = ['Order', 'Statement', 'EndUser', 'Client'];
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
   * Check if user has a role and verify if user can execute given method.
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
      if ((modelName === 'EndUser' || modelName === 'Client')) {
        // EndUser and Client requires additional access checking
        if (!_.includes(app.models[modelName].allowedMethods(role), methodName)) {
          throwAuthError();
        }
      }
      return decoded;
    } catch (error) {
      logger.error(`Error while verifying idToken(model: ${modelName}${methodName ? ', method: ' + methodName : ''}) - ${error.message}`);
      throw error;
    }
  }

  CustomerData.genericFind = async function(modelName, filter, accessToken) {
    try {
      let decoded = await verifyIdToken(accessToken, modelName);
      if (!filter) {
        filter = {};
      }
      if (_.includes(CLIENT_MODELS, modelName)) {
        // limit scope to the user's client
        _.set(filter, ['where', 'clientId'], _.get(decoded, [APP_METADATA_KEY, 'clientId']));
      }

      return await app.models[modelName].find(filter);
    } catch (error) {
      logger.error(`Cannot find ${modelName} - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericFindById = async function(modelName, id, filter, accessToken) {
    try {
      let decoded = await verifyIdToken(accessToken, modelName);
      if (!filter) {
        filter = {};
      }
      if (_.includes(CLIENT_MODELS, modelName)) {
        // limit scope to the user's client
        _.set(filter, ['where', 'clientId'], _.get(decoded, [APP_METADATA_KEY, 'clientId']));
      }
      return await app.models[modelName].findById(id, filter);
    } catch (error) {
      logger.error(`Cannot find by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericUpsert = async function(modelName, modelObj, accessToken) {
    try {
      await verifyIdToken(accessToken, modelName);
      return await app.models[modelName].upsert(modelObj);
    } catch (error) {
      logger.error(`Cannot upsert ${modelName} - ${error.message}`);
      throw error;
    }
  };

  CustomerData.genericDestroyById = async function(modelName, id, accessToken) {
    let error = new Error('Method \'destroyById\' is disabled in customer module.');
    error.status = 405;  // Method Not Allowed
    throw error;
  };

  CustomerData.genericMethod = async function(modelName, methodName, params, accessToken) {
    try {
      let decoded = await verifyIdToken(accessToken, modelName, methodName);
      if ((modelName === 'EndUser' || modelName === 'Client')) {
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
      let endUser = await app.memoryCache.wrap(objectHash({
        model: 'EndUser',
        method: 'findOne',
        params: { where: { authId: decoded.sub } }
      }), async () => {
        logger.debug(`Finding end user(authId: ${decoded.sub})`);
        return await app.models.EndUser.findOne({ where: { authId: decoded.sub } });
      }, { ttl: 300 /* seconds. user is unlikely deleted. */ });
      if (endUser) {
        metadata.endUserId = endUser.id;
        params = [].concat(params || [], metadata);
      }
      return await app.models[modelName][methodName].apply(app.models[modelName], params);
    } catch (error) {
      logger.error(`Cannot execute ${modelName}.${methodName}(${JSON.stringify(params)}) - ${error.message}`);
      throw error;
    }
  };

  /**
   * @param {Object} - loopback context object.
   * @returns {String} - extracted access token without 'Bearer '
   */
  function extractAccessToken(ctx) {
    const bearerStr = 'Bearer ';
    let accessToken = ctx.req.header('authorization');
    if (accessToken && accessToken.startsWith(bearerStr)) {
      accessToken = accessToken.slice(bearerStr.length);
    }
    // console.log(`accessToken = ${accessToken}`);
    return accessToken;
  }

  CustomerData.remoteMethod('genericFind', {
    http: { path: '/find', verb: 'get' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'filter', type: 'object' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'array', root: true }
  });
  CustomerData.remoteMethod('genericFindById', {
    http: { path: '/findById/:id', verb: 'get' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true },
      { arg: 'filter', type: 'object' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'object', root: true }
  });
  CustomerData.remoteMethod('genericUpsert', {
    http: { path: '/upsert', verb: 'put' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'modelObj', type: 'object', required: true },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'object', root: true }
  });
  CustomerData.remoteMethod('genericDestroyById', {
    http: { path: '/delete/:id', verb: 'delete' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ]
  });
  CustomerData.remoteMethod('genericMethod', {
    http: { path: '/method', verb: 'post' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'methodName', type: 'string', required: true },
      { arg: 'params', type: 'array', default: '[]' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'object', root: true }
  });
};
