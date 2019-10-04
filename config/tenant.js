'use strict';
const yn = require('yn');

module.exports = {
  // id: ID used in S3 bucket path and Auth0 user's app_metadata
  id: process.env.TENANT_ID || 'om-app-dev',
  // connection: Auth0 connection type.
  connection: process.env.AUTH0_CONNECTION,
  clientId: process.env.AUTH0_CLIENT_ID,
  domainId: process.env.AUTH0_DOMAIN_ID,
  audience: process.env.AUTH0_AUDIENCE,
  timeZone: process.env.TZ || 'America/Los_Angeles',
  // companyName: displayed in employee layout
  companyName: process.env.COMPANY_NAME || 'Order Manager',
  // reCAPTCHASiteKey: used in 'Contact Us' in public module
  reCAPTCHASiteKey: process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  // mapAPIKey: Google Map API used in 'Clients' in public module and 'Delivery Routes' in employee module
  mapAPIKey: process.env.GOOGLE_MAP_API_KEY,
  // hidePriceFromCustomer: hides unit price and amount of order until 'Shipped' status
  hidePriceFromCustomer: yn(process.env.HIDE_PRICE_FROM_CUSTOMER)
};
