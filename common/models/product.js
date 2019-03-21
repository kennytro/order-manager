'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const AWS = require('aws-sdk');
const db = require(appRoot + '/common/util/database');
const logger = require(appRoot + '/config/winston');
const tenantSetting = require(appRoot + '/config/tenant');
const app = require(appRoot + '/server/server');

module.exports = function(Product) {
  const AWS_S3_PUBLIC_URL = 'https://s3-us-west-2.amazonaws.com/om-public/';

  /* Before saving a new product, we assign id because it is part of
   * image URL.
   */
  Product.observe('before save', async function(ctx) {
    if (ctx.instance) {
      // full save of a single model
      if (!ctx.instance.id) {
        // For new instance, assign product ID which is part of imageUrl.
        const queryCmd = 'SELECT nextval(\'product_id_seq\')';
        let pool = db.getPool('OrderManager', process.env.DATABASE_URL);
        try {
          const client = await pool.connect();
          try {
            let result = await client.query(queryCmd);
            ctx.instance.id = _.get(result, ['rows', '0', 'nextval']);
            logger.debug(`New product ID = ${ctx.instance.id}`);
          } finally {
            client.release();
          }
        } catch (err) {
          logger.error(`Cannot execute query(${queryCmd}) - ${err.message}`);
          throw err;
        }
      }
      if (_.get(ctx.instance, ['settings', 'hasImage'])) {
        _.set(ctx.instance, ['settings', 'imageUrl'], AWS_S3_PUBLIC_URL + tenantSetting.id + '/product/' + ctx.instance.id + '.png');
        logger.debug(`New image URL = ${ctx.instance.settings.imageUrl}`);
      }
      return;
    }
    // partial update of possibly multiple models
    if (ctx.currentInstance) {
      if (_.get(ctx.data, ['settings', 'hasImage'])) {
        _.set(ctx.data, ['settings', 'imageUrl'], AWS_S3_PUBLIC_URL + tenantSetting.id + '/product/' + ctx.currentInstance.id + '.png');
        logger.debug(`New image URL = ${ctx.data.settings.imageUrl}`);
      }
    }
  });

  /* After saving an instance, we presign imageUrl for front-end to upload
   * image to AWS S3.
   */
  Product.observe('after save', async function(ctx) {
    if (!ctx.instance || !_.get(ctx, ['instance', 'settings', 'imageUrl'])) {
      return;    // partial update assumes image is excluded.
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return;    // AWS credentials are not set.
    }
    const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
    ctx.instance.presignedImageUrl = s3.getSignedUrl('putObject',
      {
        Bucket: 'om-public',
        Key: tenantSetting.id + '/product/' + ctx.instance.id + '.png',
        Expires: 60,
        ACL: 'public-read',
        ContentType: 'image/png'
      }
    );
    logger.debug(`Presigned URL for product(id: ${ctx.instance.id}): ${ctx.instance.presignedImageUrl}`);
  });

  /* Before deleting a product, remove its image file from S3.
   */
  Product.observe('before delete', function(ctx, next) {
    let productId = _.get(ctx, ['where', 'id']);
    if (productId) {
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
      s3.deleteObject({
        Bucket: 'om-public',
        Key: tenantSetting.id + '/product/' + productId + '.png'
      }, function(err, data) {
        if (err) {
          logger.error(`Failed to delete imange of product(id: ${productId}) from S3 - ${err.message}`);
        } else {
          logger.debug(`Successfully deleted image of product(id: ${productId}) from S3 - ${data}`);
        }
      });
    }
    next();
  });

  /*
   * @param {string} Auth0 user id
   * @returns {Product[]} - Array of product excluding end user's exclusion list.
   */
  Product.getMyProducts = async function(authId) {
    let endUser = await app.models.EndUser.getMyUser(authId);
    let filter = {};
    if (endUser && _.get(endUser, ['userSettings', 'productExcluded'])) {
      filter.where = {
        id: { nin: _.get(endUser, ['userSettings', 'productExcluded']) }
      };
    }
    return await app.models.Product.find(filter);
  };
};
