'use strict';

angular.module('koodainApp')
.controller('deploySheetCtrl', function($scope, $mdBottomSheet,  $http, stagedDeployments, Notification) {
    $scope.stagedDeployments = stagedDeployments;

    var logLoading = function() {
        console.log(stagedDeployments);
    }

    logLoading();

    $scope.numDeployments = 0;
    $scope.numSuccessDeps = 0;
    $scope.numFailDeps = 0;

  $scope.deploy = function() {
    var stagedDeps = angular.copy($scope.stagedDeployments);
    $scope.stagedDeployments = [];
    if (!stagedDeps.length) {
      return;
    }
    
   console.log('Deployment process started');
   Notification.info('Deployment process started');
   
   $http({
     method: 'POST',
     url: '/api/projects/deploy',
     data: {deployments: stagedDeps},
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
     Notification.info('Deployment process completed');
     
   })
   .catch(function(err){
     console.log(err);
     Notification.error('Deployment process encountered some problems!');
     
   });
  
  };


});