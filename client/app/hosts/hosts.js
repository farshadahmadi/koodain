'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('hosts', {
        url: '/hosts',
        templateUrl: 'app/hosts/hosts.html',
        controller: 'HostsCtrl'
      });
  });
