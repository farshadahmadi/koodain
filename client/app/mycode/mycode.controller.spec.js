'use strict';

describe('Controller: MycodeCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var MycodeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MycodeCtrl = $controller('MycodeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
