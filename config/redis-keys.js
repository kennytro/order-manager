'use strict';
/*
 * Using Redis pub/sub, web application publishes message to notify worker
 * some Order/Statement needs a PDF file. Since Redis PubSub does not guarantee
 * delivery of message and worker may not be available when message is delivered,
 * actual list of Order/Statement ID is saved in Redis(by publisher).
 * This file contains the key of sets in Redis.
 */
module.exports = {
  // namespace UUID for metric id.
  metricNamespace: 'd7f09c30-edbf-42b6-af73-c8931cfbdf7c',
  // Set containing orders changed.
  orderChangedSetKey: 'order-changed-set',
  // Set containing clients deleted.
  clientDeletedSetKey: 'client-deleted-set',
  // Set containing product changed.
  productChangedSetKey: 'product-changed-set',
  // Set containing orders needing PDF invoice.
  orderInvoiceSetKey: 'order-invoice-set',
  // Set containing statements needing PDF statement.
  statementPdfSetKey: 'statement-pdf-set'
};
