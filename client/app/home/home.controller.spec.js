'use strict';

describe('Controller: HomeCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var MyHomeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyHomeCtrl = $controller('HomeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
