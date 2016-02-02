/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */

'use strict';

angular.module('koodainApp')
  .controller('DeployCtrl', function ($scope, $location, $http, $resource, $uibModal, Notification) {
    var projects = $resource('/api/projects').query();

    // If project in query params, select it when projects loaded.
    var proj = $location.search().project;
    if (proj) {
      projects.$promise.then(function() {
        for (var i=0; i<projects.length; i++) {
          if (proj === projects[i].name) {
            $scope.activeProject = projects[i];
            break;
          }
        }
      });
    }

    $scope.projects = projects;

    function appendTransform(defaults, transform) {
      defaults = angular.isArray(defaults) ? defaults : [defaults];
      return defaults.concat(transform);
    }


    // Reloads the apps from device and updates its .apps attribute.
    function updateAppsOf(device) {
      delete device.error;
      $http({
        url: device.url + '/app', 
        transformResponse: appendTransform($http.defaults.transformResponse,
          function(descriptions) {
            if (!descriptions) { return descriptions; }
            var apps = [];
            for (var a=0; a<descriptions.length; a++) {
              var app = {
                _description: descriptions[a],
                device: device
              };
              angular.extend(app, descriptions[a]);
              apps.push(app);
            }
            return apps;
          })
      }).then(function(res) {
        device.apps = res.data;
      },
      function() {
        device.apps = [];
        device.error = 'Could not load apps';
      });
    }


    function deactivateApp() {
      var app = $scope.activeApp;
      if (!app) {
        return;
      }
      if (app._interval) {
        clearInterval(app._interval);
      }
      delete $scope.activeApp;
    }

    $scope.projectClicked = function(project) {
      $scope.activeProject = project;
      delete $scope.activeDevice;
      deactivateApp();
    };

    $scope.deviceClicked = function(device) {
      $scope.activeDevice = device;
      deactivateApp();
    };

    $scope.appClicked = function(app) {
      deactivateApp();
      $scope.activeApp = app;
      //app._interval = setInterval(function() { updateInstancesOf(app); }, 2500);
    };

    $scope.newApp = function() {
      var device = $scope.activeDevice;
      var project = $scope.activeProject;
      $http({
        method: 'POST',
        url: '/api/projects/' +project.name + '/package',
        data: {deviceUrl: device.url},
      }).then(function() {
        delete device.error;
        updateAppsOf(device);
      }, function() {
        device.error = 'Could not push app';
      });
    };

    $scope.newInstance = function() {
      var device = $scope.activeDevice;
      var app = $scope.activeApp;
      var url = device.url + '/app/' + app.id + '/instance';
      $http({
        method: 'POST',
        url: url,
        data: {deviceUrl: device.url},
      }).then(function() {
        //updateInstancesOf(app);
      });
    };

    $scope.setInstanceStatus = function(instance, status) {
      var url = instance.app.device.url + '/app/' + instance.app.id + '/instance/' + instance.id;
      return $http({
        url: url,
        method: 'PUT',
        data: {status: status},
      });
    };

    $scope.removeInstance = function(instance) {
      var url = instance.app.device.url + '/app/' + instance.app.id + '/instance/' + instance.id;
      return $http({
        url: url,
        method: 'DELETE',
      });
    };

    function sameApp(a1, a2) {
      return a1.id === a2.id && a1.device.id === a2.device.id;
    }

    $scope.removeApp = function(app) {
      var url = app.device.url + '/app/' + app.id;
      return $http({
        url: url,
        method: 'DELETE',
      }).then(function() {
        if (sameApp(app, $scope.activeApp)) {
          deactivateApp();
          updateAppsOf($scope.activeDevice);
        }
      });
    };
    
    var deviceManager = 'http://130.230.142.101:3000';

    var queries = {
      tempSensor: 'tempSensor=ds18B20',
      speaker: 'speaker=typhoon',
    };

    function deviceQueryString() {
      var q = $scope.query ? $scope.query.capabilities : {};
      return Object.keys(q).filter(function(k) { return q[k]; })
        .map(function(x) { return queries[x]; })
        .join('&');
    }

    function queryDevices() {
      $scope.queryingDevices = true;
      $scope.devices = [];
      var url = deviceManager + '/?' + deviceQueryString();
      $http({
        method: 'GET',
        url: url,
      }).then(function(res) {
        delete $scope.queryingDevices;
        delete $scope.activeDevice;
        deactivateApp();
        var devices = res.data;
        angular.forEach(devices, function(d) {
          d.name = d.url;
          updateAppsOf(d);
        });
        $scope.devices = devices;
      },
      function() {
        delete $scope.queryingDevices;
        Notification.error({
          title: 'Could not query devices',
          message: 'Device manager server down?',
        });
      });
    }

    $scope.$watch('query', queryDevices, true);

    $scope.openAppDescription = function(app) {
      $uibModal.open({
        controller: 'AppDescriptionCtrl',
        templateUrl: 'appdescription.html',
        resolve: {
          app: app,
        }
      });
    };

    $scope.openLogModal = function(instance) {
      $uibModal.open({
        controller: 'InstanceLogCtrl',
        templateUrl: 'instancelog.html',
        resolve: {
          instance: instance,
        }
      }).result.then(null, function() {
        clearInterval(instance.logInterval);
      });
    };
  })

  .controller('AppDescriptionCtrl', function($scope, $uibModalInstance, app) {
    $scope.app = app;
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  })

  .controller('InstanceLogCtrl', function($scope, $http, $uibModalInstance, instance) {
    $scope.instance = instance;
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
    instance.logInterval = setInterval(function() {
      var url = instance.app.device.url + '/app/' + instance.app.id + '/instance/' + instance.id + '/log';
      $http({
        method: 'GET',
        url: url,
      }).then(function(response) {
        $scope.log = response.data;
      });
    }, 2000);
  })

  .filter('compatibleDevices', function() {
    function hasAll(device, caps) {
      for (var c=0; c<caps.length; c++) {
        if (device.capabilities.indexOf(caps[c]) === -1) {
          return false;
        }
      }
      return true;
    }

    return function(devices, project) {
      for (var d=0; d<devices.length; d++) {
        devices[d].compatible = project && hasAll(devices[d], project.capabilities);
      }
      return devices;
    };
  });
