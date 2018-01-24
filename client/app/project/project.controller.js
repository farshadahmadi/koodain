/**
 * Copyright (c) TUT Tampere University of Technology 2015-2016
 * All rights reserved.
 *
 * Main author(s):
 * Antti Nieminen <antti.h.nieminen@tut.fi>
 */
/* globals ace */
/* globals SwaggerParser */
/* globals esprima*/
'use strict';

angular.module('koodainApp')

  /**
   * Controller for the view for editing project sources.
   */
  .controller('ProjectCtrl', function ($scope, $stateParams, $resource, $http, $location, $state, 
    Notification, Upload, project, files, resources, apitocode, deviceManagerUrl, apiParser, $uibModal) {

    // project, files, and resources are resolved in project.js

    // The project to be edited
    $scope.project = project;

    // The source files of the project
    $scope.files = files;

    // The resource files of the project
    $scope.resources = resources;

    // Added by Farshad for debugging
    console.log($scope.project);
    console.log($scope.files);
    console.log($scope.resources);

    $scope.changeView = function(view){
      $state.go("deploy", {project:$scope.project.name});
      //$location.path("/deploy").search('project', $scope.project.name);
    }

    // get the list of device capabilities
    $http({
      method: 'GET',
       url: deviceManagerUrl + '/devicecapabilities'
    }).then(function(res){
      $scope.devCaps = res.data;
      // add free-class category to the list
      $scope.devCaps.push({name:"free-class", description:"not bound to any device"});
      // extract liquidiot.json file
      var liqFile = $scope.files.files.filter(function(f) { return f.name === 'liquidiot.json'; });
      if (liqFile.length > 0) {
        $scope.liquidiotJson = liqFile[0];
        // shows in the device capabilities select wich capabilities were selected
        $scope.selectedDevCaps = JSON.parse($scope.liquidiotJson.content).deviceCapabilities;
      }
    });


    $scope.$watch("selectedDevCaps", function(){
      // get the list of app interfaces
      $http({
        method: 'GET',
        url: deviceManagerUrl + '/apis',
        params: {devcap: $scope.selectedDevCaps}
      }).then(function(res) {
        $scope.apis = res.data;
        // shows in the application interface select wich interfaces were selected
        $scope.selectedAppCaps = JSON.parse($scope.liquidiotJson.content).applicationInterfaces;
      });
    });

    $scope.showAPIs = function() {
      $uibModal.open({
        templateUrl: 'showapis.html',
        controller: 'showAPIsCtrl',
        resolve: {
          implementedAPIs: function() {
            return $scope.selectedAppCaps;
          },
          allAPIs: function() {
            return $scope.apis;
          },
          projectName: function() {
            return $scope.project.name;
          }
      }
      }).result.then(function(result){
        $scope.selectedAppCaps = result;
        $scope.generateCode();
      });
    };

    $scope.generateCode = function(){

      try {
        
        var mainFileContent = $scope.mainFile.content;
        // the list of implemented apis in the code
        var implementedApis = apiParser.getApiList(mainFileContent);
        console.log(implementedApis);
        
        // Synchronizes liquidiot.josn file with the selected
        // device capability and app interfaces
        var liFile = JSON.parse($scope.liquidiotJson.content);
        liFile.applicationInterfaces = $scope.selectedAppCaps;
        liFile.deviceCapabilities = $scope.selectedDevCaps;
        $scope.liquidiotJson.content = JSON.stringify(liFile);

        mainFileContent = apiParser.markAsDirty(implementedApis, $scope.selectedAppCaps, mainFileContent);
        $scope.mainFile.content = mainFileContent;

        var workingApiNames = implementedApis
          .filter(function(api){
            return api.state == "working";
          })
          .map(function(api){
            return api.name;
          });

        for(var i = 0; i < $scope.selectedAppCaps.length; i++){
          if(workingApiNames.indexOf($scope.selectedAppCaps[i]) == -1){
            apitocode.generate($scope.project, deviceManagerUrl + "/apis/" + $scope.selectedAppCaps[i])
              .then(function(code){
                $scope.mainFile.content += code;
              })
              //.catch(function(err){
                //console.log(err);
              //});
          }
        }
      } catch(err){
        Notification.error('Fix all syntax errors in the code and try again.');
      }

    };

    $scope.deleteDirtyApis = function(){
      try {
        var mainFileContent = $scope.mainFile.content;
        // the list of implemented apis in the code
        var implementedApis = apiParser.getApiList(mainFileContent);
        $scope.mainFile.content = apiParser.deleteDirtyApis(implementedApis, mainFileContent);
      } catch(err){
        Notification.error('Fix all syntax errors in the code and try again.');
      }
    }

    // Files that are currently updated, to show a spinner on the view
    $scope.updating = {};

    function turnMainToModule(f){
      //var firstLine = "module.exports = function(" + $scope.project.name  +"){\n";
      var firstLine = "module.exports = function($app, $router, $request, console, listEndpoints, getEndpointDetails, event, getNumberOfEndpoints, createLifecycleEventSubscription){\n";
      var lastLine = "\n}";
      f.content = firstLine + f.content + lastLine;
    }
    
    // Watch modifications to the main.js file,
    // and save the file to the backend on every modification.
    $scope.$watch('mainFile.content', function() {
      var f = angular.copy($scope.mainFile);
      //var f = $scope.mainFile;
      if (f) {
        turnMainToModule(f);
        var u = File.update({name: f.name}, f);
        $scope.updating[f.name] = u.$promise.$$state;
      }
    });

    // Watch modifications to the liquidiot.json file,
    // and save the file to the backend on every modification.
    $scope.$watch('liquidiotJson.content', function() {
      var f = $scope.liquidiotJson;
      if (f) {
        var u = File.update({name: f.name}, f);
        $scope.updating[f.name] = u.$promise.$$state;
      }
    });

    // Ace editor modes
    var modelist = ace.require('ace/ext/modelist');
    var langTools = ace.require("ace/ext/language_tools");
    var lang = ace.require('ace/lib/lang');
    //console.log(ltools);

    var staticWordCompleter = {
      getCompletions: function(editor, session, pos, prefix, callback) {
        //if (prefix.length === 0) { callback(null, []); return };
        var wordList = [
          {
            caption: "createLifecycleEventSubscription",
            snippet: "var ${1:configObject} = {\n\tcriteria: {\n\t\tserialNumbers: ['${2}']\n\t},\n\tevents:['${3}'],\n\tdeletionPolicy: ${4:0},\n\tgroupName:'${5}',\n\tsubsciptionType:'lifecycleEvents'\n}\n createLifecycleEventSubscription(${1:configObject})",
            description: "The device selection criteria is a list of serial numbers."
          },
          {
            caption: "createLifecycleEventSubscription",
            snippet: "var ${1:configObject} = {\n\tcriteria: {\n\t\tmanufacturerData: {\n\t\t\tmake:'${2}',\n\t\t\tmodel:'${3},'\n\t\t\tfirmwareVersion:'${4}'}\n\t},\n\tevents:['${3}'],\n\tdeletionPolicy: ${4:0},\n\tgroupName:'${5}',\n\tsubsciptionType:'lifecycleEvents'\n}\n createLifecycleEventSubscription(${1:configObject})",
            description: "The device selection criteria is a combination of manufacturer-related information like make, model, and firware version."
          },
          {
            caption: "listEndpoints", 
            snippet: "listEndpoints({groupName:'${1}', startOffset: ${2:1}, endOffset:${0:1}})",
            description: "The startOffset must start from 1 and the endOffset must not be bigger than the total number of devces."
          },
          {
            caption: "getNumberOfEndpoints",
            snippet: "getNumberOfEndpoints({groupName:'${0}'})",
            description: "Gets the total number of devices."
          },
          {
            caption: "getEndpointDetails",
            snippet: "getEndpointDetails({serialNumber:'${0}'})",
            description: "The response contains a requestId to which an event should listen to get the asynchronous data"
          },
          {
            caption: "event",
            snippet: "event.on(${1:id}, function(${2:data}){\n\t${0}\n});",
            description: "An event listener which listens to either requestId (for Resource Events) or subscriptionId (for Lifecycle Events) to get their associated asynchronous data."
          },
          {
            caption: "then",
            snippet: ".then(function(${1:res}){\n\t${0}\n})",
            description: "A code helper for promises."
          },
          {
            caption: "catch",
            snippet: ".catch(function(${1:err}){\n\t${0}\n});",
            description: "A code helper for promises."
          }
        ];
        callback(null, wordList.map(function(word) {
          return {
            caption: word.caption,
            meta: "snippet",
            type: "snippet",
            snippet: word.snippet,
            description: word.description
          }
        }));
      },
      getDocTooltip: function(item) {
        if (item.type == "snippet" && !item.docHTML) {
          item.docHTML = [
            "<b>", lang.escapeHTML(item.caption), "</b>", "<hr></hr>",
            lang.escapeHTML(item.description), "<hr></hr>",
            lang.escapeHTML(item.snippet)
          ].join("");
        }
      }
    }

    langTools.setCompleters([staticWordCompleter])

    var projectUrl = '/api/projects/' + $stateParams.project;

    // Open file for editing
    $scope.openFile = function(file) {
      $scope.activeFile = file;
      var mode = modelist.getModeForPath(file.name);
      $scope.activeFile.mode = mode ? mode.name : null;
    };

    // If there is main.js file, open it automatically at start
    var mainJss = files.files.filter(function(f) { return f.name === 'main.js'; });
    if (mainJss.length > 0) {
      $scope.openFile(mainJss[0]);
      $scope.mainFile = mainJss[0];

      var c = $scope.mainFile.content
      console.log('c' + c);
      console.log(c.split("\n"));

      /*var tree = esprima.parse($scope.mainFile.content, {comment:true, range:true, loc:true});
      var lines = $scope.mainFile.content.split("\n");
      console.log(lines);
      var ss = tree.loc.start.line,
          ee = tree.loc.end.line;
      console.log(tree.loc.start.line + " : " + tree.loc.end.line);
      lines.splice(ee -1, 1);
      lines.splice(ss - 1, 1);
      console.log(lines);
      $scope.mainFile.content = lines.join("\n");*/
      
      var lines = $scope.mainFile.content.split("\n");
      console.log(lines);
      lines.splice(lines.length - 1, 1);
      lines.splice(0, 1);
      console.log(lines);
      $scope.mainFile.content = lines.join("\n");
    }

    // Get the editor instance on ace load
    var editor;
    $scope.aceLoaded = function(_editor) {
      editor = _editor;
      editor.$blockScrolling = Infinity;
      editor.setOptions({
        fontSize: '11pt',
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
      });
    };


    var File = $resource(projectUrl+'/files/:name', null, {
      update: {method: 'PUT' }
    });

    // Watch modifications to the edited file,
    // and save the file to the backend on every modification.
    // The "eagerness" of the saving can be controlled with the 'debounce'
    // attribute in the view.
    $scope.$watch('activeFile.content', function() {
      var f = $scope.activeFile;
      if (f.name == "package.json" || f.name == "agent.js") {
        //console.log(f);
        var u = File.update({name: f.name}, f);
        $scope.updating[f.name] = u.$promise.$$state;
      }
    });

    // Upload a source file or resource file to the given backend url
    function upload(file, toUrl) {
      return Upload.upload({
        url: toUrl,
        data: {file: file},
      }).then(function() {
        Notification.success('Uploaded ' + file.name);
      });
    }

    // Upload a source file
    $scope.uploadFile = function(file) {
      var toUrl = projectUrl + '/files';
      upload(file, toUrl).then(function() {
        $scope.files = $resource(toUrl).get();
      });
    };

    // Upload a resource file
    $scope.uploadResource = function(file) {
      var toUrl = projectUrl + '/files/resources';
      upload(file, toUrl).then(function() {
        $scope.resources = $resource(toUrl).get();
      });
    };
  })

  .factory('apitocode', function($q){
    var generate = function(project, apiUrl){
      return $q(function(resolve, reject){
          SwaggerParser.validate(apiUrl)
            .then(function(api){
              var code = "\n/**\n * Application Interface: " + api.info.title + "\n */";
              for(var path in api.paths){
                for(var method in api.paths[path]){
                  code += generateApi(project, method, path);
                }
             }
              resolve(code + "// " + api.info.title + " - end\n");
            })
            //.catch(function(error){
              //reject(error.toString());
            //});
      });
    };

    var generateApi = function(project, method, path){
      return "\n" + "$router." + method + "(\"" + path + "\", function(req, res){});\n"
      //return "\n" + project.name + ".internal.router." + method + "(\"" + path + "\", function(req, res){});\n"
    }

    return {
      generate: generate
    }
  })

  .factory('apiParser', function(){

    // parses the content of a code snippet and returns the list of implemented Apis, their states (dirty or working)
    // and their positions on the file ==> {name:"", state="", range:[]}
    var getApiList = function(codeSnippet){
      var interfaces = [];
      var tree = esprima.parse(codeSnippet, {comment:true, range:true});
      for(var j = 0; j < tree.comments.length; j++){
        var comment = tree.comments[j];
        if(comment.type == "Block" && comment.value.includes("Application Interface")){
          var apiName = "";
          var state = "";
          if(comment.value.indexOf("Application Interface") == 5){
            var substrr = comment.value.substring(28);
            var endIndex = substrr.indexOf("\n");
            apiName = substrr.substring(0, endIndex);
          } else {
            var substrr = comment.value.substring(29);
            var endIndex = substrr.indexOf("\n");
            apiName = substrr.substring(0, endIndex - 1);
          }
          if(comment.value.includes("dirty")){
            state = "dirty";
          } else {
            state = "working";
          }
          interfaces.push({name:apiName, range:[comment.range[0], comment.range[1]], state:state});
        } else if(comment.type == "Line" && (interfaces.length > 0) && 
            comment.value.includes(interfaces[interfaces.length - 1].name)) {
          interfaces[interfaces.length - 1].range.push(comment.range[0]);
          interfaces[interfaces.length - 1].range.push(comment.range[1]);
        }
      }
      return interfaces;
    };

    // mark apis as dirty if they are implemented in the code snippet but not included in the selected api list
    var markAsDirty = function(implementedApis, selectedApis, codeSnippet){

      for(var l = implementedApis.length - 1; l >= 0; l--){
        if(implementedApis[l].state == "working" && selectedApis.indexOf(implementedApis[l].name) == -1){
          console.log(l);
          codeSnippet = codeSnippet.slice(0, implementedApis[l].range[1] - 2)
                              + "* dirty\n "
                              + codeSnippet.slice(implementedApis[l].range[1] - 2, implementedApis[l].range[1])
                              + "\n/*"
                              + codeSnippet.slice(implementedApis[l].range[1], implementedApis[l].range[2])
                              + "*/\n"
                              + codeSnippet.slice(implementedApis[l].range[2]);
        }
      }
      return codeSnippet;
    };

    var deleteDirtyApis = function(implementedApis, codeSnippet){

      for(var l = implementedApis.length - 1; l >= 0; l--){
        if(implementedApis[l].state == "dirty"){
          codeSnippet = codeSnippet.slice(0, implementedApis[l].range[0] - 1)
                              + codeSnippet.slice(implementedApis[l].range[3] + 1);
        } 
      }
      return codeSnippet;
    }

    return {
      getApiList: getApiList,
      markAsDirty: markAsDirty,
      deleteDirtyApis: deleteDirtyApis
    };

  })


  .controller('showAPIsCtrl', function($scope, $resource, $uibModalInstance, allAPIs, implementedAPIs, projectName) {
    $scope.allAPIs = allAPIs;
    $scope.implementedAPIs = angular.copy(implementedAPIs);
    $scope.apisToAdd = [];
    $scope.currentProject = projectName;
    console.log(implementedAPIs);
    $scope.ok = function() {
      $uibModalInstance.close($scope.apisToAdd);
    }
    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    }
     $scope.toggleAPISelection = function toggeleAPISelection(apiName) {
           var idx = $scope.apisToAdd.indexOf(apiName);
           // is currently selected
           if (idx > -1) {
                 $scope.apisToAdd.splice(idx, 1);
                  }
            // is newly selected
            else {
                  $scope.apisToAdd.push(apiName);
                  }
    };

  });
