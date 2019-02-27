'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(EmployeeData) {
  EmployeeData.genericFind = async function(idToken, modelName, filter) {
    if (!idToken) {
      // TO DO: parse idToken and check user role is either manager or admin
      // if modelName is 'EndUser', only 'admin' is allowed to call.
      logger.info('EmployeeData.genericFind() needs to parse idToken');
      // throwAuthError();
    }
    try {
      return await app.models[modelName].find(filter || {});
    } catch (error) {
      logger.error(`Cannot find ${modelName} - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericFindById = async function(idToken, modelName, id, filter) {
    if (!idToken) {
      // TO DO: parse idToken and check user role is either manager or admin
      // if modelName is 'EndUser', only 'admin' is allowed to call.
      logger.info('EmployeeData.genericFindById() needs to parse idToken');
      // throwAuthError();
    }
    try {
      return await app.models[modelName].findById(id);
    } catch (error) {
      logger.error(`Cannot find by id (model: ${modelName}, id: ${id}) - ${error.message}`);
      throw error;
    }
  };

  EmployeeData.genericUpsert = async function(idToken, modelName, modelObj) {
    if (!idToken) {
      // TO DO: parse idToken and check user role is either manager or admin
      // if modelName is 'EndUser', only 'admin' is allowed to call.
      logger.info('EmployeeData.genericUpsert() needs to parse idToken');
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

  EmployeeData.genericDestroyById = async function(idToken, modelName, id) {
    if (!idToken) {
      // TO DO: parse idToken and check user role is either manager or admin
      // if modelName is 'EndUser', only 'admin' is allowed to call.
      logger.info('EmployeeData.genericDestroyById() needs to parse idToken');
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

  function throwAuthError() {
    let error = new Error('User not authenticated');
    error.status = 403;
    throw error;
  }

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
};
