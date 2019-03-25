'use strict';
const _ = require('lodash');

module.exports = function(Model, options) {
  if (options.beforeSave) {
    Model.observe('before save', function(context, next) {
      let instance = context.instance ? context.instance : context.data;
      if (instance) {
        instance.updatedAt = new Date();
      }
      next();
    });
  }
};
