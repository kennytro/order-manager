'use strict';

module.exports = {
  id: process.env.TENANT_ID || 'om-app-dev',
  connection: process.env.AUTH0_CONNECTION,
  clientId: process.env.AUTH0_CLIENT_ID,
  domainId: process.env.AUTH0_DOMAIN_ID,
  audience: process.env.AUTH0_AUDIENCE,
  timeZone: process.env.TZ || 'America/Los_Angeles',
  companyName: process.env.COMPANY_NAME || 'Order Manager',
  reCAPTCHASiteKey: process.env.RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  mapAPIKey: process.env.GOOGLE_MAP_API_KEY
};
