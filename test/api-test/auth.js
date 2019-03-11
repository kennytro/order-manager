'use strict';
const appRoot = require('app-root-path');
const expect = require('chai').expect;
const request = require('supertest');
const app = require(appRoot + '/server/server');

describe('Public Content', function() {
  it('should get public home page', function(done) {
    request(app)
      .get('/public/home')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should fail to get non-existing page', function(done) {
    request(app)
      .get('/public/page-not-found')
      .expect('Content-Type', /json/)
      .expect(404)
      .end(done);
  });
});

describe('Auth API', function() {
  it('should fail to access auth employee API', function(done) {
    request(app)
      .post('/api/EmployeeData/resetPassword')
      .query({ idToken: 'invalid token' })
      .expect(403)
      .end(done);
  });

  it('should fail to access auth customer API', function(done) {
    request(app)
      .post('/api/CustomerData/resetPassword')
      .query({ idToken: 'invalid token' })
      .expect(403)
      .end(done);
  });
});

