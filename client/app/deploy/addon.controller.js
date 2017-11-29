'use strict';

angular.module('koodainApp')
.controller('deploySheetCtrl', function($scope, $mdDialog,  $http, stagedDeployments, Notification) {
    $scope.stagedDeployments = stagedDeployments;
    $scope.showResults = false;
    $scope.deploymentDone = false;

    var logLoading = function() {
        console.log(stagedDeployments);
        stagedDeployments.forEach(function(stagedDep) {
          stagedDep.confirmDeployment = true;
        });
    }

    logLoading();

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.numDeployments = 0;
    $scope.numSuccessDeps = 0;
    $scope.numFailDeps = 0;
    $scope.results=[];

    
  $scope.deploy = function() {
    var confirmedDeps = [];
    stagedDeployments.forEach(function(stagedDep) {
      if(stagedDep.confirmDeployment) {
          confirmedDeps.push(stagedDep);
      }
    });
    if (!confirmedDeps.length) {
      return;
    }
    
   console.log('Deployment process started');
   Notification.info('Deployment process started');
   $scope.showResults = true;
   $scope.results.push('Deployment process started');
   
   
   $http({
     method: 'POST',
     url: '/api/projects/deploy',
     data: {deployments: confirmedDeps},
   })
   .then(function(res){
     console.log('ressssssssssssssssss:');
     var deployedAppIds = res.data.result.map((app) => JSON.parse(app).id);
     $scope.devQuery = 'FOR device IN devices FOR app in device.apps[*] FILTER app.id IN ' + JSON.stringify(deployedAppIds)  + ' RETURN app';
     //console.log(deployedApps);
     // number of successful eployments
     $scope.numSuccessDeps = res.data.numberOfSuccess;
     // number of failed deployments
     $scope.numFailDeps = res.data.numberOfFailure;
    //  Notification.info('Deployment process completed');
    //  $scope.results.push('Deployment process completed');
     Notification.info('Number of successful deployments: ' + res.data.numberOfSuccess);
     $scope.results.push('Number of successful deployments: ' + res.data.numberOfSuccess);
     Notification.info('Number of failed deployments: ' + res.data.numberOfFailure + '\n Reasons: ' + res.data.result.toString());
     $scope.results.push('Number of failed deployments: ' + res.data.numberOfFailure + '\n Reasons: ' + res.data.result.toString());     
     
     $scope.deploymentDone = true;
     
     $scope.stagedDeployments = [];
   })
   .catch(function(err){
    
     console.log(err);
     Notification.error('Deployment process encountered some problems!');
     $scope.results.push('Deployment process encountered some problems!');
     $scope.deploymentDone = true;
     $scope.stagedDeployments = [];
   });
  
  };


});


angular.module('koodainApp')
.controller('updateSheetCtrl', function($scope, $mdDialog,  $http, installedApps, Notification) {
    $scope.installedApps = installedApps;
    $scope.showResults = false;
    $scope.modificationsDone = false;

    var setSelected = function() {
      console.log(installedApps);
      installedApps.forEach(function(app) {
          if(app.isSelected && app.isSelected == true){
            app.confirmModification = true;
          }
        });
    }

    setSelected();

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.numModifications = 0;
    $scope.numSuccessMods = 0;
    $scope.numFailMods = 0;
    $scope.results=[];

    
  $scope.deploy = function() {
    var confirmedDeps = [];
    stagedDeployments.forEach(function(stagedDep) {
      if(stagedDep.confirmDeployment) {
          confirmedDeps.push(stagedDep);
      }
    });
    if (!confirmedDeps.length) {
      return;
    }
    
   console.log('Deployment process started');
   Notification.info('Deployment process started');
   $scope.showResults = true;
   $scope.results.push('Deployment process started');
   
   
   $http({
     method: 'POST',
     url: '/api/projects/deploy',
     data: {deployments: confirmedDeps},
   })
   .then(function(res){
     console.log('ressssssssssssssssss:');
     var deployedAppIds = res.data.result.map((app) => JSON.parse(app).id);
     $scope.devQuery = 'FOR device IN devices FOR app in device.apps[*] FILTER app.id IN ' + JSON.stringify(deployedAppIds)  + ' RETURN app';
     //console.log(deployedApps);
     // number of successful eployments
     $scope.numSuccessDeps = res.data.numberOfSuccess;
     // number of failed deployments
     $scope.numFailDeps = res.data.numberOfFailure;
    //  Notification.info('Deployment process completed');
    //  $scope.results.push('Deployment process completed');
     Notification.info('Number of successful deployments: ' + res.data.numberOfSuccess);
     $scope.results.push('Number of successful deployments: ' + res.data.numberOfSuccess);
     Notification.info('Number of failed deployments: ' + res.data.numberOfFailure + '\n Reasons: ' + res.data.result.toString());
     $scope.results.push('Number of failed deployments: ' + res.data.numberOfFailure + '\n Reasons: ' + res.data.result.toString());     
     
     $scope.deploymentDone = true;
     
     $scope.stagedDeployments = [];
   })
   .catch(function(err){
    
     console.log(err);
     Notification.error('Deployment process encountered some problems!');
     $scope.results.push('Deployment process encountered some problems!');
     $scope.deploymentDone = true;
     $scope.stagedDeployments = [];
   });
  
  };


});