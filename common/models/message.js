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
  /**
   * @param {Object} endUser - EndUser instance
   * @returns {String[]} recipients = list of applicable role/id for messages.
   */
  function getRecipients(endUser) {
    if (!endUser) {
      return [];
    }
    let recipients = ['everyone'];
    if (endUser.role === 'customer') {
      recipients.push('customers');
    }
    if (_.includes(app.models.EndUser.employeeRoles(), endUser.role)) {
      recipients.push('employees');
    }
    return recipients.concat([endUser.role, endUser.id]);
  }

  /* Override 'destroyById()' on Message to update all MessageRead
   * that references message that is about to be deleted.
   */
  Message.on('dataSourceAttached', function(obj) {
    Message.destroyById = async function(id, callback) {
      callback = callback || function() { };
      try {
        await app.dataSources.OrderManager.transaction(async models => {
          const { Message, MessageRead } = models;
          let target = await Message.findById(id);
          if (target) {
            await MessageRead.destroyAll({ messageId: id });
            await target.destroy();
          }
        });
      } catch (error) {
        callback(error);
      }
    };
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
    let recipients = getRecipients(endUser); // ['everyone', endUser.id, endUser.role];
    try {
      let messages = await Message.find({
        where: { toUser: { inq: recipients } },
        fields: { id: true, toUser: true },
        include: { relation: 'messageRead', scope: { where: { endUserId: endUser.id } } }
      });
      return _.reduce(messages, (sum, message) => {
        if (_.isEmpty(message.toJSON().messageRead)) {
          sum++;
        }
        return sum;
      }, 0);
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

    await Promise.map(messageIds, async (messageId) => {
      try {
        let message = await Message.findById(messageId);
        if (message) {
          let messageRead = await app.models.MessageRead.findOne({
            where: {
              endUserId: endUser.id,
              messageId: messageId
            }
          });
          let now = moment().toDate();
          if (messageRead) {
            await messageRead.updateAttribute('lastRead', now);
          } else {
            await app.models.MessageRead.create({
              endUserId: endUser.id,
              messageId: messageId,
              lastRead: now
            });
          }
          debugMessage(`Marked message(id: ${messageId}) as read by user(id: ${endUser.id})`);
        }
      } catch (error) {
        logger.error(`cannot mark message(id: ${messageId}) as read - ${error.message}`);
      }
    });
  };

  Message.createNewMessage = async function(messageData, metadata) {
    if (!messageData || _.isEmpty(messageData)) {
      throw new HttpErrors(400, 'cannot create a message - message data is missing');
    }

    if (!metadata || !metadata.endUserId) {
      throw new HttpErrors(400, 'cannot create a message - user id is missing');
    }

    const endUser = await app.models.EndUser.findById(metadata.endUserId);
    if (!endUser) {
      throw new HttpErrors(400, `cannot delete message - user(id: ${metadata.endUserId}) is not found.`);
    }
    try {
      messageData.fromUser = endUser.email;
      let newMsg = await Message.create(messageData);
      debugMessage(`Created message(id: ${newMsg.id}) by user(id: ${endUser.id})`);
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
      await Promise.map(messageIds, async (messageId) => await Message.destroyById(messageId));
      debugMessage(`Deleted ${messageIds.length} messages by user(id: ${endUser.id})`);
    } catch (error) {
      throw new HttpErrors(500, `cannot delete message - ${error.message}`);
    }
  };

  /**
   * @param {Object} filter for 'Message.find()'
   * @param {Object} metadata - must contain 'endUserId'
   * @returns {Object[]} messages - must assign 'read' boolean.
   */
  Message.getMessages = async function(metadata) {
    if (!metadata || !metadata.endUserId) {
      throw new HttpErrors(400, 'cannot get message - user id is missing');
    }
    const endUser = await app.models.EndUser.findById(metadata.endUserId);
    if (!endUser) {
      throw new HttpErrors(400, `cannot get message - user(id: ${metadata.endUserId}) is not found.`);
    }
    let recipients = getRecipients(endUser); // ['everyone', 'employees', endUser.role, endUser.id];
    try {
      let messages = await Message.find({
        where: { toUser: { inq: recipients } },
        include: { relation: 'messageRead', scope: { where: { endUserId: endUser.id } } }
      });

      return _.map(messages, message => {
        message.read = !_.isEmpty(message.toJSON().messageRead);
        message.unsetAttribute('messageRead');
        return message;
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot get message - ${error.message}`);
    }
  };
};
