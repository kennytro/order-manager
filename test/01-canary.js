'use strict';
const expect = require('chai').expect;
const supertest = require('supertest');
const api = supertest('http://localhost:3000');

describe('Canary Test', function() {
  it('should pass canary test', function() {
    expect(true).to.equal(true);
  });
});
