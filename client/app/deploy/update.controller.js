'use strict';

angular.module('koodainApp')
.controller('ModifyAppInstCtrl', function($scope, $http, $resource, $uibModal, Notification, DeviceManager, 
        deviceManagerUrl, $q, $mdDialog, $filter ){

      // get the list of projects
    var Project = $resource('/api/projects/:project');

     // the url of RR (Resource Registry) (AKA device manager)
    // RR keeps info about all resources (devices and their host apps, AIs, ...)
    $scope.deviceManagerUrl = deviceManagerUrl;
    
    // Returns an object with wich we can query resources registered to RR
    var deviceManager = DeviceManager(deviceManagerUrl);

    $scope.devList;
    $scope.displayed = [];
    $scope.installedAppsLoaded = false;
    $scope.loadDevices = function () {
      return deviceManager.queryDevicess().then(function(devices) {
        console.log(devices);
        $scope.devList = devices;
        if(!$scope.installedAppsLoaded) {
          $scope.getInstalledApps();
          $scope.installedAppsLoaded = true;
        }        
      }).then(function(devs){
        //$scope.$apply();
        return "done";
      });
    }
  
    $scope.loadDevices();

    Project.query(function(projects){
        $scope.projects = projects;
        angular.forEach($scope.projects, function(value, key, obj) {
          getProjectDetails(value);
          });
      });

    function getProjectDetails(project) {
    
      // Read the liquidiot.json and construct a query based on its
      // 'deviceCapabilities' field.
      $http({
        method: 'GET',
        url: '/api/projects/' + project.name + '/files/liquidiot.json'
      }).then(function(res) {
        var json = JSON.parse(res.data.content);
        var dcs = json['deviceCapabilities'];
        // free-class means all devices, so we remove it from device capabilities.
        // if array becomes empty we query all devices
        // otherwise we query the remaining devices
        var index = dcs.indexOf("free-class");
        if(index != -1){
          dcs.splice(index, 1);
        }
        project.reqCapabilities = dcs;
        project.appInterfaces = json['applicationInterfaces'];
      })

      $http({
        method: 'GET',
        url: '/api/projects/' + project.name + '/files/package.json'
      }).then(function(res) {
        var json = JSON.parse(res.data.content);
       
        project.version = json.version;
        project.description = json.description;
      })
    };
  

 

  $scope.installedApps = [];
  $scope.installedProjectNames = [];
  $scope.installedProjects = [];
  $scope.selectedAppInstances = [];
  $scope.getInstalledApps = function() {
    $scope.installedApps = [];
    $scope.installedProjectNames = [];
    $scope.installedProjects = [];
    
    $scope.devList.forEach(function(dev){
      if(dev.apps) {
        dev.apps.forEach(function(app){
        var installedApp = {
          id: app.id,
          name: app.name,
          version: app.version,
          device: dev,
          status: app.status
        };
        if(!$scope.installedProjectNames.includes(app.name)) {
          $scope.installedProjectNames.push(app.name);
          var installedProject = $scope.projects.filter(function(project){
            return project.name == app.name.replace('liquidiot-', '');
          })[0];
          $scope.installedProjects.push(installedProject);
        }
        $scope.installedApps.push(installedApp);
        })
      }
    });
  }

    // for select all rows directive
    $scope.selectAllApps = function() {
        if($scope.selectedAppInstances.length === 0) {
          $scope.installedApps.forEach(function(app){
            $scope.selectedAppInstances.push(app.name +app.device._id);
          })
        } else if($scope.selectedAppInstances.length > 0 && $scope.selectedAppInstances.length != $scope.installedApps.length) {
          $scope.installedApps.forEach(function(app){
            var isFound = $scope.selectedAppInstances.indexOf(app.name +app.device._id);
            if(isFound === -1) {
              $scope.selectedAppInstances.push(app.name +app.device._id);
            }
          })
        }
        else {
          $scope.selectedAppInstances = [];
        }
    }
    
    // for select all rows directive
    $scope.selectApp = function(app) {
        var appIndex = $scope.selectedAppInstances.indexOf(app.name +app.device._id);
        if(appIndex === -1) {
            $scope.selectedAppInstances.push(app.name +app.device._id);
        } else {
            $scope.selectedAppInstances.splice(appIndex, 1);
        }
    }

    $scope.updateApp = function(device, app) {
        //var url = device.url + '/app/' + app.id + "/rollback";
        console.log(app.name);
        return $http({
          method: 'PUT',
          url: '/api/projects/' + app.name.slice(10) + '/package',
          data: {deviceUrl: device.url, appId: app.id}
        }).then(function(res){
          Notification.error("Updating the app was successful");
          $scope.loadDevices();
        }).catch(function(err){
          Notification.error("Connection to the application was not successful.");
          $scope.loadDevices();
        });
    };
    
    $scope.rollbackApp = function(device, app, status) {
        var url = device.url + '/app/' + app.id + "/rollback";
        return $http({
          url: devicePipeUrl(url),
          method: 'POST'
        }).then(function(response) {
          // This is a bit of quickndirty way to update app,
          // would be better to load it from the server for realz...
          //app.status = response.data.status;
          $scope.loadDevices();
        }, function(error){
          Notification.error("Connection to the application was not succeccfull.");
          $scope.loadDevices();
        });
    };
    
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
          return $scope.loadDevices().then(function(){
            return response;
          });
        }, function(error){
          if (app.status !== "installed") {
            Notification.error("Starting the application was not succeccfull.");
          }
          return $scope.loadDevices().then(function(){
            throw error;
          });
          //throw error;
        });
    };
    
      ///////// <start> ---- This section is for deleting app    
    $scope.removeApp = function(device, app) {
        var url = device.url + '/app/' + app.id;
        return $http({
          url: devicePipeUrl(url),
          method: 'DELETE',
        })
        .then(function(res) {
          // remove the app from the list of selected Apps.
          selApps.splice(selApps.indexOf(app), 1);
          // remove the app ID from the list of selected App IDs.
          $scope.selAppIds.splice($scope.selAppIds.indexOf(app.id), 1);
          $scope.loadDevices();
        })
        .catch(function(error){
          Notification.error("Connection to the application was not succeccfull.");
        });
    };

    $scope.modifySelectedApps = function() {
        $mdDialog.show({
            controller: 'updateSheetCtrl',
            templateUrl: 'updateSheet.html',
            parent: angular.element(document.body),
            clickOutsideToClose:false,
            fullscreen: $scope.customFullscreen, // Only for -xs, -sm breakpoints.
            resolve: {
                  installedApps: function() { 
                    return $scope.installedApps; }
                  }
          })
          .then(function() {
            $scope.installedAppsLoaded = false;
            $scope.loadDevices();
            console.log('You modified selected apps');
          }, function() {
            console.log('You cancelled the dialog.');
          });
    };


    $scope.clearSelections = function() {
        $scope.installedApps.forEach(function(app){
            app.isRowSelected = false;
        });
    };

    $scope.showQueryWindow = function() {
      $mdDialog.show({
        controller: 'querySheetCtrl',
        templateUrl: 'querySheet.html',
        parent: angular.element(document.body),
        clickOutsideToClose:false,
        fullscreen: $scope.customFullscreen, // Only for -xs, -sm breakpoints.
      })
      .then(function(resData) {
        console.log("Result data: ", resData);
        $scope.installedAppsLoaded = false;
        $scope.devList = resData.queriedDevs;
        $scope.getInstalledApps();
        console.log('You selected devices/apps using query');
      }, function() {
        console.log('You cancelled the query dialog.');
      });
    }


    });