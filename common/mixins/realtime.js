'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const app = require(appRoot + '/server/server');

module.exports = function(Model, options) {
  Model.supoortRealTime = true;
  Model.socketNamespace = '/' + Model.modelName.toLowerCase();

  if (options.afterSave) {
    Model.observe('after save', function(ctx, next) {
      const namespace = Model.modelName.toLowerCase();
      let modelSocket = _.get(app, ['sockets', namespace]);
      if (modelSocket) {
        let data = {
          operation: 'save'
        };
        let filterProperty = _.get(options, ['afterSave', 'filterBy']);
        if (filterProperty) {
          data[filterProperty] = (ctx.instance) ? ctx.instance[filterProperty] : _.get(ctx, ['where', filterProperty]);
        }
        modelSocket.emit(namespace, data);
      }
      next();
    });
  }

  if (options.afterDelete) {
    Model.observe('after delete', function(ctx, next) {
      const namespace = Model.modelName.toLowerCase();
      let modelSocket = _.get(app, ['sockets', namespace]);
      if (modelSocket) {
        let data = {
          operation: 'delete'
        };
        let filterProperty = _.get(options, ['afterDelete', 'filterBy']);
        if (filterProperty) {
          data[filterProperty] = _.get(ctx, ['where', filterProperty]);
        }
        modelSocket.emit(namespace, data);
      }
      next();
    });
  }
};
