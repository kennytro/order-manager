'use strict';
/*
 * Using Redis pub/sub, web application publishes message to notify worker
 * some Order/Statement needs a PDF file. Since Redis PubSub does not guarantee
 * delivery of message and worker may not be available when message is delivered,
 * actual list of Order/Statement ID is saved in Redis(by publisher).
 * This file contains the key of sets in Redis.
 */
module.exports = {
  // Set containing orders needing PDF invoice.
  redisOrderInvoiceSetKey: 'order-invoice-set',
  // Set containing statements needing PDF statement.
  redisStatementPdfSetKey: 'statement-pdf-set'
};
