'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myProjects', {
        url: '/myProjects',
        templateUrl: 'app/myProjects/myProjects.html',
        controller: 'MyProjectsCtrl',
        resolve: {
          projectlist: /* ngInject */ function($stateParams, $resource) {
           //console.log($stateParams);
              return $resource('/api/projects/').query().$promise;
          },         
        }
 
      });
  });
