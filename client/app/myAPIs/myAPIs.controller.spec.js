'use strict';

describe('Controller: MyAPIsCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var MyAPIsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyAPIsCtrl = $controller('MyAPIsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
