'use strict';
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
/* Authentication middleware that checks presence of Auth0 JWT token
 * in the header and verifies against the Auth0 JSON web key set.
*/
module.exports = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN_ID}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN_ID}/`,
  algorithms: ['RS256']
});
