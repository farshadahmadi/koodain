'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('deploy', {
        url: '/deploy?project',
        templateUrl: 'app/deploy/deploy.html',
        //controller: 'DeployCtrl'
      });
  });
