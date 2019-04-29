'use strict';

module.exports = {
  // namespace UUID for metric id.
  uuidNamespace: 'd7f09c30-edbf-42b6-af73-c8931cfbdf7c',
  // Set containing orders changed.
  redisOrderChangedSetKey: 'order-changed-set',
  // Set containing clients deleted.
  redisClientDeletedSetKey: 'client-deleted-set'
};
