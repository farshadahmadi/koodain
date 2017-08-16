'use strict';

describe('Controller: HostsCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var HostsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HostsCtrl = $controller('HostsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
