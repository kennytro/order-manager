'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const logger = require(appRoot + '/config/winston');

let noCredential = function() {
  throw new Error('AWS S3 credentials are missing');
};

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  module.exports = {
    uploadFile: noCredential,
    deleteFile: noCredential,
    presignFileUrl: noCredential
  };
  return;    // AWS credentials are not set.
}

const S3 = new AWS.S3({ apiVersion: '2006-03-01' });
module.exports = {
  uploadFile: async function(file, option) {
    // const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const s3Params = {
      Bucket: _.get(option, 'path'),
      Key: _.get(option, 'fileName'),
      Body: file,
      ACL: _.get(option, 'ACL'),
      ContentType: _.get(option, 'fileType')
    };
    return await new Promise((resolve, reject) => {
      S3.upload(s3Params, (err, data) => {
        if (err) {
          logger.error(`Error while uploading ${_.get(option, 'fileName')}(path: ${_.get(option, 'path')}) to S3 - ${err.message}`);
          throw err;
        } else {
          resolve(data);
        }
      });
    });
  },
  deleteFile: async function(option) {
    // const S3 = new AWS.S3({ apiVersion: '2006-03-01' });
    const s3Params = {
      Bucket: _.get(option, 'path'),
      Key: _.get(option, 'fileName')
    };
    return await new Promise((resolve, reject) => {
      S3.deleteObject(s3Params, (err, data) => {
        if (err) {
          logger.error(`Error while deleting ${_.get(option, 'fileName')}(path: ${_.get(option, 'path')}) to S3 - ${err.message}`);
          throw err;
        } else {
          resolve(data);
        }
      });
    });
  },
  presignFileUrl: async function(operation, option) {
    let s3Params = {
      Bucket: _.get(option, 'path'),
      Key: _.get(option, 'fileName')
    };
    if (_.get(option, 'expires')) {
      s3Params.Expires = _.get(option, 'expires');
    }
    if (_.get(option, 'ACL')) {
      s3Params.ACL = _.get(option, 'ACL');
    }
    if (_.get(option, 'fileType')) {
      s3Params.ContentType = _.get(option, 'fileType');
    }
    return await new Promise((resolve, reject) => {
      S3.getSignedUrl(operation, s3Params, (err, url) => {
        if (err) {
          logger.error(`Error while getting seignedUrl(bucket: ${s3Params.Bucket}, key: ${s3Params.Key}) - ${err.message}`);
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }
};
