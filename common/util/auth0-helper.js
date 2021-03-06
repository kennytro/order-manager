'use strict';
const appRoot = require('app-root-path');
const Promise = require('bluebird');
const _ = require('lodash');
const jwksClient = require('jwks-rsa');
const jwtNode = require('jsonwebtoken');
const logger = require(appRoot + '/config/winston');

/* Auth0 event code mapping table.
 * See EndUser.getAuth0Logs() for its usage.
 */
const Auth0EventCodeMap = new Map([
  ['admin_update_launch', 'Auth0 Update Launched'],
  ['api_limit', 'Rate Limit On API'],
  ['cls', 'Code/Link Sent'],
  ['coff', 'Connector Offline'],
  ['con', 'Connector Online'],
  ['cs', 'Code Sent'],
  ['du', 'Deleted User'],
  ['f', 'Failed Login'],
  ['fapi', 'Failed API Operation'],
  ['fc', 'Failed by Connector'],
  ['fce', 'Failed Change Email'],
  ['fco', 'Failed by CORS'],
  ['fcoa', 'Failed cross-origin authentication'],
  ['fcp', 'Failed Change Password'],
  ['fcph', 'Failed Post Change Password Hook'],
  ['fcpn', 'Failed Change Phone Number'],
  ['fcpr', 'Failed Change Password Request'],
  ['fcpro', 'Failed Connector Provisioning'],
  ['fcu', 'Failed Change Username'],
  ['fd', 'Failed Delegation'],
  ['fdu', 'Failed User Deletion'],
  ['feacft', 'Failed Exchange'],
  ['feccft', 'Failed Exchange'],
  ['feoobft', 'Failed Exchange'],
  ['feotpft', 'Failed Exchange'],
  ['fepft', 'Failed Exchange'],
  ['fercft', 'Failed Exchange'],
  ['fertft', 'Failed Exchange'],
  ['flo', 'Failed Logout'],
  ['fn', 'Failed Sending Notification'],
  ['fp', 'Failed Login (Incorrect Password)'],
  ['fs', 'Failed Signup'],
  ['fsa', 'Failed Silent Auth'],
  ['fu', 'Failed Login (Invalid Email/Username)'],
  ['fui', 'Failed users import'],
  ['fv', 'Failed Verification Email'],
  ['fvr', 'Failed Verification Email Request'],
  ['gd_auth_failed', 'OTP Auth failed'],
  ['gd_auth_rejected', 'OTP Auth rejected'],
  ['gd_auth_succeed', 'OTP Auth success'],
  ['gd_enrollment_complete', 'Guardian enrollment complete'],
  ['gd_module_switch', 'Module switch'],
  ['gd_otp_rate_limit_exceed', 'Too many failures'],
  ['gd_recovery_failed', 'Recovery failed'],
  ['gd_recovery_rate_limit_exceed', 'Too many failures'],
  ['gd_recovery_succeed', 'Recovery success'],
  ['gd_send_pn', 'Push notification sent'],
  ['gd_send_sms', 'SMS Sent'],
  ['gd_start_auth', 'Second factor started'],
  ['gd_start_enroll', 'Enroll started'],
  ['gd_tenant_update', 'Guardian tenant update'],
  ['gd_unenroll', 'Unenroll device account'],
  ['gd_update_device_account', 'Update device account'],
  ['gd_user_delete', 'User delete'],
  ['limit_delegation', 'Too Many Calls to /delegation'],
  ['limit_mu', 'Blocked IP Address'],
  ['limit_ui', 'Too Many Calls to /userinfo'],
  ['limit_wc', 'Blocked Account'],
  ['pwd_leak', 'Breached password'],
  ['s', 'Success Login'],
  ['sapi', 'Success API Operation'],
  ['sce', 'Success Change Email'],
  ['scoa', 'Success cross-origin authentication'],
  ['scp', 'Success Change Password'],
  ['scph', 'Success Post Change Password Hook'],
  ['scpn', 'Success Change Phone Number'],
  ['scpr', 'Success Change Password Request'],
  ['scu', 'Success Change Username'],
  ['sd', 'Success Delegation'],
  ['sdu', 'Success User Deletion'],
  ['seacft', 'Success Exchange'],
  ['seccft', 'Success Exchange'],
  ['seoobft', 'Success Exchange'],
  ['seotpft', 'Success Exchange'],
  ['sepft', 'Success Exchange'],
  ['sercft', 'Success Exchange'],
  ['sertft', 'Success Exchange'],
  ['slo', 'Success Logout'],
  ['ss', 'Success Signup'],
  ['ssa', 'Success Silent Auth'],
  ['sui', 'Success users import'],
  ['sv', 'Success Verification Email'],
  ['svr', 'Success Verification Email Request'],
  ['sys_os_update_end', 'Auth0 OS Update Ended'],
  ['sys_os_update_start', 'Auth0 OS Update Started'],
  ['sys_update_end', 'Auth0 Update Ended'],
  ['sys_update_start', 'Auth0 Update Started'],
  ['ublkdu', 'User login block released'],
  ['w', 'Warnings During Login']
]);

const APP_METADATA_KEY = 'https://om.com/app_metadata';
const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksUri: `https://${process.env.AUTH0_DOMAIN_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      callback(err);
    } else {
      let signingKey = key.publicKey || key.rasPublicKey;
      callback(null, signingKey);
    }
  });
}

module.exports = {
  /**
   * @param {String} - Auth0 event code
   * @returns {String} - Auth0 event description.
   */
  getEventDescription: function(eventType) {
    return Auth0EventCodeMap.get(eventType);
  },
  /**
   * @param {String} - access token issued by Auth0
   * @returns {Object} - result of decoding the token.
   */
  decodeToken: async function(token) {
    try {
      return await new Promise((resolve, reject) => {
        jwtNode.verify(token, getKey, { algorithms: ['RS256'] }, function(err, decoded) {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
    } catch (err) {
      logger.error(`Failed to verify idToken - ${err.message}`);
      let error = new Error('User not authenticated');
      error.status = 403;
      throw error;
    }
  },
  getMetadata: function(decoded, dataName, defaultValue) {
    return _.get(decoded, [APP_METADATA_KEY, dataName], defaultValue);
  }
};
