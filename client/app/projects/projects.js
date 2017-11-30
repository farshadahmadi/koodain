'use strict';

angular.module('koodainApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('projects', {
        url: '/projects',
        templateUrl: 'app/projects/projects.html',
        controller: 'ProjectsCtrl',
        resolve: {
          projectlist: /* ngInject */ function($stateParams, $resource) {
           //console.log($stateParams);
              return $resource('/api/projects/').query().$promise;
          },         
        }
 
      });
  });
