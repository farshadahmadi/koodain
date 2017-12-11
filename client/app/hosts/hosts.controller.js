'use strict';

angular.module('koodainApp')
  .controller('HostsCtrl', function ($scope, $http, $uibModal, $interval, $resource, Notification, deviceManagerUrl, DeviceManager) {

    // Returns an object with wich we can manage resources registered to RR
    var deviceManager = DeviceManager(deviceManagerUrl);

    function getHosts(){
      $http({
        method: 'GET',
        url: '/api/visualdevices'
      }).then(function(hosts){
        console.log(hosts);
        console.log(hosts.data);
        $scope.hosts = hosts.data;
      });
    }

   // getHosts();

    var timer;

    function getHostsIntervally(interval){
      getHosts();
      if(timer){
        clearInterval(timer);
      }
      timer = $interval(function(){
        getHosts();
      },
      interval);
    }

    getHostsIntervally(3000);

    $scope.triggerBuild = function(host){
      $http({
        method: 'POST',
        url: '/api/visualdevices/' + host.name//,
        //data: {hostname: host.name},
      }).then(function(res){
        console.log(res.data);
        //$scope.ok();
      }).catch(function(err){
        console.log(err.data);
        //$scope.errorLog = JSON.stringify(err.data, null, 4);
      });

      console.log(host.name);
    }

    var removeDevice = function(host){
      return deviceManager.removeDevice('siotad-' + host.name)
        .then(function(res){
          return res
        })
        .catch(function(err){
          return err;
        });
    }

    $scope.triggerDeployment = function(host){
      removeDevice(host)
        .then(function(){
          return $http({
            method: 'PUT',
            url: '/api/visualdevices/' + host.name + '/deployment'//,
            //data: {hostname: host.name},
          })
        })
        .then(function(res){
          console.log(res);
          //$scope.ok();
        }).catch(function(err){
          console.log(err.data);
          //$scope.errorLog = JSON.stringify(err.data, null, 4);
        });

        //console.log(host.name);
    }

    // Opens a new modal view for creating a new host.
    $scope.openNewHostModal = function() {
      $uibModal.open({
        controller: 'NewHostCtrl',
        templateUrl: 'newhost.html'
      }).result.then(function(name) {
        console.log(name);
      });
    };

    $scope.$on("$destroy", function(){
      $interval.cancel(timer);
    });
    
    // Opens a new modal view for deleting a project.
    $scope.openDeleteHostModal = function(host) {
      $uibModal.open({
        controller: 'deleteHostCtrl',
        templateUrl: 'deletehost.html',
        resolve: {
          host: function() { return host; }
        }
      }).result.then(function(hostName) {
        var h = $resource('/api/visualdevices/' + hostName);
        return h.remove().$promise;
      }).then(function(res){
        return deviceManager.removeDevice('siotad-' + host.name);
      }).then(function(res) {
        // New project successfully saved, reload projects.
        //$scope.projects = Project.query();
        //res.then(function(data){
          console.log(res);
        //});
      },function(res) {
        // Could not create the project, for some reason.
        if(res.data){
          console.log(res);
          Notification.error(res.data.error);
        } else {
          console.log(res);
        }
      });
    };

  })

  /**
   * Controller for the create new host modal dialog.
   */
  .controller('NewHostCtrl', function ($scope, $uibModalInstance, $http) {

    $scope.ok = function() {
      $uibModalInstance.close("salam");
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.createHost = function(){
      $http({
        method: 'POST',
        url: '/api/visualdevices',
        data: {hostname: $scope.host.name},
      }).then(function(res){
        //console.log(res.data);
        $scope.ok();
      }).catch(function(err){
        //console.log(err.data);
        $scope.errorLog = JSON.stringify(err.data, null, 4);
      });
    };

  })

  /**
   * Controller for the 'delete a host' modal dialog.
   */
  .controller('deleteHostCtrl', function ($scope, $uibModalInstance, host) {
    $scope.host = host;
    $scope.ok = function() {
      $uibModalInstance.close($scope.host.name);
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
