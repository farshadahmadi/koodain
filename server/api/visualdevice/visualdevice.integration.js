'use strict';

var app = require('../../../server');
import request from 'supertest';

describe('Visualdevice API:', function() {

  describe('GET /api/visualdevices', function() {
    var visualdevices;

    beforeEach(function(done) {
      request(app)
        .get('/api/visualdevices')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          visualdevices = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      visualdevices.should.be.instanceOf(Array);
    });

  });

});
