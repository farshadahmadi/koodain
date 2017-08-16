'use strict';

describe('Controller: MydeployCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var MydeployCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MydeployCtrl = $controller('MydeployCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
