/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */
'use strict';

angular.module('koodainApp')

  /**
   * Controller for the main, or "lobby" view of the IDE.
   */
  .controller('MainCtrl', function ($scope, $http, $resource, $uibModal, Notification) {

    // Create a Project $resource for getting and saving projets.
    var Project = $resource('/api/projects');

    // Get the list of projects for the view.
    $scope.projects = Project.query();

    // Opens a new modal view for creating a new project.
    $scope.openNewProjectModal = function() {
      $uibModal.open({
        controller: 'NewProjectCtrl',
        templateUrl: 'newproject.html'
      }).result.then(function(name) {
        // Create new project.
        var r = new Project({name: name});
        return r.$save();
      }).then(function() {
        // New project successfully saved, reload projects.
        $scope.projects = Project.query();
      },function(res) {
        // Could not create the project, for some reason.
        if(res.data) {
          Notification.error(res.data.error);
        }
      });
    };

    // Opens a new modal view for deleting a project.
    $scope.deleteProjectModal = function(project) {
      $uibModal.open({
        controller: 'deleteProjectCtrl',
        templateUrl: 'deleteproject.html',
        resolve: {
          project: function() { return project; }
        }
      }).result.then(function(projectName) {
        console.log(name);
        var p = $resource('/api/projects/' + projectName);
        return p.remove();
        //return name;
      }).then(function() {
        // New project successfully saved, reload projects.
        $scope.projects = Project.query();
      },function(res) {
        // Could not create the project, for some reason.
        if(res.data) {
          Notification.error(res.data.error);
        }
      });
    };

  })

  /**
   * Controller for the create new project modal dialog.
   */
  .controller('NewProjectCtrl', function ($scope, $uibModalInstance) {
    $scope.ok = function() {
      $uibModalInstance.close($scope.newproject.name);
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  })
  /**
   * Controller for the delete a project modal dialog.
   */
  .controller('deleteProjectCtrl', function ($scope, $uibModalInstance, project) {
    $scope.project = project;
    $scope.ok = function() {
      $uibModalInstance.close($scope.project.name);
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
