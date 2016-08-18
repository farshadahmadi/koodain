'use strict';

angular.module('koodainApp')

  /**
   * Controller for the APIs view.
   *
   * The API descriptions are read from the device manager.
   *
   * Swagger editor can be used to edit the descriptions.
   */
  .controller('ApiDescrCtrl', function ($scope, $http, deviceManagerUrl) {

    function createNewApi(name, devCap) {
      // Default swagger fragment
      var api = {
        "swagger": "2.0",
        "info": {
          "version": "1.0.0",
          "title": name,
          "description": name + " API",
        },
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "paths": {
          "/items": {
            "get": {
              "description": "Returns all items",
              "responses": {
                "200": {
                  "description": "A list of items.",
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/definitions/Item"
                    }
                  }
                }
              }
            }
          }
        },
        "definitions": {
          "Item": {
            "type": "object",
            "required": [
              "id",
              "name"
            ],
            "properties": {
              "id": {
                "type": "integer",
                "format": "int64"
              },
              "name": {
                "type": "string"
              }
            }
          }
        },
        "x-device-capability": devCap
      };

      return $http({
        method: 'PUT',
        url: deviceManagerUrl + '/apis/' + name,
        data: api
      });
    }

    $scope.deviceManagerUrl = deviceManagerUrl;
    $scope.selectedDevCap = "";

    function loadDevCaps() {
      $http({
        method: 'GET',
        url: deviceManagerUrl + '/devicecapabilities',
      }).then(function(res) {
        $scope.devCaps = res.data;
      });
    }
    loadDevCaps();

    function loadApis() {
      $http({
        method: 'GET',
        url: deviceManagerUrl + '/apis',
      }).then(function(res) {
        $scope.apis = res.data;
      });
    }
    loadApis();

    $scope.newApi = function() {
      console.log($scope.selectedDevCap);
      createNewApi($scope.newApiClass, $scope.selectedDevCap).then(function() {
        loadApis();
      });
    };

    $scope.deleteApi = function(api) {
      $http({
        method: 'DELETE',
        url: deviceManagerUrl + '/apis/' + api.name,
      }).then(function() {
        loadApis();
      });
    };
  });
