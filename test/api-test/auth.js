'use strict';
const expect = require('chai').expect;
const supertest = require('supertest');
const api = supertest('http://localhost:3000');

describe('Public Content', function() {
  it('should get public home page', function(done) {
    api
      .get('/public/home')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  it('should fail to get non-existing page', function(done) {
    api
      .get('/public/page-not-found')
      .expect('Content-Type', /json/)
      .expect(404)
      .end(done);
  });
});

describe('Auth API', function() {
  it('should fail to access auth employee API', function(done) {
    api
      .post('/api/EmployeeData/resetPassword')
      .query({ idToken: 'invalid token' })
      .expect(401)
      .end(done);
  });

  it('should fail to access auth customer API', function(done) {
    api
      .post('/api/CustomerData/resetPassword')
      .query({ idToken: 'invalid token' })
      .expect(401)
      .end(done);
  });
});

