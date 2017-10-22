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
  .controller('MydeployCtrl', function ($scope, $http, $resource, $uibModal, Notification, VisDataSet, DeviceManager, deviceManagerUrl, $stateParams, $q, uiGridConstants) {

  var Project = $resource('/api/projects/:project');
  $scope.gridOptions = {
    enableFiltering: true,
    enableRowSelection: true,
    multiSelect: true,
    enableSelectAll: true,
    enableFullRowSelection: true,
    columnDefs: [
      {field: 'name'},
      //{field: 'location.streetAddress'},
      {name: 'Location', field: 'location.tag'},
      {field: 'manufacturer'},
      {name: 'Capabilities', field: 'classes'},
      //{field: 'connectedDevices'},
      {name: 'Installed apps', field: 'apps'}
    ]
  };

  

  $scope.projGridOptions = {
    enableFiltering: true,
    enableRowSelection: true,
    multiSelect: true,
    enableSelectAll: true,
    enableFullRowSelection: true,
    columnDefs: [
      {name: 'name', field: 'name'},
      //{field: 'location.streetAddress'},
      {name: 'Req.Capabilities', field: 'reqCapabilities'},
      {field: 'appInterfaces'}
    ]
  };


  Project.query(function(projects){
    $scope.projects = projects;
    angular.forEach($scope.projects, function(value, key, obj) {
      getProjectDetails(value);
      });
    $scope.projGridOptions.data = projects;
    
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
    };
  

  
  

  $scope.deviceManagerUrl = deviceManagerUrl;
    
  var deviceManager = DeviceManager(deviceManagerUrl);

  // Groups for Vis.js network
  // http://visjs.org/docs/network/groups.html
  var visGroups = {
    device: {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 50,
        color: 'gray'
      },
      // comment the line below if you want to enable dragging
      fixed: true
    },
    'device:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 85,
        color: 'purple'
      },
      // comment the line below if you want to enable dragging
      fixed: true
    },
    /*app:{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf059',
        size: 50,
        color: 'black'
      }
    },*/
    'app:selected':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 70,
        color: 'yellow'
      }
    },
    'app:installed':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 50,
        color: 'blue'
      }
    },
    'app:running':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 50,
        color: 'green'
      }
    },
    'app:crashed':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 50,
        color: 'red'
      }
    },
    'app:paused':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 50,
        color: 'green'
      }
    }
  };

  function groupForApp(app) {
    if(app) {
      return 'app:' + app.status;
    }
    return 'app';
  }

  function groupForDevice() {
    return 'device';
  }

  /// Returns a Vis.js node for the device
  function nodeFromDevice(device) {
    var id = device.id;
    var n = {
      id: id,
      label: device.name || id,
      title: generateDeviceTooltip(device),
      x: device.coords.x,
      y: device.coords.y,
      group: groupForDevice()
    };
    return n;
  }

  // tool tip for a device
  var generateDeviceTooltip = function(device){

    var tooltip = "<div class='panel panel-success' style='margin-bottom:0px'>"+
        "<div class='panel-heading'>"+
          "<h3 class='panel-title'>device</h3>"+
        "</div>"+
        "<div class='panel-body' style='padding-top: 0px; padding-bottom: 0px'>"+
          "<table class='table' style='border: none; margin-bottom:1px'>"+
            "<tr>"+
              "<td>id</td>"+
              "<td>" + device.id + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>name</td>"+
              "<td>" + device.name + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>capabilities</td>"+
              "<td>" + device.classes.join(", ") + "</td>"+
            "</tr>"+
            "<!-- tr>"+
              "<td>location</td>"+
              "<td>" + device.location + "</td>"+
            "</tr -->"+
            "<tr>"+
              "<td>url</td>"+
              "<td>" + device.url + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>coordinates</td>"+
              "<td>" + device.location.latitude + "," + device.location.longitude + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>postal address</td>"+
              "<td>" + device.location.streetAddress + "," + device.location.addressLocality + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>location tag</td>"+
              "<td>" + device.location.tag + "</td>"+
            "</tr>"+
            "<!-- tr>"+
              "<td>coordination</td>"+
              "<td>" + device.coords.x + "," + device.coords.y + "</td>"+
            "</tr -->"+
          "</table>"+
        "</div>"+
      "</div>";

    return tooltip;
  }

  // tool tip for an app
  var generateAppTooltip = function(app){

    var apis = app.hasOwnProperty("applicationInterfaces") ? app.applicationInterfaces.join(", ") : "";
    var status = app.hasOwnProperty("status") ? app.status : "";
    var version = app.hasOwnProperty("version") ? app.version : "";
    var description = app.hasOwnProperty("description") ? app.description : "";

    var tooltip = "<div class='panel panel-success' style='margin-bottom:0px'>"+
        "<div class='panel-heading'>"+
          "<h3 class='panel-title'>application</h3>"+
        "</div>"+
        "<div class='panel-body' style='padding-top: 0px; padding-bottom: 0px'>"+
          "<table class='table' style='border: none; margin-bottom:1px'>"+
            "<tr>"+
              "<td>id</td>"+
              "<td>" + app.id + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>name</td>"+
              "<td>" + app.name + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>interfaces</td>"+
              "<td>" + apis + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>status</td>"+
              "<td>" + status + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>version</td>"+
              "<td>" + version + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>description</td>"+
              "<td>" + description +"</td>"+
            "</tr>"+
          "</table>"+
        "</div>"+
      "</div>";

    return tooltip;
  }

  /// Returns a Vis.js node for the app
  function nodeFromApp(app) {
    var n = {
      id: 'app:' + app.id,
      label: app.name,
      group: groupForApp(app),
      title: generateAppTooltip(app)//,
    };
    return n;
  }

  // Convert the list to an object with device.id as key
  function deviceListAsObject(devs) {
    var obj = {};
    for (var i=0; i<devs.length; i++) {
      // add id property to the device
      devs[i].id = devs[i]._id;
      // add coordination manually since it is not included in json file
      devs[i].coords = {x:(i%10)*200, y:(Math.floor(i/10)+10)*200};
      var d = devs[i];
      obj[d.id] = d;
    }
    return obj;
  }

  // These will be assigned when devices are loaded.
  var allDevices = [], nodes, edges;


  // This counter is used for crawling the camera between selected devices
  var focusedNodeIndex = -1;
  $scope.camera = {
    // Zooms out so all node fit on the canvas
    fit : function(){
      network.fit();
    },
    // Zooms out so all selected node fit on the canvas
    fitOnSelectedNodes : function(){
      // if only one device node is selected
      if(selDevIds.length == 1){
        network.focus(selDevIds[0], {scale:1});
      } else {
        network.fit({nodes: selDevIds});
      }
    },
    // if the number od selected nodes are more than 1 then crawling is meaningful
    checkCrawling: function(){
      if(selDevIds.length > 1){
        focusedNodeIndex = 0;
        $scope.isCrawlingPossible = true;
      } else {
        focusedNodeIndex = -1;
        $scope.isCrawlingPossible = false;
      }
    },
    crawl : function(){
      if(focusedNodeIndex >= 0 && focusedNodeIndex <= selDevIds.length) {
        // crawling has completed one circle
        if(focusedNodeIndex == selDevIds.length){
          Notification.info({message:"Crawling started again!", delay:1000});
        }
        focusedNodeIndex %= selDevIds.length;
        network.focus(selDevIds[focusedNodeIndex], {scale:1});
        focusedNodeIndex++; 
      }
    }

  };

  $scope.filterSelApp = function(app){
    if( $scope.hasOwnProperty('appQuery') && $scope.appQuery.length != 0 && selAppIds.indexOf("app:" + app.id) == -1){
      return false;
    }
    return true;
  }

  var selDevIds = [];
  var selAppIds = [];
  var selApps = [];

  function select(devIds, appIds, selectedDevs4Update, queriedApps) {

    nodes.update(selDevIds.map(function(id) {
      return {
        id: id,
        group: groupForDevice(allDevices[id])
      };
    }));
    nodes.update(devIds.map(function(id) {
      return {
        id: id,
        group: groupForDevice(allDevices[id]) + ':selected'
      };
    }));

    nodes.update(selApps.map(function(app) {
      return {
        id: "app:" + app.id,
        group: groupForApp(app)
      };
    }));
    nodes.update(queriedApps.map(function(app) {
        return {
          id: "app:" + app.id,
          group: groupForApp() + ':selected'
        };
      })
    );
    
    /*nodes.update(selAppIds.map(function(id) {
      return {
        id: id,
        group: groupForApp()
      };
    }));
    nodes.update(appIds.map(function(id) {
      return {
        id: id,
        group: groupForApp() + ':selected'
      };
    }));*/

    selDevIds = devIds;
    selAppIds = appIds;
    selApps = queriedApps;

    var selDevs = selDevIds.map(function(id) {
      return allDevices[id];
    });

    // list of devices: queried devices (queried directly by devicequery) 
    // + devices that host queried apps (queried by appquerry)
    $scope.selectedDevices = selDevs;

    // list of devices: devices that host queried apps (queried by appquerry)
    $scope.selectedDevs4Update = selectedDevs4Update;

    $scope.camera.fit();
    $scope.camera.checkCrawling();
  }


  $scope.deviceQuery = "";
  $scope.applicationQuery = "";

  // deviceQuerry is bound to user input (device textbox in the UI).
  // Whenever user changes it, it will change the internal devQuery.
  // This way user inputs (for querying devices) will influence the visualizatiion tool to select devices,
  // but selecting nodes manually on the visualization tool will not influence (change) the user input.
  $scope.$watch("deviceQuery", function(newValue, oldValue){
    $scope.devQuery = $scope.deviceQuery;
    $scope.appQuery = $scope.applicationQuery;
  });
  
  // applicationQuerry is bound to user input (app textbox in the UI).
  // Whenever user changes it, it will change the internal appQuery.
  // This way user inputs (for querying application) will influence the visualizatiion tool to select apps,
  // but selecting nodes manually on the visualization tool will not influence (change) the user input.
  $scope.$watch("applicationQuery", function(newValue, oldValue){
    console.log("deviceQuery: " + $scope.deviceQuery);
    console.log("applicationQuery: " + $scope.applicationQuery);
    $scope.devQuery = $scope.deviceQuery;
    $scope.appQuery = $scope.applicationQuery;
  });

  // The Vis.js network object, assigned on Vis.js onload event
  var network;

  // Select devices based on what's in device query + app query fields
  // This is called every time either of them changes
  function updateSelection() {

    console.log('updateSelection');

    // list of queried apps
    var queriedApps = [];
    // list of ids of queried apps
    var queriedAppIds = [];
    // list of ids of queried devices + devices that host queried apps
    var queriedDevIDs4Deploy = [];
    // list of ids of devices that host queried apps (apps that are results of appquery)
    var queriedDevIDs4Update = [];
    // ids of all queried apps and devices
    var queriedAppsAndDevs = [];
    // ids of devices that are hosting queried apps (are the result of querying apps)
    // and are not the result of querying devices. 
    var noQueriedDevs = [];

    // list of devices that includes queried apps (queried by appquery)
    // Queried apps are lsited in matchedApps property of each device.
    var queriedDevs4Update = [];

    var appQuery = $scope.appQuery;
    var devQuery = $scope.devQuery;

    // if there is any query to query apps or devices
    //if($scope.devicequery || $scope.appquery){
      //console.log("appQuery: " + $scope.appquery);
    if(devQuery || appQuery){
      //console.log("appQuery: " + $scope.appquery);
      //console.log("deviceQuery: " + $scope.devicequery);
      console.log("appQuery: " + appQuery);
      console.log("deviceQuery: " + devQuery);
      // query apps OR devices
      //deviceManager.queryDevicess($scope.devicequery, $scope.appquery, 'or')
      deviceManager.queryDevicess(devQuery, appQuery, 'or')
        .then(function(devices){
          console.log(devices);
          devices.forEach(function(device){
            queriedDevIDs4Deploy.push(device._id);
            /*if(!device.isQueried){
              noQueriedDevs.push('#' + device._id);
            }*/
            if(device.hasOwnProperty('matchedApps') /*&& device.matchedApps.length > 0*/){
              if(device.matchedApps.length > 0){
                queriedDevIDs4Update.push(device._id);
                queriedDevs4Update.push(device);
              }
              // the device which is hosting the queried apps and not queried directly by devicequery
              if(!device.isQueried){
                noQueriedDevs.push('#' + device._id);
              }

              queriedApps.push.apply(queriedApps, device.matchedApps);
              
              var matchedAppIds = device.matchedApps.map(function(app){
                return "app:" + app.id;
              });
              queriedAppIds.push.apply(queriedAppIds, matchedAppIds);
            }
          });

          /*if(noQueriedDevs.length > 0) {
            if($scope.devicequery) {
              $scope.devicequery = $scope.devicequery + ',' + noQueriedDevs.join(',');
              console.log("in noquerried devs:");
              console.log($scope.devicequery);
            } else {
              $scope.devicequery = noQueriedDevs.join(',');
            }
          }*/
          if(noQueriedDevs.length > 0) {
            if(devQuery) {
              $scope.devQuery = devQuery + ',' + noQueriedDevs.join(',');
              console.log("in noquerried devs:");
              console.log($scope.devQuery);
            } else {
              $scope.devQuery = noQueriedDevs.join(',');
            }
          }
          queriedAppsAndDevs = queriedDevIDs4Deploy.concat(queriedAppIds);
          findSelectedDevCaps4Deployment(queriedDevIDs4Deploy);
          findSelectedDevCaps4Update(queriedDevIDs4Update);
          network.selectNodes(queriedAppsAndDevs);
          select(queriedDevIDs4Deploy, queriedAppIds, queriedDevs4Update, queriedApps);
        }).catch(function(err){
          findSelectedDevCaps4Deployment(queriedDevIDs4Deploy);
          findSelectedDevCaps4Update(queriedDevIDs4Update);
          network.selectNodes(queriedAppsAndDevs);
          select(queriedDevIDs4Deploy, queriedAppIds, queriedDevs4Update, queriedApps);
        });
    } else {
      findSelectedDevCaps4Deployment(queriedDevIDs4Deploy);
      findSelectedDevCaps4Update(queriedDevIDs4Update);
      network.selectNodes(queriedAppsAndDevs);
      select(queriedDevIDs4Deploy, queriedAppIds, queriedDevs4Update, queriedApps);
    }
  }

  $scope.$watch('devQuery',function(newValue, oldValue){
    console.log(newValue);
    console.log("device query changed");
    if(network /*&& newValue != oldValue*/) {
      updateSelection();
    }
  });
  $scope.$watch('appQuery',function(newValue, oldValue){
    console.log(newValue);
    console.log("app query changed");
    if(network /*&& newValue != oldValue*/){
      updateSelection();
    }
  });

  // Vis.js events
  $scope.graphEvents = {
    onload: function(_network) {
      console.log('onload graph events');
      network = _network;
      updateSelection();
      /*$scope.$watch('devicequery',function(p){
        console.log(p);
        console.log("device query changed");
        updateSelection();
      });
      $scope.$watch('appquery',function(p){
        console.log(p);
        console.log("app query changed");
        updateSelection();
      });*/
    },
    selectNode: selectClick,
    deselectNode: selectClick
  };

  $scope.devList;
  $scope.loadDevices = function () {
    return deviceManager.queryDevicess().then(function(devices) {
      //console.log(JSON.stringify(devices));
      $scope.devList = devices;
      $scope.gridOptions.data = devices;
      
      var devs = deviceListAsObject(devices);
      // if you want to remove visual devices,
      // comment this line and uncomment the next line
      //return deviceManager.addMockDevicesTo(allDevices);
      return devs; // a promise can return a synchroous value
    }).then(function(devs){
      console.log("before changing allDevices");
      allDevices = devs;
      console.log("after changing allDevices");
      updateNodesAndEdges();
      //$scope.$apply();
      return "done";
    });
  }

  var isSubset = function(arr1, arr2){
    return arr1.every(function(value){
      return arr2.indexOf(value) >= 0;
    });
  }
  
  // loading of the devices
  $scope.loadDevices();
  $scope.capsAndDevsMap = new Map();
  $scope.gridOptions.onRegisterApi = function(gridApi) {
    $scope.gridApi = gridApi;
    gridApi.selection.on.rowSelectionChanged($scope, function(row){
      console.log("Row selection changed" + row.isSelected);
      if(row.isSelected) {
        row.entity.classes.forEach(function(cap) {
          if($scope.capsAndDevsMap.has(cap)){
            var devsWithCap = $scope.capsAndDevsMap.get(cap);
            devsWithCap.push(row.entity._id);
            $scope.capsAndDevsMap.set(cap, devsWithCap);
          }
          else {
            var devsWithCap = [];
            devsWithCap.push(row.entity._id);
            $scope.capsAndDevsMap.set(cap, devsWithCap);
          }
        });
      }
      else {
        row.entity.classes.forEach(function(cap) {
          if($scope.capsAndDevsMap.has(cap)){
            var devsWithCap = $scope.capsAndDevsMap.get(cap);
            var devInd = devsWithCap.indexOf(row.entity._id);
            devsWithCap.splice(devInd, 1);
            if(devsWithCap.length == 0) {
              $scope.capsAndDevsMap.delete(cap);
            } else {
              $scope.capsAndDevsMap.set(cap, devsWithCap);
            }
          }
        });
      }

      var suitableProjects = [];
      $scope.projects.forEach(function(proj) {
          if(proj.reqCapabilities.length == 0 || isSubset(Array.from($scope.capsAndDevsMap.keys()), proj.reqCapabilities)) {
            suitableProjects.push(proj);
          } 
      });
      $scope.projGridOptions.data = suitableProjects;
    });
  

    gridApi.selection.on.rowSelectionChangedBatch($scope, function(rows){
      console.log("Row selection changed" + row.length);
    });
  } //end of OnRegisterApi device grid


  $scope.capsAndAppsMap = new Map();
  $scope.projGridOptions.onRegisterApi = function(projGridApi) {
    $scope.projGridApi = projGridApi;
    projGridApi.selection.on.rowSelectionChanged($scope, function(row){
      console.log("Row selection changed" + row.isSelected);
      if(row.isSelected) {
        row.entity.reqCapabilities.forEach(function(cap) {
          if($scope.capsAndAppsMap.has(cap)){
            var appsReqCap = $scope.capsAndAppsMap.get(cap);
            appsReqCap.push(row.entity.name);
            $scope.capsAndAppsMap.set(cap, appsReqCap);
          }
          else {
            var appsReqCap = [];
            appsReqCap.push(row.entity.name);
            $scope.capsAndAppsMap.set(cap, appsReqCap);
          }
        });
      }
      else {
        row.entity.reqCapabilities.forEach(function(cap) {
          if($scope.capsAndAppsMap.has(cap)){
            var appsReqCap = $scope.capsAndAppsMap.get(cap);
            var appInd = appsReqCap.indexOf(row.entity.name);
            appsReqCap.splice(appInd, 1);
            if(appsReqCap.length == 0) {
              $scope.capsAndAppsMap.delete(cap);
            } else {
              $scope.capsAndAppsMap.set(cap, appsReqCap);
            }
          }
        });
      }

      if(Array.from($scope.capsAndAppsMap.keys()).length > 0) {
        var suitableDevices = [];
        $scope.devList.forEach(function(dev) {
            if(isSubset(Array.from($scope.capsAndAppsMap.keys()), dev.classes)) {
              suitableDevices.push(dev);
            } 
        });
        $scope.gridOptions.data = suitableDevices;
      } else {
        $scope.gridOptions.data = $scope.devList;
      }
    });
  

    projGridApi.selection.on.rowSelectionChangedBatch($scope, function(rows){
      console.log("Row selection changed" + row.length);
    });
  } //end of OnRegisterApi project grid

  // Update Vis.js nodes and edges
  // look at setTheData() function http://visjs.org/examples/network/data/datasets.html
  function updateNodesAndEdges() {
      var edgesArray = [];
      var nodesArray = Object.keys(allDevices).map(function(id) {
        return nodeFromDevice(allDevices[id]);
      });

      for (var i in allDevices) {
        var d = allDevices[i];
        var apps = d.apps;
        //console.log("deleted devices' apps:");
        //console.log(apps);
        if (apps && apps.length > 0) {
          nodesArray.push.apply(nodesArray, apps.map(nodeFromApp));
          //nodes.add(apps.map(nodeFromApp));
          /* jshint -W083 */
          // Edge from each app to the device it's in
          edgesArray.push.apply(edgesArray, apps.map(function(app) {
            return {
              from: 'app:' + app.id,
              to: d.id,
              length: 50
            };
          }));
        }
      }
      nodes = new VisDataSet(nodesArray);
      edges = new VisDataSet(edgesArray);
      console.log("call onload");
      $scope.graphData = {
        nodes: nodes,
        edges: edges
      };
    }


  //$scope.loadDevices = loadDevices;

  // Vis.js options
  // http://visjs.org/docs/network/#options
  $scope.graphOptions = {
    groups: visGroups,
    interaction: {
      multiselect: true
    }
  };

  function isAppNodeId(nodeId) {
    // App node ids start with app:
    return nodeId && nodeId.slice(0,4) === 'app:';
  }

  function isDeviceNodeId(nodeId) {
    // There are only devices and apps (for now)
    return !isAppNodeId(nodeId);
  }

  // When the user clicks on the Vis.js network,
  // construct a comma-separated list of selected device id to be used as query.
  function selectClick(params) {

    console.log("selectClick is called");
    console.log(params);

    var selDevices = params.nodes.filter(isDeviceNodeId);
    var selApps = params.nodes.filter(isAppNodeId);

    $scope.deselectProject();

    var lastModifiedNodeId = null;
    // if no node (either device or app) is selected
    if(params.nodes.length === 0){
      $scope.devQuery = "";
      $scope.appQuery = "";
    // if a node is deselected or a new node (either app or device) is selected without holding the ctrl key
   } else if (params.hasOwnProperty('previousSelection')) {
      // a new node (either app or device) is selected without holding the ctrl key
      console.log(params.event.changedPointers[0].ctrlKey);
      if(!params.event.changedPointers[0].ctrlKey){
        lastModifiedNodeId = params.nodes[0];
      } else {
        // find the deselected node
        lastModifiedNodeId = findDeselectedNode(params.nodes, params.previousSelection.nodes);
        console.log("lastModifiedNodeId: " + lastModifiedNodeId);
      }
    } else {
      // find the selected node
      lastModifiedNodeId = params.nodes[params.nodes.length - 1];
    }
    
    // if the selected or deselected node is a device, modify query of device
    if(isDeviceNodeId(lastModifiedNodeId)){
      if(!params.event.changedPointers[0].ctrlKey){
        $scope.appQuery = "";
      }
      $scope.devQuery = selDevices.map(function(id) { return '#'+id; }).join(',');
    // if the selected or deselected node is an app, modify query of app
    } else if(isAppNodeId(lastModifiedNodeId)){
      if(!params.event.changedPointers[0].ctrlKey){
        $scope.devQuery = "";
      }
      console.log("inside appquery");
      $scope.appQuery = selApps.map(function(id) { return '#'+id.slice(4,id.length); }).join(',');
    }

    $scope.$apply();  // Needed?
  }
  
  function findDeselectedNode(newSelection, oldSelection){
    return oldSelection.filter(function(device){
      return newSelection.indexOf(device) == -1;
    })[0];
  }

  // selected device capabilities : an array that represents device capabilities of all selected devices
  // here selected devices means the devices that are queried directly by devicequery 
  // + devices that hosts apps that are the results of appquery
  var selDevCaps4Deployment = [];

  function findSelectedDevCaps4Deployment(sel){
    selDevCaps4Deployment = sel.map(function(devId){
      return allDevices[devId].classes;
    });
  }


  // selected device capabilities : an array that represents device capabilities of selected devices
  // here selected devices means the devices that hosts apps queried by appquery
  var selDevCaps4Update = [];

  function findSelectedDevCaps4Update(sel){
    selDevCaps4Update = sel.map(function(devId){
      return allDevices[devId].classes;
    });
  }

  // Returns a promise for getting the device capabilities
  // mentioned in liquidiot.json file of the the project
  function getDevCapsPromise(project) {
    return $http({
      method: 'GET',
      url: '/api/projects/' + project.name + '/files/liquidiot.json'
    }).then(function(res){
      res.name = project.name;
      return res;
    });
  }

  // A list of "deployment objects".
  // Currently the staged deployment is only stored here in this controller;
  // they are lost on page reload...
  $scope.deployments = [];
  var numDeployments = 0;

  $scope.openManageDeployAppsModal = function() {
    $uibModal.open({
      controller: 'ManageDeployAppsCtrl',
      templateUrl: 'managedeployapps.html',
      resolve: {
        projects: function(){
          return Promise.all($scope.projects.map(getDevCapsPromise));
        },
        data: function() {
          return {
            devices: $scope.selectedDevices,
            devicequery: $scope.devQuery,
            appquery: $scope.appQuery,
            selectedProject: $scope.selectedProject,
            selectedDeviceCapabilities: selDevCaps4Deployment
          }; 
        },
      }
    }).result.then(function(deployment) {
      $scope.deployments.push(deployment);
      numDeployments += deployment.numApproxDevices;
      console.log($scope.deployments);
    });
  };
  
  $scope.updates = [];
  var numUpdates = 0;

  $scope.openManageUpdateAppsModal = function() {
    $uibModal.open({
      controller: 'ManageUpdateAppsCtrl',
      templateUrl: 'manageupdateapps.html',
      resolve: {
        projects: function(){
          return Promise.all($scope.projects.map(getDevCapsPromise));
        },
        data: function() {
          return {
            selApps: selApps,
            devices: $scope.selectedDevs4Update,
            devicequery: $scope.devQuery,
            appquery: $scope.appQuery,
            selectedProject: $scope.selectedProject,
            selectedDeviceCapabilities: selDevCaps4Update
          }; 
        },
      }
    }).result.then(function(update) {
      $scope.updates.push(update);
      numUpdates += update.numApproxApps;
      console.log($scope.updates);
    });
  };

/*  $scope.verifyDeployment = function() {
    $uibModal.open({
      controller: 'VerifyDeploymentCtrl',
      templateUrl: 'verifydeployment.html',
      resolve: {
        deployments: function() { return $scope.deployments; },
      }
    }).result.then(function() {
      $scope.deployments = [];
      $scope.loadDevices();
    });
  };*/

////////////////// Start of Testing: Deployment in main page

  $scope.verifyDeployment = function() {
    $uibModal.open({
      controller: 'VerifyDeploymentCtrl',
      templateUrl: 'verifydeployment.html',
      resolve: {
        deployments: function() { return $scope.deployments; },
      }
    }).result.then(function() {
      //$scope.deployments = [];
      //$scope.loadDevices();
      $scope.deploy();
    });
  };

  //$scope.deployments = deployments;
  $scope.deploying = false;
  //$scope.deployed = false;

  // Returns a promise for deploying the project to the device.
  function deployDevicePromise(device, deployment) {
    //$scope.deployResult = "";
    var url = device.url;
    //Notification.info('Deploying ' + deployment.project + ' to ' + url);
    return $http({
      method: 'POST',
      url: '/api/projects/' + deployment.project + '/package',
      data: {deviceUrl: url},
    })
    .then(function(res){

      $scope.numSuccessDeps++;
      return res;

      /*var app = JSON.parse(res.data);
      return $scope.loadDevices()
        .then(function(){
          console.log("res: ");
          console.log(res);
          return $scope.setAppStatus(device, app, 'running')
            .then(function(startRes){
              $scope.numSuccessDeps++;
              return startRes;
            })
            .catch(function(startErr){
              $scope.numFailDeps++;
              //throw startErr;
              return startErr;
            });
        });*/
    })
    .catch(function(installErr){
      $scope.numFailDeps++;
      return installErr;
      /*return $scope.loadDevices()
        .then(function(){
          $scope.numFailDeps++;
          return installErr;
        });*/
    });
  }

  // Returns a promise for executing the deployment object.
  function deployPromise(deployment) {
    // Promise.all succeeds iff all the promises succeed.
    // TODO: what to do on (partially) unsuccessful deployment??!?!?!
    //deployment.result = "";
    return Promise.all(deployment.selectedDevices.map(function(d) {
      return deployDevicePromise(d, deployment);
    }));
  }

  $scope.deploy = function() {

    var timer = setInterval(function(){
      $scope.loadDevices();
    }, 3000);

    var deps = angular.copy($scope.deployments);
    $scope.deployments = [];
    if (!deps.length) {
      return;
    }

    $scope.numDeps = numDeployments;
    $scope.numSuccessDeps = 0;
    $scope.numFailDeps = 0;

    numDeployments = 0;
    $scope.deploying = true;

    Notification.info('Deployment process started');
    Promise.all(deps.map(deployPromise))
      .then(function(deployResults) {
        console.log(deployResults);
        //$scope.deploying = false;
        //$scope.deployed = true;
        Notification.info('Deployment process completed');
        //$uibModalInstance.close();
        clearInterval(timer);
        $scope.loadDevices();
      }).catch(function(err) {
        // At least one of the deployment tasks failed.
        // TODO: what to do on (partially) unsuccessful deployment??!?!?!
        //$scope.deploying = false;
        //$scope.deployed = true;
        Notification.error('Deployment failed!');
        //$uibModalInstance.dismiss('cancel');
      });
  };

////////////////// End of Testing: Deployment in main page

////////////////// Start of Testing: Update in main page

  $scope.verifyUpdate = function() {
    $uibModal.open({
      controller: 'VerifyUpdateCtrl',
      templateUrl: 'verifyupdate.html',
      resolve: {
        updates: function() { return $scope.updates; },
      }
    }).result.then(function() {
      $scope.update();
    });
  };

  $scope.updating = false;

  function updateAppPromise(device, app, update){
    var devUrl = device.url;
    var appId = app.id;
    //Notification.info('Updating app ' + app.id + "in device " + device._id);
    return $http({
      method: 'PUT',
      url: '/api/projects/' + update.project + '/package',
      data: {deviceUrl: devUrl, appId: appId}
    })
    .then(function(res){
      $scope.numSuccessUps++;
      return res;
    })
    .catch(function(err){
      $scope.numFailUps++;
      return err;
    });
  }

  function updateAppsPromise(device, update){
    return Promise.all(device.matchedApps.map(function(app){
      return updateAppPromise(device, app, update);
    }));
  }

  function updatePromise(update){
    return Promise.all(update.selectedDevices.map(function(device){
      return updateAppsPromise(device, update);
    }));
  }

  $scope.update = function() {
    
    var timer = setInterval(function(){
      $scope.loadDevices();
    }, 3000);
    
    var ups = angular.copy($scope.updates);
    $scope.updates = [];
    if (!ups.length) {
      return;
    }

    $scope.numUps = numUpdates;
    $scope.numSuccessUps = 0;
    $scope.numFailUps = 0;

    numUpdates = 0;
    $scope.updating = true;

    Notification.info('Update process started');
    Promise.all(ups.map(updatePromise))
      .then(function(updateResults) {
        console.log(updateResults);
        Notification.info('Update process completed');
        clearInterval(timer);
        $scope.loadDevices();
        //$scope.updating = false;
        //$scope.updated = true;
        //Notification.success('Updates were successful!');
        //$uibModalInstance.close();
      })/*.catch(function(err) {
        // At least one of the deployment tasks failed.
        // TODO: what to do on (partially) unsuccessful deployment??!?!?!
        $scope.deploying = false;
        $scope.deployed = true;
        Notification.error('Deployment failed!');
        $uibModalInstance.dismiss('cancel');
      });*/
  };

////////////////// End of Testing: Update in main page

/*  $scope.verifyUpdate = function() {
    $uibModal.open({
      controller: 'VerifyUpdateCtrl',
      templateUrl: 'verifyupdate.html',
      resolve: {
        updates: function() { return $scope.updates; },
      }
    }).result.then(function() {
      $scope.updates = [];
      $scope.loadDevices();
    });
  };*/

  $scope.discardDeployment = function() {
    $scope.deployments = [];
  };


  $scope.discardUpdate = function() {
    $scope.updates = [];
  };

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


  $scope.updateApp = function(device, app) {
    //var url = device.url + '/app/' + app.id + "/rollback";
    console.log(app.name);
    return $http({
      method: 'PUT',
      url: '/api/projects/' + app.name.slice(10) + '/package',
      data: {deviceUrl: device.url, appId: app.id}
    }).then(function(res){
      $scope.loadDevices();
    }).catch(function(err){
      Notification.error("Connection to the application was not succeccfull.");
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

  $scope.removeApp = function(device, app) {
    //console.log(device);
    /*var q = $scope.appquery;
    if(!q) {
      $scope.appquery = "";
    }*/
    var url = device.url + '/app/' + app.id;
    return $http({
      url: devicePipeUrl(url),
      method: 'DELETE',
    })
    .then(function() {
          // do not now why loaddevices should be called two time to take effect !!!
          //$scope.loadDevices().then(function(){
      selApps.splice(selApps.indexOf(app), 1);
      selAppIds.splice(selAppIds.indexOf(app.id), 1);
      $scope.loadDevices();
            /*if(q){
              $scope.appquery = q;
            }*/
          //});
    })
    .catch(function(error){
      Notification.error("Connection to the application was not succeccfull.");
    });
  };

  $scope.deselectProject = function(){
    // model for project select list
    $scope.selectedProject = null;
  }

  $scope.deselectProject();

  $scope.$watch('selectedProject', function(){
    //$scope.selectAppsForProject();
    $scope.selectDevicesForProject();
  });

  /*$scope.selectAppsForProject = function(){
    if($scope.selectedProject){
      $scope.appquery = "[name=liquidiot-" + $scope.selectedProject.name + "]";
    }
  }*/

  $scope.selectDevicesForProject = function() {
    if($scope.selectedProject){
      // Read the liquidiot.json and construct a query based on its
      // 'deviceCapabilities' field.
      $http({
        method: 'GET',
        url: '/api/projects/' + $scope.selectedProject.name + '/files/liquidiot.json'
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
        console.log("changing devicequery in 1048");
        if (!dcs || !dcs.length) {
          // No deviceCapabilities, query everything *
          $scope.devQuery = '*';
        }
        else {
          $scope.devQuery = '.' + dcs.join('.');
        }
      });
    };
  }

  if($stateParams.project){
    Project.get({project:$stateParams.project}, function(project){
      $scope.selectedProject = project;
      $scope.selectDevicesForProject();
      //$scope.selectAppsForProject();
    });
  }

})

/**
 * Controller for managing (deploying) apps modal dialog.
 */
.controller('ManageDeployAppsCtrl', function($scope, $resource, $http, $uibModalInstance, data, projects) {

  var selDevCaps = data.selectedDeviceCapabilities;
  $scope.devices = data.devices;
  $scope.devicequery = data.devicequery;
  $scope.appquery = data.appquery;

  // checks if one array is subset of another array
  var isSubset = function(arr1, arr2){
    return arr1.every(function(value){
      return arr2.indexOf(value) >= 0;
    });
  }

  // checks if device capabilities listed in the project (liquidiot.json file)
  // is subset of capabilities of every selected device.
  var isSubsetOfAll = function(dcs){
    return selDevCaps.every(function(devCaps){
      return isSubset(dcs, devCaps);
    });
  }

  // selecting projects based on the selected device capabilities
  $scope.projects = projects.filter(function(project){
    var json = JSON.parse(project.data.content);
    var dcs = json['deviceCapabilities'];
    // free-class means all devices, so we remove it from device capabilities.
    // if array becomes empty 
    // otherwise we query the remaining devices
    var index = dcs.indexOf("free-class");
    if(index != -1){
      dcs.splice(index, 1);
    }
    if (!dcs || !dcs.length) {
      // No deviceCapabilities, can be deployed to all devices
      return true;
    }
    else if (isSubsetOfAll(dcs)){
      return true;
    } else {
      return false;
    }
  });

  if(data.selectedProject){
    $scope.selectedProject = $scope.projects.filter(function(project){
      return project.name == data.selectedProject.name;
    })[0];
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.done = function() {
    // Construct a "deployment object"
    // TODO: we could have various tasks to be done on deployment,
    // currently the only kind of task is to deploy app.
    var deployment = {
      devicequery: data.devicequery,
      appquery: data.appquery,
      project: $scope.selectedProject.name,
      numApproxDevices: data.devices.length,
      n: $scope.allDevices || !$scope.numDevices ? 'all' : $scope.numDevices,
      removeOld: $scope.removeOld,
      selectedDevices: data.devices
    };
    $uibModalInstance.close(deployment);
  };
})

/**
 * Controller for managing (deploying) apps modal dialog.
 */
.controller('ManageUpdateAppsCtrl', function($scope, $resource, $http, $uibModalInstance, data, projects) {

  var selDevCaps = data.selectedDeviceCapabilities;
  $scope.devices = data.devices;
  $scope.devicequery = data.devicequery;
  $scope.appquery = data.appquery;

  // checks if one array is subset of another array
  var isSubset = function(arr1, arr2){
    return arr1.every(function(value){
      return arr2.indexOf(value) >= 0;
    });
  }

  // checks if device capabilities listed in the project (liquidiot.json file)
  // is subset of capabilities of every selected device.
  var isSubsetOfAll = function(dcs){
    return selDevCaps.every(function(devCaps){
      return isSubset(dcs, devCaps);
    });
  }

  // selecting projects based on the selected device capabilities
  $scope.projects = projects.filter(function(project){
    var json = JSON.parse(project.data.content);
    var dcs = json['deviceCapabilities'];
    // free-class means all devices, so we remove it from device capabilities.
    // if array becomes empty 
    // otherwise we query the remaining devices
    var index = dcs.indexOf("free-class");
    if(index != -1){
      dcs.splice(index, 1);
    }
    if (!dcs || !dcs.length) {
      // No deviceCapabilities, can be deployed to all devices
      return true;
    }
    else if (isSubsetOfAll(dcs)){
      return true;
    } else {
      return false;
    }
  });

  if(data.selectedProject){
    $scope.selectedProject = $scope.projects.filter(function(project){
      return project.name == data.selectedProject.name;
    })[0];
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.done = function() {
    // Construct a "deployment object"
    // TODO: we could have various tasks to be done on deployment,
    // currently the only kind of task is to deploy app.
    var update = {
      devicequery: data.devicequery,
      appquery: data.appquery,
      project: $scope.selectedProject.name,
      numApproxDevices: data.devices.length,
      numApproxApps: data.selApps.length,
      n: $scope.allDevices || !$scope.numDevices ? 'all' : $scope.numDevices,
      removeOld: $scope.removeOld,
      selectedDevices: data.devices
    };
    $uibModalInstance.close(update);
  };
})

/**
 * Controller for the verify deployment modal dialog.
 */
  .controller('VerifyDeploymentCtrl', function($scope, $http, $resource, $uibModalInstance, Notification, deployments, deviceManagerUrl) {

  $scope.deployments = deployments;
  $scope.deploying = false;
  $scope.deployed = false;

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.done = function() {
    $uibModalInstance.close();
  };

  // Returns a promise for deploying the project to the device.
  function deployDevicePromise(device, deployment) {
    //$scope.deployResult = "";
    var url = device.url;
    Notification.info('Deploying ' + deployment.project + ' to ' + url);
    return $http({
      method: 'POST',
      url: '/api/projects/' + deployment.project + '/package',
      data: {deviceUrl: url},
    }).then(function(res){
      var result = "Deploying to device with id " + device.id + " was successfull\n";
      deployment.result += result;
      return res;
    }).catch(function(err){
      var result = "Deploying to device with id " + device.id + " was NOT successfull\n";
      deployment.result += result;
      return err;
    });
  }

  // Returns a promise for executing the deployment object.
  function deployPromise(deployment) {
    // Promise.all succeeds iff all the promises succeed.
    // TODO: what to do on (partially) unsuccessful deployment??!?!?!
    deployment.result = "";
    return Promise.all(deployment.selectedDevices.map(function(d) {
      return deployDevicePromise(d, deployment);
    }));
  }

  $scope.deploy = function() {
    $scope.done();
/*    var deps = $scope.deployments;
    if (!deps.length) {
      return;
    }

    $scope.deploying = true;

    Promise.all(deps.map(deployPromise))
      .then(function(deployResults) {
        console.log(deployResults);
        $scope.deploying = false;
        $scope.deployed = true;
        Notification.success('Deployment successful!');
        //$uibModalInstance.close();
      }).catch(function(err) {
        // At least one of the deployment tasks failed.
        // TODO: what to do on (partially) unsuccessful deployment??!?!?!
        $scope.deploying = false;
        $scope.deployed = true;
        Notification.error('Deployment failed!');
        $uibModalInstance.dismiss('cancel');
      });*/
  };
})


/**
 * Controller for the verify deployment modal dialog.
 */
  .controller('VerifyUpdateCtrl', function($scope, $http, $resource, $uibModalInstance, Notification, updates, deviceManagerUrl) {

  $scope.updates = updates;
  $scope.updating = false;
  $scope.updated = false;

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.done = function() {
    $uibModalInstance.close();
  };

  function updateAppPromise(device, app, update){
    var devUrl = device.url;
    var appId = app.id;
    Notification.info('Updating app ' + app.id + "in device " + device._id);
    return $http({
      method: 'PUT',
      url: '/api/projects/' + update.project + '/package',
      data: {deviceUrl: devUrl, appId: appId}
    }).then(function(res){
      var result = "Updating app with id " + app.id + " was successfull\n";
      update.result += result;
      return res;
    }).catch(function(err){
      var result = "Updating app with id " + app.id + " was NOT successfull\n";
      update.result += result;
      return err;
    });
  }

  function updateAppsPromise(device, update){
    //update.result += "Updates' report in device with ID " + device._id + " :\n";
    return Promise.all(device.matchedApps.map(function(app){
      return updateAppPromise(device, app, update);
    }));
  }

  function updatePromise(update){
    update.result = "";
    return Promise.all(update.selectedDevices.map(function(device){
      return updateAppsPromise(device, update);
    }));
  }

  $scope.update = function() {
    $scope.done();
    /*var ups = $scope.updates;
    if (!ups.length) {
      return;
    }

    $scope.updating = true;

    Promise.all(ups.map(updatePromise))
      .then(function(updateResults) {
        console.log(updateResults);
        $scope.updating = false;
        $scope.updated = true;
        Notification.success('Updates were successful!');
        //$uibModalInstance.close();
      })/*.catch(function(err) {
        // At least one of the deployment tasks failed.
        // TODO: what to do on (partially) unsuccessful deployment??!?!?!
        $scope.deploying = false;
        $scope.deployed = true;
        Notification.error('Deployment failed!');
        $uibModalInstance.dismiss('cancel');
      });*/
  };
})

/**
 * Controller for showing application log.
 */
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

