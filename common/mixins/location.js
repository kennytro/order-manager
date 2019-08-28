'use strict';
const _ = require('lodash');

/**
 * Get full address
 * @returns {String} - address
 */
function getAddress() {
  let addressElements = [
    _.get(this, 'addressStreet'),
    _.get(this, 'addressCity'),
    _.get(this, 'addressState'),
    _.get(this, 'addressZip')
  ];
  return _.compact(addressElements).join(' ');
}

/**
 * @returns {Boolean}
 */
function getHasFullAddress() {
  if (_.get(this, 'addressStreet') &&
    _.get(this, 'addressCity') &&
    _.get(this, 'addressState') &&
    _.get(this, 'addressZip')) {
    return true;
  }
  return false;
}

/**
 * Get location coordinates
 * @returns {Object}
 */
function getCoordinates() {
  if (this.hasCoordiates) {
    return { lat: this.settings.location.lat, lng: this.settings.location.lng };
  }
  // let location = _.get(this, ['settings', 'location']);
  // if (location) {
  //   return { lat: location.lat, lng: location.lng };
  // }
}

/**
 * Set location coordinates
 * @param {Object} - coordinate(must have 'lat' and 'lng' properties)
 */
function setCoordinates(corObj) {
  if (corObj.lat && corObj.lng) {
    _.set(this, ['settings', 'location', 'lat'], corObj.lat);
    _.set(this, ['settings', 'location', 'lng'], corObj.lng);
    _.unset(this, ['settings', 'location', 'failureCount']);
  }
}

/**
 * @returns {Boolean}
 */
function getHasCoordinates() {
  let location = _.get(this, ['settings', 'location']);
  if (location && location.lat && location.lng) {
    return true;
  }
  return false;
}

/**
 * @returns {Number} - failure count of getting geo coordinates.
 */
function getCoordinatesFailCount() {
  return _.get(this, ['settings', 'location', 'failureCount'], 0);
}

/**
 * @param {Number} - new failure count of getting geo coordinates.
 */
function setCoordinatesFailCount(count) {
  return _.set(this, ['settings', 'location', 'failureCount'], count);
}

module.exports = function(Model, options) {
  Object.defineProperty(Model.prototype, 'address', { get: getAddress });
  Object.defineProperty(Model.prototype, 'hasFullAddress', { get: getHasFullAddress });
  Object.defineProperty(Model.prototype, 'coordinates', { get: getCoordinates, set: setCoordinates });
  Object.defineProperty(Model.prototype, 'hasCoordinates', { get: getHasCoordinates });
  Object.defineProperty(Model.prototype, 'coordinateFailCount', { get: getCoordinatesFailCount, set: setCoordinatesFailCount });
};
