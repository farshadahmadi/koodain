/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

/* global devicelib */
'use strict';

angular.module('koodainApp')

  /**
   * Controller for the deploy view.
   */
  .controller('HomeCtrl', function ($scope, $http, $resource, $uibModal, Notification, VisDataSet, DeviceManager, deviceManagerUrl, $stateParams, $q, $timeout) {

  var Project = $resource('/api/projects/:project');
  Project.query(function(projects){
    $scope.projects = projects;
  });

  $scope.deviceManagerUrl = deviceManagerUrl;
    
  var deviceManager = DeviceManager(deviceManagerUrl);

  $scope.loadDevices = function () {
        return deviceManager.queryDevicess().then(function(devices) {
           $scope.devices = devices;
           $timeout(function() {
             $.fn.matchHeight._applyDataApi()
           }, 100);
        });
  }

  $scope.loadDevices();


$scope.openLogModal = function(device, app) {
    $uibModal.open({
      controller: 'AppLogCtrl',
      templateUrl: 'applog.html',
      resolve: {
        device: device,
        app: app,
      }
    }).result.then(null, function() {
      clearInterval(app._logInterval);
    });
  };

  // "Piping" HTTP request through server.
  // This is necessary for some network configurations...
  function devicePipeUrl(url) {
    return '/api/pipe/'  + url;
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
      $scope.loadDevices();
    }, function(error){
      Notification.error("Connection to the application was not succeccfull.");
      $scope.loadDevices();
    });
  };

  $scope.removeApp = function(device, app) {
    //console.log(device);
    var url = device.url + '/app/' + app.id;
    return $http({
      url: devicePipeUrl(url),
      method: 'DELETE',
    }).then(function() {
          // do not now why loaddevices should be called two time to take effect !!!
          $scope.loadDevices().then(function(){
            $scope.loadDevices();
          });
    }, function(error){
      Notification.error("Connection to the application was not succeccfull.");
    });
  };
})