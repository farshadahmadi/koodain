'use strict';

describe('Controller: MyProjectsCtrl', function () {

  // load the controller's module
  beforeEach(module('koodainApp'));

  var MyProjectsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyProjectsCtrl = $controller('MyProjectsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
