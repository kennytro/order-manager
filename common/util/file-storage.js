'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const logger = require(appRoot + '/config/winston');

module.exports = {
  uploadFile: async function(file, option) {
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const s3Params = {
      Bucket: _.get(option, 'path'),
      Key: _.get(option, 'fileName'),
      Body: file,
      ACL: _.get(option, 'ACL'),
      ContentType: 'application/' + _.get(option, 'fileType')
    };
    try {
      return await s3.upload(s3Params).promise();
    } catch (err) {
      logger.error(`Error while uploading ${_.get(option, 'fileName')}(path: ${_.get(option, 'path')}) to S3 - ${err.message}`);
      throw err;
    }
  },
  deleteFile: async function(option) {
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const s3Params = {
      Bucket: _.get(option, 'path'),
      Key: _.get(option, 'fileName')
    };
    try {
      return await s3.deleteObject(s3Params).promise();
    } catch (err) {
      logger.error(`Error while deleting ${_.get(option, 'fileName')}(path: ${_.get(option, 'path')}) to S3 - ${err.message}`);
      throw err;
    }
  }
};
