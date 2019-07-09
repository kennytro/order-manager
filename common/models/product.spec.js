'use strict';
const expect = require('chai').expect;
const appRoot = require('app-root-path');

describe('Product test', function() {
  const app = require(appRoot + '/server/server');
  before(async function() {
    await app.models.EndUser.create([
      {
        authId: 'testUser',
        email: 'testu@etr.com',
        role: 'admin',
        userSettings: {
          productExcluded: ['1000']
        }
      }, {
        authId: 'testUser2',
        email: 'testu2@etr.com',
        role: 'admin'
      }]);
    await app.models.Product.create([
      {
        id: 1000,
        name: 'grape',
        description: 'grape'
      }, {
        id: 1001,
        name: 'coke',
        description: 'Coca cola'
      }
    ]);
  });

  it('should exclude product', async function() {
    let products = await app.models.Product.getMyProducts('testUser');
    expect(products.length).to.equal(1, 'expect to exclude grape');
    expect(products[0].id).to.equal(1001, 'expect to get coke');
  });

  it('should find all products', async function() {
    let products = await app.models.Product.getMyProducts('testUser2');
    expect(products.length).to.equal(2, 'expect to find all products');
  });

  it('should not find product with invalid auth Id', async function() {
    let products = await app.models.Product.getMyProducts('testUser3');
    expect(products.length).to.equal(0, 'expect to find no product');
  });
});
