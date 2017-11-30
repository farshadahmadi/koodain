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
  .controller('MapViewCtrl', function ($scope, $http, $resource, $uibModal, Notification, VisDataSet, DeviceManager, 
    deviceManagerUrl, $stateParams, $q) {

  // get the list of projects
  var Project = $resource('/api/projects/:project');

  Project.query(function(projects){
    $scope.projects = projects;
  });

  // the url of RR (Resource Registry) (AKA device manager)
  // RR keeps info about all resources (devices and their host apps, AIs, ...)
  $scope.deviceManagerUrl = deviceManagerUrl;
  
  // Returns an object with wich we can query resources registered to RR
  var deviceManager = DeviceManager(deviceManagerUrl);

  // Groups for Vis.js network
  // http://visjs.org/docs/network/groups.html
  var visGroups = {
    'device:active': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 50,
        color: 'green'
      },
      // comment the line below if you want to enable dragging
      fixed: true
    },
    'device:passive': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 50,
        color: 'red'
      },
      // comment the line below if you want to enable dragging
      fixed: true
    },
    'device:active:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 75,
        color: 'green'
      },
      // comment the line below if you want to enable dragging
      fixed: true
    },
    'device:passive:selected': {
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf233',
        size: 75,
        color: 'red'
      },
      // comment the line below if you want to enable dragging
      fixed: true
    },
    'app:installed':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 65,
        color: 'blue'
      }
    },
    'app:installed:selected':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 65,
        color: 'blue'
      }
    },
    'app:running':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 40,
        color: 'green'
      }
    },
    'app:running:selected':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 65,
        color: 'green'
      }
    },
    'app:crashed':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 40,
        color: 'red'
      }
    },
    'app:crashed:selected':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 65,
        color: 'red'
      }
    },
    'app:paused':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 40,
        color: 'green'
      }
    },
    'app:paused:selected':{
      shape: 'icon',
      icon: {
        face: 'FontAwesome',
        code: '\uf085',
        size: 65,
        color: 'green'
      }
    }
  };

  // returns approperiate group for the app node
  function groupForApp(app, isSelected) {
    if(isSelected) {
      return 'app:' + app.status + ':selected';
    }
    return 'app:' + app.status;
  }

  // returns approperiate group for the devie node
  function groupForDevice(device, isSelected) {
    if(isSelected) {
      return 'device:' + device.status + ':selected';
    }
    return 'device:' + device.status;
  }

  /// Returns a Vis.js node for the device
  function nodeFromDevice(device) {
    var id = device.id;
    var n = {
      id: id,
      label: device.name || id,
      title: generateDeviceTooltip(device),
      x: device.location.x,
      y: device.location.y,
      group: groupForDevice(device)
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
            "<!-- tr>"+
              "<td>id</td>"+
              "<td>" + device.id + "</td>"+
            "</tr>"+
            "<tr -->"+
              "<td>name</td>"+
              "<td>" + device.name + "</td>"+
            "</tr>"+
            "<!-- tr>"+
              "<td>capabilities</td>"+
              "<td>" + device.classes.join(", ") + "</td>"+
            "</tr>"+
            "<tr>"+
              "<td>location</td>"+
              "<td>" + device.location + "</td>"+
            "</tr -->"+
            "<tr>"+
              "<td>url</td>"+
              "<td>" + device.url + "</td>"+
            "</tr>"+
            "<!-- tr>"+
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
            "</tr -->"+
            "<!-- tr>"+
              "<td>coordination</td>"+
              "<td>" + device.location.x + "," + device.location.y + "</td>"+
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
    //var xys = [{x: 220, y: 200},{x: 390, y: 200},{x: 220, y: 350},{x: 390, y: 350},{x: 220, y: 490},{x: 390, y: 490},{x: 220, y: 630},{x: 390, y: 630},{x: 220, y: 770},{x: 390, y: 770},{x: 220, y: 890},{x: 390, y: 890},{x: 220, y: 1030},{x: 390, y: 1030},{x: 220, y: 1170},{x: 390, y: 1170},{x: 220, y: 1310},{x: 390, y: 1310},{x: 1700, y:2300}];
    var obj = {};
    for (var i=0; i<devs.length; i++) {
      // add id property to the device
      devs[i].id = devs[i]._key;
      // add coordination manually since it is not included in json file
      //devs[i].coords = {x:(i%10)*200, y:(Math.floor(i/10))*200};
      //devs[i].coords = {x: devs[i].location.x, y: devs[i].location.y};
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
    // Zooms out so all nodes fit on the canvas
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
    // only if the number of selected nodes are more than 1, then crawling is meaningful
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


  // list of IDs of CURRENTLY selected devices
  var selDevIds = [];
  // list of IDs of CURRENTLY selected apps

  
  // list of currently CURRENTLY selected apps
  var selApps = [];

  var allApps = [];

  /**
   * shows selected device and app nodes on the visualization tool.
   * @param {devIds} list of IDs of NEW selected devices
   * @param {appIds} list of IDs of NEW selected apps
   * @param {selectedDevs} list of selected devices
   * @param {queriedApps} list of selected apps
   */
  //function select(devIds, appIds, selectedDevs4Update, queriedApps) {
  function select(devIds, appIds, selectedDevs, queriedApps) {

    // makes all currently selected device nodes deselected on the visualization tool
    nodes.update(selDevIds.map(function(id) {
      return {
        id: id,
        group: groupForDevice(allDevices[id])
      };
    }));
    // makes new selected device nodes selected on the visualization tool
    nodes.update(devIds.map(function(id) {
      return {
        id: id,
        group: groupForDevice(allDevices[id], true) // + ':selected'
      };
    }));

    // makes all currently selected app nodes deselected on the visualization tool
    //nodes.update(selApps.map(function(app) {
    nodes.update(allApps.map(function(app) {
      return {
        id: "app:" + app.id,
        group: groupForApp(app)
      };
    }));
    // makes new selected app nodes selected on the visualization tool
    nodes.update(queriedApps.map(function(app) {
        return {
          id: "app:" + app.id,
          //group: groupForApp() + ':selected'
          group: groupForApp(app, true)
        };
      })
    );

    // Update curently selected devices and nodes with the new selection
    selDevIds = devIds;
    

    selApps = queriedApps;

    // list of devices: queried devices 
    // + devices that host queried apps
    $scope.selectedDevices = selectedDevs;

    $scope.camera.fit();
    $scope.camera.checkCrawling();
  }


  // used by view. Saves user input for device query.
  $scope.query = "";

  // querry is bound to user input (query textbox in the UI).
  // Whenever user changes query, it will change the internal devQuery.
  // This way user inputs will influence the visualizatiion tool to select devices and/or apps,
  // but selecting nodes manually on the visualization tool will not influence (change) the user input.
  $scope.$watch("query", function(newValue, oldValue){
    $scope.devQuery = $scope.query;
      deviceManager.queryDevicess($scope.query)
        .then(function(devices){
          console.log($scope.query);
          $scope.resultQuery = $scope.query ? JSON.stringify(devices, null, 2) : "";
        })
        .catch(function(err){
          $scope.resultQuery = JSON.stringify(err, null, 2);
        });
  });

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

  // The Vis.js network object, assigned on Vis.js onload event
  var network;

  // Selects devices based on what's in device query + app query fields
  // This is called every time either of them changes
  function updateSelection() {

    console.log('updateSelection');

    // list of queried apps
    var queriedApps = [];
    // list of ids of queried apps
    var queriedAppIds = [];
    // list of ids of queried devices or devices that host queried apps
    var queriedDevIds = [];
    // list of queried devices or devices that host queried apps
    var queriedDevs = [];
    // list of ids of all queried nodes (apps + devices)
    var queriedAppsAndDevs = [];

    // makes a local copy of queries. So If queries changes meanwhile, it will not hav a side effect.
    //var appQuery = $scope.appQuery;
    var devQuery = $scope.devQuery;

    // if there is any query to query apps or devices
    //if(devQuery || appQuery){
    if(devQuery){
      console.log("entered");
      console.log(devQuery);
      var res = "none";
      deviceManager.queryDevicess(devQuery)
        .then(function(items){

          //console.log(devices);
          items.forEach(function(item){

            res = isDevOrApp(item);
            //console.log(res);
            if(res == "app"){
              console.log(res);
                queriedApps.push(item);
                queriedAppIds.push("app:" + item.id);
            } else if (res == "device"){
              console.log(res);

              queriedDevIds.push(item._key);
              queriedDevs.push(item);

              if (item.apps) {
                item.apps.forEach(function(app){
                  queriedApps.push(app);
                  queriedAppIds.push("app:" + app.id);
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
                  queriedDevIds.push(dev._key);
                  queriedDevs.push(dev);
                });
                return {queriedDevIds: queriedDevIds, queriedAppIds: queriedAppIds, queriedDevs: queriedDevs, queriedApps: queriedApps}
              });
          } else {
            return {queriedDevIds: queriedDevIds, queriedAppIds: queriedAppIds, queriedDevs: queriedDevs, queriedApps: queriedApps}
          }

        }).then(function(data){
         
          console.log(data);
          queriedAppsAndDevs = data.queriedDevIds.concat(data.queriedAppIds);
          findSelectedDevCaps(data.queriedDevs);
          network.selectNodes(queriedAppsAndDevs);
          select(data.queriedDevIds, data.queriedAppIds, data.queriedDevs, data.queriedApps);

          /*queriedAppsAndDevs = queriedDevIds.concat(queriedAppIds);
          findSelectedDevCaps(queriedDevIds);
          network.selectNodes(queriedAppsAndDevs);
          select(queriedDevIds, queriedAppIds, queriedDevs, queriedApps);*/
        }).catch(function(err){
          findSelectedDevCaps(queriedDevIds);
          network.selectNodes(queriedAppsAndDevs);
          select(queriedDevIds, queriedAppIds, queriedDevs, queriedApps);
        });
    } else {
      findSelectedDevCaps(queriedDevIds);
      network.selectNodes(queriedAppsAndDevs);
      select(queriedDevIds, queriedAppIds, queriedDevs, queriedApps);
    }
  }

  // Whenever device query changes, update selection.
  $scope.$watch('devQuery',function(newValue, oldValue){
    //console.log(newValue);
    //console.log("device query changed");
    if(network) {
      updateSelection();
    }
  });

  var img = new Image();
  img.src = "/images/Department.png";
  
  var isParamsNotSelected = true;
  // Vis.js events
  $scope.graphEvents = {
    onload: function(_network) {
      network = _network;
      updateSelection();
      if(isParamsNotSelected) { 
        $scope.showSelectionsInMap();
        isParamsNotSelected = false;
      };
    },    
    beforeDrawing: function(ctx){
      ctx.save();
      ctx.translate(-500, -140);
      ctx.rotate(19 * Math.PI/180);
      ctx.drawImage(img, 150, -400, 3222, 2291);
      //ctx.drawImage(img, 0, 0, 200, 200);
      ctx.restore();
    },
    selectNode: selectClick,
    deselectNode: selectClick
  };

  $scope.showSelectionsInMap = function() {
    if($scope.selectedDevIds && $scope.selectedAppIds) {
      console.log($scope.selectedDevIds);
      var queriedAppsAndDevs = $scope.selectedDevIds.concat($scope.selectedAppIds);
      network.selectNodes(queriedAppsAndDevs);
      select($scope.selectedDevIds, $scope.selectedAppIds, [], []);
    }
  };

  $scope.devList;
  $scope.loadDevices = function () {
    return deviceManager.queryDevicess().then(function(devices) {
      console.log(devices);
      $scope.devList = devices;
      var devs = deviceListAsObject(devices);
      console.log(devs);

     
      // if you want to remove visual devices,
      // comment this line and uncomment the next line
      //return deviceManager.addMockDevicesTo(allDevices);
      return devs; // a promise can return a synchroous value
    }).then(function(devs){
      //console.log("before changing allDevices");
      allDevices = devs;
      //console.log("after changing allDevices");
      updateNodesAndEdges();
      //$scope.$apply();
      return "done";
    });
  }

  var timer;

  function loadDevicesIntervally(interval){
    
    // loading of the devices
    $scope.loadDevices();
    
    if(timer){
      clearInterval(timer);
    }
    timer = setInterval(function(){
      $scope.loadDevices();
    },
    interval);
  }

    
  // loading of the devices
  loadDevicesIntervally(60000);
  
  // when the has changed the timer for refreshing visualization interface should be canceled.
  $scope.$on("$destroy", function(){
    if(timer){
      clearInterval(timer);
    }
  });
  

  // Update Vis.js nodes and edges
  // look at setTheData() function http://visjs.org/examples/network/data/datasets.html
  function updateNodesAndEdges() {
    var localAllApps = [];
    var edgesArray = [];
    var nodesArray = Object.keys(allDevices).map(function(id) {
      return nodeFromDevice(allDevices[id]);
    });

    for (var i in allDevices) {
      var d = allDevices[i];
      var apps = d.apps;
      if (apps && apps.length > 0) {
        nodesArray.push.apply(nodesArray, apps.map(nodeFromApp));
        localAllApps.push.apply(localAllApps, apps);
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
    $scope.graphData = {
      nodes: nodes,
      edges: edges
    };
    allApps = localAllApps;
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

    //console.log("selectClick is called");
    //console.log(params);

    var selDevices = params.nodes.filter(isDeviceNodeId);
    var selApps = params.nodes.filter(isAppNodeId);

    $scope.deselectProject();

    var a = JSON.stringify(selDevices);
    var b = JSON.stringify(selApps.map(function(id) { return parseInt(id.slice(4,id.length)); }));
    
    $scope.devQuery = 'let devs1 = (for device in devices\n' +
                'for app in device.apps[*]\n' +
                        'filter app.id in ' + b + ' \n' +
                                'return distinct device)\n'    +
      'let devs2 = (for dev in devs1\n' +
          'let apps = (\n' +
            'for app in dev.apps[*]\n' +
            'filter app.id in ' + b + ' \n' +
            'return app)\n' +
          'return merge_recursive(unset(dev, "apps"),{apps: apps})) \n' +
      'let dev2Ids = (for dev in devs2 return dev._key)\n' +
      'let devs3 = (for device in devices filter device._key in ' + a + ' and device._key not in dev2Ids\n' +
                          'return merge(unset(device,"apps"),{apps: []}))\n' +
      'for dev in APPEND(devs2, devs3) return dev\n';

    $scope.$apply();  // Needed?
  }
 
  // gets two array and find the node which is in first selection but not in second selection.
  function findDeselectedNode(newSelection, oldSelection){
    return oldSelection.filter(function(device){
      return newSelection.indexOf(device) == -1;
    })[0];
  }

  // selected device capabilities : an array that represents device capabilities of all selected devices
  // here selected devices means the devices that are queried directly by devicequery 
  // + devices that hosts apps that are the results of appquery
  var selDevCaps = [];

  function findSelectedDevCaps(selDevs){

    console.log(selDevs);

    selDevCaps = selDevs.map(function(selDev){
      return selDev.classes;
    });

    console.log(selDevCaps);
  }

////////////////// Start of update process mechanism

  $scope.updating = false;

  // Returns a promise for executing the update project to the app in the device.
  function updateAppPromise(device, app, update){
    var devUrl = device.url;
    var appId = app.id;
    return $http({
      method: 'PUT',
      url: '/api/projects/' + update.project + '/package',
      data: {deviceUrl: devUrl, appId: appId}
    })
    .then(function(res){
      // increases number of successfull updates
      $scope.numSuccessUps++;
      return res;
    })
    .catch(function(err){
      // increases number of failed updates
      $scope.numFailUps++;
      return err;
    });
  }

  // Returns a promise for executing the update object in the device
  function updateAppsPromise(device, update){
    //return Promise.all(device.matchedApps.map(function(app){
    return Promise.all(device.apps.map(function(app){
      return updateAppPromise(device, app, update);
    }));
  }

  // Returns a promise for executing the update object.
  function updatePromise(update){
    return Promise.all(update.selectedDevices.map(function(device){
      return updateAppsPromise(device, update);
    }));
  }

  // updates
  $scope.update = function() {
    
    loadDevicesIntervally(3000);
    
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
        loadDevicesIntervally(60000);
        $scope.loadDevices();
      });
  };

////////////////// End of update process mechansim
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



  ///////// <start> ---- This section is for deleting apps 
  
  $scope.deleting = false;
  
  $scope.removeApps = function () {
    
    loadDevicesIntervally(3000);

    $scope.numDels = selApps.length;
    $scope.numSuccessDels = 0;
    $scope.numFailDels = 0;

    $scope.deleting = true;

    Notification.info('Delete process started');
  
    console.log($scope.selectedDevices);

    //var devs = $scope.selectedDevs4Update.map(function(dev){
    var devs = $scope.selectedDevices.map(function(dev){
      //var apps = dev.matchedApps.map(function(app){
      var apps = dev.apps.map(function(app){
        return {id: app.id};
      });
      return {url: dev.url, matchedApps: apps};
    });

    console.log(devs);

    $http({
      method: 'DELETE',
      url: '/api/projects/delete',
      data: {devices: devs},
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
    .then(function(res){
      console.log(res);
      // number of successful eployments
      $scope.numSuccessDels = res.data.numberOfSuccess;
      // number of failed deployments
      $scope.numFailDels = res.data.numberOfFailure;
      Notification.info('Delete process completed');
      loadDevicesIntervally(60000);
      $scope.loadDevices();
    })
    .catch(function(err){
      console.log(err);
      Notification.error('Delete process encountered some problems!');
      loadDevicesIntervally(60000);
      $scope.loadDevices();
    });
  }


  ///////// <end> ---- This section was for deleting apps 

  $scope.deselectProject = function(){
    // model for project select list
    $scope.selectedProject = null;
  }

  $scope.deselectProject();

  $scope.$watch('selectedProject', function(){
    $scope.selectDevicesForProject();
  });

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
        if (!dcs || !dcs.length) {
          // No deviceCapabilities, query everything *
          $scope.devQuery = 'FOR device IN devices RETURN MERGE(UNSET(device,"apps"),{apps:[]})'; 
        }
        else {
          //$scope.devQuery = '.' + dcs.join('.');
          $scope.devQuery = 'For device IN devices FILTER device.classes[*] ALL IN ' + JSON.stringify(dcs) + ' RETURN MERGE(UNSET(device,"apps"),{apps:[]})';
        }
      });
    };
  }

  if($stateParams.project){
    Project.get({project:$stateParams.project}, function(project){
      $scope.selectedProject = project;
      $scope.selectDevicesForProject();
    });
  }

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

