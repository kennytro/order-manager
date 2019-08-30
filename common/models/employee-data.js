'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const jwksClient = require('jwks-rsa');
const jwtNode = require('jsonwebtoken');
const objectHash = require('object-hash');
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

  EmployeeData.genericFind = async function(modelName, filter, accessToken) {
    try {
      await verifyIdToken(accessToken, modelName);
      return await app.models[modelName].find(filter || {});
    } catch (error) {
      logger.error(`Cannot find ${modelName} - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericFindById = async function(modelName, id, filter, accessToken) {
    try {
      await verifyIdToken(accessToken, modelName);
      return await app.models[modelName].findById(id, filter);
    } catch (error) {
      logger.error(`Cannot find by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericUpsert = async function(modelName, modelObj, accessToken) {
    try {
      await verifyIdToken(accessToken, modelName);
      if (modelName === 'EndUser' && _.isUndefined(modelObj.id)) {
        return await app.models.EndUser.createNewUser(modelObj);
      }
      return await app.models[modelName].upsert(modelObj);
    } catch (error) {
      logger.error(`Cannot upsert ${modelName} - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericDestroyById = async function(modelName, id, accessToken) {
    try {
      await verifyIdToken(accessToken, modelName);
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

  EmployeeData.genericMethod = async function(modelName, methodName, params, accessToken) {
    try {
      let decoded = await verifyIdToken(accessToken, modelName, methodName);
      // let decoded = await verifyIdToken(idToken, modelName, methodName);
      let metadata = {};
      let endUser = await app.memoryCache.wrap(objectHash({
        model: 'EndUser',
        method: 'findOne',
        params: { where: { authId: decoded.sub } }
      }), async () => {
        logger.debug(`Finding end user(authId: ${decoded.sub})`);
        return await app.models.EndUser.findOne({ where: { authId: decoded.sub } });
      }, { ttl: 3600 /* seconds. employee user is unlikely deleted. */ });
      if (endUser) {
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

  EmployeeData.genericGetFile = async function(modelName, methodName, params, accessToken, res) {
    try {
      await verifyIdToken(accessToken, modelName, methodName);
      let newParams = [].concat(params || []);
      let fileInfo = await app.models[modelName][methodName].apply(app.models[modelName], newParams);
      await new Promise((resolve, reject) => {
        res.setHeader('Content-Type', fileInfo.contentType);
        fileInfo.document
          .on('end', resolve)
          .on('error', reject);
        fileInfo.document.pipe(res);
      });
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

  EmployeeData.remoteMethod('genericFind', {
    http: { path: '/find', verb: 'get' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'filter', type: 'object' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'array', root: true }
  });
  EmployeeData.remoteMethod('genericFindById', {
    http: { path: '/findById/:id', verb: 'get' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true },
      { arg: 'filter', type: 'object' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'object', root: true }
  });
  EmployeeData.remoteMethod('genericUpsert', {
    http: { path: '/upsert', verb: 'put' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'modelObj', type: 'object', required: true },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'object', root: true }
  });
  EmployeeData.remoteMethod('genericDestroyById', {
    http: { path: '/delete/:id', verb: 'delete' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'id', type: 'string', required: true },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ]
  });
  EmployeeData.remoteMethod('genericMethod', {
    http: { path: '/method', verb: 'post' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'methodName', type: 'string', required: true },
      { arg: 'params', type: 'array', default: '[]' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken }
    ],
    returns: { type: 'object', root: true }
  });
  EmployeeData.remoteMethod('genericGetFile', {
    http: { path: '/file', verb: 'get' },
    accepts: [
      { arg: 'modelName', type: 'string', required: true },
      { arg: 'methodName', type: 'string', required: true },
      { arg: 'params', type: 'array', default: '[]' },
      { arg: 'accessToken', type: 'string', 'http': extractAccessToken },
      { arg: 'res', type: 'object', 'http': { source: 'res' } }
    ]
  });
};
