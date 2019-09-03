'use strict';
const appRoot = require('app-root-path');
const debugMessage = require('debug')('order-manager:Message:message');
const _ = require('lodash');
const Promise = require('bluebird');
const HttpErrors = require('http-errors');
const moment = require('moment');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(Message) {
  // supported user groups.
  const USER_GROUPS = ['everyone', 'customers', 'employees', 'admin', 'manager'];

  /**
   * @param{String} user keyword
   * @returns{String[]} - array of user ids.
   */
  async function getUserIdsByKeyword(toUser) {
    toUser = toUser.toLowerCase();
    if (!USER_GROUPS.includes(toUser)) {
      return [];
    }
    let filter = {
      fields: { id: true }
    };
    switch (toUser) {
      case 'customers':
        filter['where'] = { role: 'customer' };
        break;
      case 'employees':
        filter['where'] = { role: { inq: ['admin', 'manager'] } };
        break;
      case 'admin':
        filter['where'] = { role: 'admin' };
        break;
      case 'manager':
        filter['where'] = { role: 'manager' };
        break;
      case 'everyone':
      default:
        break;
    };
    let users = await app.models.EndUser.find(filter);
    return users.map(user => user.id);
  }

  Message.observe('after save', async function(ctx) {
    Message.emitEvent(_.get(app, ['sockets', 'message']), {
      operation: 'save',
      toUserId: (ctx.instance) ? ctx.instance.toUserId : _.get(ctx, ['where', 'toUserId'])
    });
  });

  Message.observe('after delete', async function(ctx) {
    Message.emitEvent(_.get(app, ['sockets', 'message']), {
      operation: 'delete',
      toUserId: _.get(ctx, ['where', 'toUserId'])
    });
  });

  /**
   * @param {Object} metadata - must contain 'endUserId'
   * @returns {Number} unread message count.
   */
  Message.countUnread = async function(metadata) {
    if (!metadata || !metadata.endUserId) {
      throw new HttpErrors(400, 'cannot count unread message - user id is missing');
    }

    const endUser = await app.models.EndUser.findById(metadata.endUserId);
    if (!endUser) {
      throw new HttpErrors(400, `cannot count unread message - user(id: ${metadata.endUserId}) is not found.`);
    }
    try {
      return await Message.count({
        toUserId: endUser.id,
        isRead: false
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot count unread message - ${error.message}`);
    }
  };

  /**
   * @param {String[]} - array of message ID
   * @param {Object} metadata - must contain 'endUserId'.
   */
  Message.markAsRead = async function(messageIds, metadata) {
    if (!messageIds || _.isEmpty(messageIds)) {
      throw new HttpErrors(400, 'cannot mark message as read - message id is missing');
    }

    if (!metadata || !metadata.endUserId) {
      throw new HttpErrors(400, 'cannot mark message as read - user id is missing');
    }
    const endUser = await app.models.EndUser.findById(metadata.endUserId);
    if (!endUser) {
      throw new HttpErrors(400, `cannot mark message as read - user(id: ${metadata.endUserId}) is not found.`);
    }

    try {
      await Message.updateAll({
        id: { inq: messageIds },
        toUserId: endUser.id
      }, {
        isRead: true
      });
      debugMessage(`Marked ${messageIds.length} messages as read by user(id: ${endUser.id})`);
    } catch (error) {
      logger.error(`cannot mark messages as read - ${error.message}`);
    }
  };

  /**
   * @param {String} - recipient user group.
   * @param {Object} - message data
   * @param {Object} metadata - must contain 'endUserId'.
   */
  Message.createNewGroupMessage = async function(userGroup, messageData, metadata) {
    if (!messageData || _.isEmpty(messageData)) {
      throw new HttpErrors(400, 'cannot create a message - message data is missing');
    }

    if (!userGroup || !USER_GROUPS.includes(userGroup)) {
      throw new HttpErrors(400, 'cannot create a message - recipient group is missing or not supported.');
    }

    try {
      if (!messageData.fromUser) {
        if (!metadata || !metadata.endUserId) {
          throw new HttpErrors(400, 'cannot create a message - user id is missing');
        }

        const endUser = await app.models.EndUser.findById(metadata.endUserId);
        if (!endUser) {
          throw new HttpErrors(400, `cannot create message - user(id: ${metadata.endUserId}) is not found.`);
        }
        messageData.fromUser = endUser.email;
      }

      const userIds = await getUserIdsByKeyword(userGroup);
      let messages = userIds.map((id) => {
        return _.assign({}, messageData, { toUserId: id });
      });

      await Message.create(messages);
      debugMessage(`Created messages by user(${messageData.fromUser})`);
    } catch (error) {
      throw new HttpErrors(500, `cannot create a message - ${error.message}`);
    }
  };

  /**
   * @param {String[]} - array of message ID
   * @param {Object} metadata - must contain 'endUserId'.
   */
  Message.deleteMessages = async function(messageIds, metadata) {
    if (!messageIds || _.isEmpty(messageIds)) {
      throw new HttpErrors(400, 'cannot delete message - message id is missing');
    }

    if (!metadata || !metadata.endUserId) {
      throw new HttpErrors(400, 'cannot delete message - user id is missing');
    }
    const endUser = await app.models.EndUser.findById(metadata.endUserId);
    if (!endUser) {
      throw new HttpErrors(400, `cannot delete message - user(id: ${metadata.endUserId}) is not found.`);
    }

    try {
      await Message.destroyAll({
        id: { inq: messageIds },
        toUserId: endUser.id
      });
      debugMessage(`Deleted ${messageIds.length} messages by user(id: ${endUser.id})`);
      // Message.cacheUnreadCount(endUser.id, -1);    // clear unread message count.
    } catch (error) {
      throw new HttpErrors(500, `cannot delete message - ${error.message}`);
    }
  };

  /**
   * @param {Object} filter for 'Message.find()'
   * @param {Object} metadata - must contain 'endUserId'
   * @returns {Object[]} messages.
   */
  Message.getMessages = async function(metadata) {
    if (!metadata || !metadata.endUserId) {
      throw new HttpErrors(400, 'cannot get message - user id is missing');
    }
    const endUser = await app.models.EndUser.findById(metadata.endUserId);
    if (!endUser) {
      throw new HttpErrors(400, `cannot get message - user(id: ${metadata.endUserId}) is not found.`);
    }
    try {
      return await Message.find({ where: { toUserId: endUser.id } });
    } catch (error) {
      throw new HttpErrors(500, `cannot get message - ${error.message}`);
    }
  };
};
