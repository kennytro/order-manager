'use strict';
/*
 * node create_user.js user-id
 *
 * Create new IAM role with given name
*/
const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const logger = require(appRoot + '/config/winston');

if (process.argv.length !== 3) {
  logger.error('Usage: node create-user.js user-name');
  process.exit(1);
}

(async () => {
  const GROUP_NAME = 'Order-Manager-App-Server';
  const userName = process.argv[2];
  const iam = new AWS.IAM({ apiVersion: '2010-05-08' });
  let group, user;
  try {
    group = await getGroup(iam, GROUP_NAME);
    if (!group) {
      logger.error(`${GROUP_NAME} group does not exist. You must create it first.`);
      return -1;
    }
  } catch (error) {
    logger.error(`can't find group ${GROUP_NAME} - ${error.message}`);
    return -1;
  }

  try {
    user = await addUser(iam, userName);
  } catch (error) {
    logger.error(`can't add user '${userName}' - ${error.message}`);
    return -1;
  }

  // finally add user to group
  try {
    await addUserToGroup(iam, user, group);
  } catch (error) {
    logger.error(`can't add user '${userName}' to group '${GROUP_NAME}' - ${error.message}`);
    return -1;
  }
  logger.info('Done');
  return 0;
})();

/**
 * @param {Object} - IAM instance
 * @param {String} - user name
 * @returns {Object} - a structure containing about the IAM user. Null if no such user exists.
 */
async function getUser(iam, userName) {
  return await new Promise((resolve, reject) => {
    let params = { UserName: userName };
    logger.debug(`Getting user '${userName}'...`);
    iam.getUser(params, function(err, data) {
      if (err) {
        if (err.code === 'NoSuchEntity') {
          resolve(null);      // such user does not exist.
        } else {
          reject(err);
        }
      } else {
        resolve(data.User);
      }
    });
  });
}

/**
 * @param {Object} - IAM instance
 * @param {String} - user name
 * @returns {Object} - a structure containing about the IAM user.
 */
async function addUser(iam, userName) {
  // check if user already exists.
  try {
    let user = await getUser(iam, userName);
    if (user) {
      logger.debug(`User '${userName}' already exists.`);
      return user;
    }
  } catch (error) {
    logger.error(`can't find user '${userName}' - ${JSON.stringify(error)}`);
    throw (error);
  }

  return await new Promise((resolve, reject) => {
    let params = {
      UserName: userName,
      Tags: [
        {
          Key: 'Project',
          Value: 'Order manager'
        },
        {
          Key: 'Type',
          Value: 'Back end server'
        }
      ]
    };
    logger.debug(`Creating user '${userName}'...`);
    iam.createUser(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        logger.debug(`Created user '${userName}' (id: ${data.User.UserId})`);
        resolve(data.User);
      }
    });
  });
}

/**
 * @param {Object} - IAM instance
 * @param {String} - group name
 * @returns {Object} - a structure containing about the IAM group. Null if no such user exists.
 */
async function getGroup(iam, groupName) {
  return await new Promise((resolve, reject) => {
    let params = { GroupName: groupName };
    logger.debug(`Getting group '${groupName}'...`);
    iam.getGroup(params, function(err, data) {
      if (err) {
        if (err.code === 'NoSuchEntity') {
          resolve(null);      // such group does not exist.
        } else {
          reject(err);
        }
      } else {
        resolve(data.Group);
      }
    });
  });
}

/**
 * @param {Object} - IAM instance
 * @param {Object} - IAM user
 * @param {Object} - IAM group
 * @returns {Object} - response from AWS API.
 */
async function addUserToGroup(iam, user, group) {
  return await new Promise((resolve, reject) => {
    let params = {
      GroupName: group.GroupName,
      UserName: user.UserName
    };
    logger.debug(`Adding user ${user.UserName} to group '${group.GroupName}'...`);
    iam.addUserToGroup(params, function(err, data) {
      if (err) {
        reject(err);
      } else {
        logger.debug(`Added user ${user.UserName} to group '${group.GroupName}'`);
        resolve(data);
      }
    });
  });
}
