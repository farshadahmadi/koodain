'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myHome', {
        url: '/myHome',
        templateUrl: 'app/myHome/myHome.html',
        controller: 'MyHomeCtrl'
      });
  });
