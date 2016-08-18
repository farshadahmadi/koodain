'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var visualdeviceCtrlStub = {
  index: 'visualdeviceCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var visualdeviceIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './visualdevice.controller': visualdeviceCtrlStub
});

describe('Visualdevice API Router:', function() {

  it('should return an express router instance', function() {
    visualdeviceIndex.should.equal(routerStub);
  });

  describe('GET /api/visualdevices', function() {

    it('should route to visualdevice.controller.index', function() {
      routerStub.get
        .withArgs('/', 'visualdeviceCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});
