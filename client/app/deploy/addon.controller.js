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
     Notification.info('Number of failed deployments: ' + res.data.numberOfFailure);
     $scope.results.push('Number of failed deployments: ' + res.data.numberOfFailure + '\n Reasons: ' + res.data.result.toString());     
     Notification.info('Deployment process completed');
     
     $scope.results.push('Deployment process completed');
     $scope.deploymentDone = true;
     
     $scope.stagedDeployments = [];
     $mdDialog.hide();
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
          if(app.isSelected && app.isSelected === true){
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

    // "Piping" HTTP request through server.
    // This is necessary for some network configurations...
    function devicePipeUrl(url) {
      return '/api/pipe/'  + url;
    }

    $scope.updateAllApps = function() {
      $scope.installedApps.forEach(function(app){
        if(app.isSelected && app.isSelected === true && app.confirmModification === true) {
          $scope.updateApp(app.device, app);
        }
      });
      $mdDialog.hide();
    }

    $scope.updateApp = function(device, app) {
      //var url = device.url + '/app/' + app.id + "/rollback";
      console.log(app.name);
      return $http({
        method: 'PUT',
        url: '/api/projects/' + app.name.slice(10) + '/package',
        data: {deviceUrl: device.url, appId: app.id}
      }).then(function(res){
        Notification.success("Updating the app " + app.name + " in " + app.device.name + " was successful");
      
      }).catch(function(err){
        Notification.error("Connection to the application was not successful.");
      
      });
  };

  $scope.rollBackAllApps = function() {
    $scope.installedApps.forEach(function(app){
      if(app.isSelected && app.isSelected === true && app.confirmModification === true) {
        $scope.rollbackApp(app.device, app);
      }
    });
    $mdDialog.hide();
  }
  
  $scope.rollbackApp = function(device, app) {
      var url = device.url + '/app/' + app.id + "/rollback";
      return $http({
        url: devicePipeUrl(url),
        method: 'POST'
      }).then(function(response) {
        // This is a bit of quickndirty way to update app,
        // would be better to load it from the server for realz...
        //app.status = response.data.status;
        Notification.success("Rollback of the app " + app.name + " in " + app.device.name + " was successful");
        
       
      }, function(error){
        Notification.error("Connection to the application was not succeccfull.");
       
      });
  };
  

  $scope.setAllAppsStatus = function(status) {
    $scope.installedApps.forEach(function(app){
      if(app.isSelected && app.isSelected === true && app.confirmModification === true) {
        $scope.setAppStatus(app.device, app, status);
      }
    });
    $mdDialog.hide();
  }

  $scope.setAppStatus = function(device, app, status) {
      var url = device.url + '/app/' + app.id;
      return $http({
        url: devicePipeUrl(url),
        method: 'PUT',
        data: {status: status},
      }).then(function(response) {
        // This is a bit of quickndirty way to update app,
        // would be better to load it from the server for realz...
        //app.status = response.data.status;
        Notification.success( status + " the app " + app.name + " in " + app.device.name + " was successful");
        
       
      }, function(error){
        if (app.status !== "installed") {
          Notification.error("Starting the application was not succeccfull.");
        }
        
        //throw error;
      });
  };


  $scope.removeAllApps = function() {
    $scope.installedApps.forEach(function(app){
      if(app.isSelected && app.isSelected === true && app.confirmModification === true) {
        $scope.removeApp(app.device, app);
      }
    });
    $mdDialog.hide();
  }
  
    ///////// <start> ---- This section is for deleting app    
  $scope.removeApp = function(device, app) {
      var url = device.url + '/app/' + app.id;
      return $http({
        url: devicePipeUrl(url),
        method: 'DELETE',
      })
      .then(function(res) {
        Notification.success("Removing app " + app.name + " in " + app.device.name + " was successful");
        
      })
      .catch(function(error){
        Notification.error("Connection to the application was not succeccfull.");
      });
  };

});


angular.module('koodainApp')
.controller('querySheetCtrl', function($scope, $mdDialog,  $http, deviceManagerUrl, DeviceManager) {

  $scope.userQuery = "";
  $scope.queryResult = "";
  $scope.queryResultData;

  var deviceManager = DeviceManager(deviceManagerUrl);
  $scope.executeQuery = function() {
    modifyQueryResultToData();
  }

  function isDevOrApp(item){
    var result = {app: "app", device: "device", none: "none"};
    if(item.hasOwnProperty("_key") && item.hasOwnProperty("location") && item.hasOwnProperty("status")){
      return result.device;
    } else if(item.hasOwnProperty("id") && item.hasOwnProperty("status")){
      return result.app;
    } else {
      return result.none;
    }
  }

  function modifyQueryResultToData() {      
    console.log($scope.userQuery);   
    // list of queried apps
    var queriedApps = [];
    // list of queried devices or devices that host queried apps
    var queriedDevs = [];
    // list of ids of all queried nodes (apps + devices)
    var queriedAppsAndDevs = [];

    // makes a local copy of queries. So If queries changes meanwhile, it will not hav a side effect.
    //var appQuery = $scope.appQuery;
    var userQuery = $scope.userQuery;

    // if there is any query to query apps or devices
    //if(devQuery || appQuery){
    if(userQuery){
      console.log(userQuery);
      var res = "none";
      deviceManager.queryDevicess(userQuery)
        .then(function(items){
          $scope.queryResult = JSON.stringify(items, null, 2);

          //console.log(devices);
          items.forEach(function(item){

            res = isDevOrApp(item);
            //console.log(res);
            if(res == "app"){
              console.log(res);
                queriedApps.push(item);
            } else if (res == "device"){
              console.log(res);      
              queriedDevs.push(item);

              if (item.apps) {
                item.apps.forEach(function(app){
                  queriedApps.push(app);
                });
              }
            }
          });

          if(res == "app"){
            var qApps = JSON.stringify(queriedApps.map((app) => app.id));
            console.log(qApps);
            var qs = 'LET devs = (FOR device IN devices\n' +
              'FOR app in device.apps[*]\n' +
              'FILTER app.id IN ' + qApps   + ' RETURN DISTINCT device)\n' +
              'FOR dev in devs\n' + 
              'LET apps = (FOR app in dev.apps[*] FILTER app.id IN ' + qApps + ' RETURN app)\n' + 
              'RETURN MERGE_RECURSIVE(UNSET(dev,"apps"), {apps: apps})';

            return deviceManager.queryDevicess(qs)
              .then(function(devs){
                devs.forEach(function(dev){
                  console.log(devs);
                  queriedDevs.push(dev);
                });
                return {queriedDevs: queriedDevs, queriedApps: queriedApps}
              });
          } else {
            return {queriedDevs: queriedDevs, queriedApps: queriedApps}
          }

        }).then(function(data){
         
          console.log(data);
          $scope.queryResultData = data;
          
        }).catch(function(err){              
            console.log(err);
            $scope.queryResult = err.data.message; //JSON.stringify(err, null, 2);
        });
      }
    }
  
  $scope.applyQueryResult = function() {
    $mdDialog.hide($scope.queryResultData);
  }

  $scope.cancel = function() {
    $mdDialog.cancel();
  }
});

/**
 * Controller for showing application log.
 */
angular.module('koodainApp')
.controller('AppLogCtrl', function($scope, $http, $uibModalInstance, Notification, device, app) {

    // TODO: refactor, this is needed in 2(?) controllers...
    function devicePipeUrl(url) {
      return '/api/pipe/'  + url;
    }

    $scope.device = device;
    $scope.app = app;
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
    app._logInterval = setInterval(function() {
      var url = device.url + '/app/' + app.id + '/log';
      $http({
        method: 'GET',
        url: devicePipeUrl(url),
      }).then(function(response) {
        $scope.log = response.data.message;
      },function(error){
        $scope.cancel();
        Notification.error("Connection to the application was not successful.");
      });
    }, 2000);
  });
