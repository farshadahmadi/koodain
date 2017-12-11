'use strict';

angular.module('koodainApp').controller('ProjectsCtrl', function ($scope, $http, $resource, $uibModal, Notification, projectlist, $timeout) {

    // Get the project version and description from package.json file
    var getProjDetails = function(proj) {
              console.log(proj.name);
              $resource('/api/projects/' + proj.name + '/files/package.json').get().$promise.then(function(packageJson) {
                           console.log(packageJson.content);
                           var projJson = JSON.parse(packageJson.content);
                           proj.version = projJson.version;
                           proj.description = projJson.description;                           
                    }, function(response) {
                        console.log('This is bad ' + response);
                        proj.version = 'unknown';
                        proj.description = 'no description found';
                    });
           };  


  
    // Get more information about all the projects
    var getProjsInfo = function() {
       angular.forEach($scope.projects, function(value, key, obj) {
                  getProjDetails(value);
              });      
           };  

    // This makes all the ul tags to which the data-mh attribute is applied, 
    // into equal heights in each row
    var makeEqualHgtRows =  function(){
      $timeout(function() {
        $.fn.matchHeight._applyDataApi();
        }, 100);
    };
    // Get the list of projects and their details
  var loadProjs = function() {
      $scope.projects = projectlist;
      getProjsInfo();
      makeEqualHgtRows();
    };

  // load all the project information
  loadProjs();


  // Object to store new project info
   $scope.newProj = {
     name: '',
     description: ''
   };


    $scope.createProject = function() {
      // Create a Project $resource for getting and saving projets.
      var Project = $resource('/api/projects');

      var newProject = new Project({name: $scope.newProj.name});

      // Save the project
      newProject.$save().then(function(){
        // Once the project is created, write the descrption to the new project's package.json
        $resource('/api/projects/' + $scope.newProj.name + '/files/package.json').get()
          .$promise.then(function(packageJson) {
          var projJson = JSON.parse(packageJson.content);
          $scope.newProj.version = projJson.version;                          
          projJson.description = $scope.newProj.description;
          var File = $resource('/api/projects/'+ $scope.newProj.name + '/files/:name', null, {
            update: {method: 'PUT' }
            });
          packageJson.content = JSON.stringify(projJson, undefined, 2);
          updatePackageJson(File, packageJson); 
          $scope.projects.push($scope.newProj);
          $scope.newProj = {
            name: '',
            description: ''
          };     
         }, function(response) {
             Notification.error(res.data.error);
         }); //end of writing to the package.json file

        // Update the UI with the new project
        // $resource('/api/projects/' + $scope.newProj.name).get().$promise.then(function(savedProj) {
        //   $scope.projects.push(savedProj);
        //   getProjDetails(savedProj);
        //   makeEqualHgtRows();
        // });


      },function(res) {
        Notification.error(res.data.error);
      }); //end of save
    };

    // Watch modifications to the edited file,
    // and save the file to the backend on every modification.
    // The "eagerness" of the saving can be controlled with the 'debounce'
    // attribute in the view.
    var updatePackageJson = function(updateReq, packJson) {
       //console.log(f);
        var u = updateReq.update({name: 'package.json'}, packJson);
        console.log( u.$promise.$$state) ;      
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
        p.remove();
        var projIndex = $scope.projects.indexOf(project);
        $scope.projects.splice(projIndex, 1);
        //return name;
      });
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



