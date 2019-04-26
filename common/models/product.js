'use strict';
const appRoot = require('app-root-path');
const _ = require('lodash');
const AWS = require('aws-sdk');
const db = require(appRoot + '/common/util/database');
const logger = require(appRoot + '/config/winston');
const app = require(appRoot + '/server/server');
const fileStorage = require(appRoot + '/common/util/file-storage');
const tenantSetting = require(appRoot + '/config/tenant');

module.exports = function(Product) {
  const AWS_S3_PUBLIC_URL = 'https://s3-us-west-2.amazonaws.com/om-public/';

  // Don't allow delete by ID. Instead set 'isAvailable' property.
  Product.disableRemoteMethodByName('deleteById');
  Product.disableRemoteMethodByName('deleteAll');

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
    ctx.instance.presignedImageUrl = await fileStorage.presignFileUrl('putObject',
      {
        path: 'om-public',
        fileName: `${tenantSetting.id}/product/${ctx.instance.id}.png`,
        fileType: 'image/png',
        expires: 60,
        ACL: 'public-read'
      }
    );
    logger.debug(`Presigned URL for product(id: ${ctx.instance.id}): ${ctx.instance.presignedImageUrl}`);
  });

  /**
   * Before deleting a product, check the order is not in use.
   * If not in use, remove its image file from S3.
   */
  Product.observe('before delete', async function(ctx) {
    let productId = _.get(ctx, ['where', 'id']);
    if (productId) {
      let orderItem = await app.models.OrderItem.findOne({ where: { productId: productId } });
      if (orderItem) {
        let error = new Error('Cannot delete product in use(Tip: set "isAvailable" to false instead)');
        error.status = 409;
        throw error;
      }
      await fileStorage.deleteFile({
        path: 'om-public',
        fileName: `${tenantSetting.id}/product/${productId}.png`
      });
    }
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
