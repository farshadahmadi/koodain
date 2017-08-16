'use strict';

angular.module('koodainApp')  
  .controller('MyProjectsCtrl', function ($scope, $http, $resource, $uibModal, Notification, projectlist) {

    // Create a Project $resource for getting and saving projets.
//    var Project = $resource('/api/projects');
    
    // Get the list of projects for the view.
  //  $scope.projects = Project.query();
  
    $scope.projects = projectlist;

    var getProjsInfo = function() {
       angular.forEach($scope.projects, function(value, key, obj) {
              console.log(value.name);
              $resource('/api/projects/' + value.name + '/files').get().$promise.then(function(files) {
                        console.log(value.name);
                        console.log('response  ' + files);
                        var packageJsons = files.files.filter(function(f) { return f.name === 'package.json'; });
                        if (packageJsons.length > 0) {
                           //$scope.openFile(packageJsons[0]);
                           //$scope.packageFile = packageJsons[0];
                           console.log(packageJsons[0].content);
                           var projJson = JSON.parse(packageJsons[0].content);
                           value.version = projJson.version;
                           value.description = projJson.description;
                           };
                    }, function(response) {
                        console.log('This is bad ' + response);
                        value.version = 'unknown';
                        value.description = 'no description found';
                    });
               });      
           };

   getProjsInfo();


   $scope.newProjectName = '';
   $scope.newProjectDescription = '';
   $scope.createProject = function() {
     var newProj = new Project({name:  $scope.newProjectName});
     newProj.$save();

     $scope.projects = Project.query();


   };

  });


