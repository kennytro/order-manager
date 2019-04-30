'use strict';
const appRoot = require('app-root-path');
const HttpErrors = require('http-errors');
const _ = require('lodash');
const https = require('https');
const app = require(appRoot + '/server/server');
const logger = require(appRoot + '/config/winston');

module.exports = function(CompanyInfo) {
  const LOGO_URL_KEY = 'logoUrl';    // 'key' value for company logo URL.
  /*
   * @returns {Object} - JSON object of company information.
   */
  CompanyInfo.getCompanyInfo = async function() {
    try {
      let companyInfomation = await CompanyInfo.find();
      let result = {};
      _.each(companyInfomation, ci => result[ci.key] = ci.value);
      return result;
    } catch (error) {
      logger.error(`Error in CompanyInfo.getCompanyInfo() - ${error.message}`);
      throw error;
    }
  };

  CompanyInfo.setCompanyInfo = async function(companyInfo) {
    const keys = _.keys(companyInfo);
    let newInfoArray = keys.map((key) => {
      return {
        key: key,
        value: companyInfo[key]
      };
    });
    try {
      await app.dataSources.OrderManager.transaction(async models => {
        const { CompanyInfo } = models;
        await CompanyInfo.destroyAll({ key: { inq: keys } });
        await CompanyInfo.create(newInfoArray);
      });
    } catch (error) {
      throw new HttpErrors(500, `cannot save company information - ${error.message}`);
    }
    return {
      status: 200,
      keyCount: keys.length
    };
  };

  /*
   * @param {string} - logo image URL.
   * @returns {string} - base64 encoded string of logo image
   */
  CompanyInfo.getLogoImageBase64 = async function(logoUrl) {
    if (!logoUrl) {
      const logoInfo = await CompanyInfo.findById(LOGO_URL_KEY);
      if (!logoInfo) {
        return null;
      }
      logoUrl = logoInfo.value;
    }
    return new Promise((resolve, reject) => {
      https.get(logoUrl, function(resp) {
        resp.setEncoding('base64');
        let body = 'data:' + resp.headers['content-type'] + ';base64,';
        resp.on('data', (data) => { body += data; });
        resp.on('end', () => {
          resolve(body);
        });
      }).on('error', (e) => {
        logger.error(`Failed to get ${logoUrl} - ${e.message}`);
        reject(e);
      });
    });
  };
};
