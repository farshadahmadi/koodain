'use strict';

angular.module('koodainApp')
  .controller('HostsCtrl', function ($scope, $http, $uibModal, $interval) {

    function getHosts(){
      $http({
        method: 'GET',
        url: '/api/visualdevices'
      }).then(function(hosts){
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

  });

