'use strict';

describe('Controller: MyHomeCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var MyHomeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyHomeCtrl = $controller('MyHomeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
