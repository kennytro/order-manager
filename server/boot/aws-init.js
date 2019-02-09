'use strict';
const _ = require('lodash');
const AWS = require('aws-sdk');
const tenantSetting = require('../tenant');

/* AWS S3 is used as file repository. There are two buckets pre-created:
*  1. om-public - stores public files such as images in public web page.
*  2. om-private - stores private files such as statements.
* Inside each bucket, there are folders for each tenant.
*
* Tenant ID is AWS IAM user name(e.g. om-app-dev) and set via TENANT_ID environment variable.
*
* Tenant folders in public bucket are really for organizatin purpose. But tenant folders in
* private bucket restrict access only to specific tenant. For example, "om-app-dev" tenant
* can only access files in "om-private/om-app-dev/" folder. The restriction is controlled by
* a policy assigned to "Order-Manager-App-Server" group.
*
* During boot up time, we create a tenant folder in each bucket if not exist already.
*/
module.exports = async function(app) {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const publicBucket = 'om-public';
  const privateBucket = 'om-private';
  const tenantFolder = tenantSetting.id + '/';

  // Two buckets must be created before this app runs, thus we don't need to create them.

  // /* Returns true if 'bucket' exists. If not(i.e. 404 error), returns false.
  //  */
  // const checkBucket = async (s3, bucket) => {
  //   const params = {
  //     Bucket: bucket
  //   };
  //   try {
  //     await s3.headBucket(params).promise();
  //     return true;
  //   } catch (error) {
  //     if (error.statusCode === 404) {
  //       return false;
  //     }
  //     throw error;
  //   }
  // };

  // const createBucket = async (s3, bucket, acl) => {
  //   const params = {
  //     Bucket: bucket,
  //     ACL: acl || 'private'
  //   };
  //   try {
  //     console.log(`Creating bucket '${bucket}' in AWS S3...`);
  //     await s3.createBucket(params).promise();
  //     console.log(`  Successfully created bucket '${bucket}'`);
  //   } catch (error) {
  //     console.error(`  Failed to create bucket '${bucket}' - ${error.message}`);
  //     throw error;
  //   }
  // };

  const checkFolder = async (s3, bucket, key) => {
    const params = {
      Bucket: bucket,
      Key: key
    };
    try {
      await s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  };

  const createFolder = async (s3, bucket, key, acl) => {
    const params = {
      Bucket: bucket,
      Key: key,
      ACL: acl
    };
    try {
      console.log(`Creating folder '${bucket}/${key}' in AWS S3...`);
      await s3.putObject(params).promise();
      console.log(`  Successfully created folder '${bucket}/${key}'`);
    } catch (error) {
      console.error(`  Failed to create folder '${bucket}/${key}' - ${error.message}`);
      throw error;
    }
  };

  if (!accessKey || !secretKey) {
    console.log('AWS keys are not set - skipping AWS initialization.');
    return;
  }

  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  // if (await checkBucket(s3, publicBucket)) {
  //   console.log(`Bucket[${publicBucket}] already exists.`);
  // } else {
  //   await createBucket(s3, publicBucket, 'public-read');
  // }

  if (await checkFolder(s3, publicBucket, tenantFolder)) {
    console.log(`Folder[${publicBucket}/${tenantFolder}] already exists.`);
  } else {
    await createFolder(s3, publicBucket, tenantFolder, 'public-read');
  }

  // if (await checkBucket(s3, privateBucket)) {
  //   console.log(`Bucket[${privateBucket}] already exists.`);
  // } else {
  //   await createBucket(s3, privateBucket, 'private');
  // }

  if (await checkFolder(s3, privateBucket, tenantFolder)) {
    console.log(`Folder[${privateBucket}/${tenantFolder}] already exists.`);
  } else {
    await createFolder(s3, privateBucket, tenantFolder, 'private');
  }
};
