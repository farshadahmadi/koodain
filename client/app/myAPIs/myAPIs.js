'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myAPIs', {
        url: '/myAPIs',
        templateUrl: 'app/myAPIs/myAPIs.html',
        controller: 'MyAPIsCtrl'
      });
  });
