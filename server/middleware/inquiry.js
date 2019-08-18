'use strict';
const appRoot = require('app-root-path');
const _  = require('lodash');
const Promise = require('bluebird');
const https = require('https');
const HttpErrors = require('http-errors');
const querystring = require('querystring');
const logger = require(appRoot + '/config/winston');

// From https://developers.google.com/recaptcha/docs/verify
const ERR_MAP = new Map([
  ['missing-input-secret', 'The secret parameter is missing.'],
  ['invalid-input-secret', 'The secret parameter is invalid or malformed.'],
  ['missing-input-response', 'The response parameter is missing.'],
  ['invalid-input-response', 'The response parameter is invalid or malformed.'],
  ['bad-request', 'The request is invalid or malformed.'],
  ['timeout-or-duplicate', 'The response is no longer valid: either is too old or has been used previously.']
]);

/**
 * @param {String[]} codes - array of error code from reCAPTCHA
 * @returns {String} - error descriptions concatenated.
 */
function decodeReCAPTCHACodes(codes) {
  if (codes && codes.length > 0) {
    return codes.map(code => {
      const errDescription = ERR_MAP.get(code);
      if (errDescription) {
        return errDescription;
      } else {
        logger.error(`Encountered unknown error code(${code}) while verifying reCAPTCHA token.`);
        return `Unknown error code(${code}).`;
      }
    }).join(', ');
  }
}

/**
 * @param {String} token - The user response token provided by the reCAPTCHA.
 * @param {String} secret - The shared key between our site and reCAPTCHA.
 */
async function verifyReCAPTCHA(token, secret) {
  return await new Promise((resolve, reject) => {
    const verifyData = querystring.encode({
      secret: secret,
      response: token
    });
    // verify reCAPTCHA token
    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(verifyData)
      }
    };
    const reCAPTCHARequest = https.request(options, (res) => {
      let resStr = '';
      res.on('data', (d) => {
        resStr += d;
      });
      res.on('end', () => {
        let resObj = JSON.parse(resStr);
        logger.debug(`reCAPTCHA response = ${JSON.stringify(resObj)}`);
        if (resObj.success) {
          resolve(resObj.success);
        } else {
          reject(new Error(decodeReCAPTCHACodes(resObj['error-codes'])));
        }
      });
    });

    reCAPTCHARequest.on('error', (error) => {
      logger.error(error);
      reject(error);
    });
    reCAPTCHARequest.write(verifyData);
    reCAPTCHARequest.end();
  });
}

/**
 * @param {Object} message - JSON object created by 'contact-us' Angular component.
 * @returns {String} - multi-line string.
 */
function formatInquiryBody(message) {
  let lines = [];
  _.forEach(message, function(value, key) {
    lines.push(`${_.upperCase(key)}: \t${value}`);
  });
  return lines.join('\n');
}

module.exports = async function(app, req, res, next) {
  const body = _.get(req, 'body', {});
  if (!_.get(body, 'verifyToken')) {
    return next(new HttpErrors(400, 'reCAPTCHA verification token is missing.'));
  }
  if (!_.get(body, 'message')) {
    return next(new HttpErrors(400, 'Inquiry message is missing.'));
  }
  if (!process.env.RECAPTCHA_SECRET) {
    return next(new HttpErrors(503, 'reCAPTCHA secret is not set.'));
  }
  try {
    await verifyReCAPTCHA(body.verifyToken, process.env.RECAPTCHA_SECRET);
    await app.models.Message.create({
      messageType: 'Inquiry',
      subject: 'Prospect client inquiry',
      body: formatInquiryBody(body.message),
      fromUser: 'Web',
      toUser: 'admin'
    });
    res.send({ success: true, postTime: new Date(), errorMessage: null });
  } catch (error) {
    res.send({ success: false, postTime: null, errorMessage: error.message });
  }
};
