/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/visualdevices              ->  index
 */

'use strict';

var kubernetes = require("./kubernetes-api-caller.js");
var openshift = require("./openshift-api-caller.js");
var errorHandler = require('../common').errorHandler;
var fs = require("fs-extra-promise");
var path = require("path");
var ejs = require('ejs');

// Gets a list of hosts
exports.list = function (req, res) {

  openshift.getBuildConfigs().then(function(buildConfigs){

    //console.log(buildConfigs);

    var bcs = JSON.parse(buildConfigs);

    var bps = bcs.items
    .filter(function(buildConfig){
      return (buildConfig.metadata.labels.app != "ide1" && buildConfig.metadata.labels.app != "resource-registry")
    })
    .map(function(buildConfig){
      return {lastBuildName: buildConfig.metadata.labels.app + "-" + buildConfig.status.lastVersion};
    }).map(function(buildInfo){
      return openshift.getBuild(buildInfo.lastBuildName);
    });

    /*var dps = bcs.items.map(function(buildConfig){
      return {lastDeployentName: buildConfig.metadata.labels.app + "-1"};
    }).map(function(DepInfo){
      return openshift.getDeployment(depInfo.lastDeployentName);
    });*/

    Promise.all(bps).then(function(builds){
      //console.log(builds);
      var bs = builds.map(function(build){
        var b = JSON.parse(build);
        return {name: b.metadata.labels.app, buildStatus: b.status.phase};
      });
      /*Promise.all(dps).then(function(deps){
        console.log(deps);
        var ds = deps.map(function(dep){
          var b = JSON.parse(build);
          return {name: dep.metadata.labels.app, depStatus: b.status.phase};
        });
        res.status(200).send(bs);
      });*/
      res.status(200).send(bs);
    });

  }).catch(errorHandler(res));


  /*kubernetes.getHosts().then(function(hosts){
    console.log(hosts);
    res.status(200).send(hosts);
  }).catch(errorHandler(res));*/
}

// create a host
exports.create = function (req, res) {

  openshift.getBuildConfigs().then(function(buildConfigs){

    //console.log(buildConfigs);

    var bcs = JSON.parse(buildConfigs);

    var hostsNumber = bcs.items
    .filter(function(buildConfig){
      return (buildConfig.metadata.labels.app != "ide1" && buildConfig.metadata.labels.app != "resource-registry")
    })
    .map(function(buildConfig){
      return {lastBuildName: buildConfig.metadata.labels.app + "-" + buildConfig.status.lastVersion};
    }).length;

    return hostsNumber;
  }).then(function(hostNumber){

    var vars = {
      project:{
        name: req.body.hostname,
        git: {
          url: "https://github.com/farshadahmadi/liquidiot-server.git",
          //ref: "oc-singleprocess"
          ref: "impact"
        }
      },
      device: {
        url:null,
        location:{
          x: (hostNumber % 4) * 400,
          y: Math.floor(hostNumber / 4) * 400
        }
      },
      deviceManager: {
        url: "http://resource-registry-node-mongo2.paas.msv-project.com/"
      }
    };

    //var files = ["./routes/imagestream.json","./routes/buildconfig.json","./routes/deploymentconfig.json","./routes/service.json","./routes/route.json"];
    var files = ["imagestream.json","buildconfig.json","service.json","route.json"];

    var fileContents = files
      .map(function(file){
        var filePath = path.resolve(__dirname, file);
        var fileContent = fs.readFileSync(filePath, "utf8");
        fileContent = ejs.render(fileContent, vars);
        return JSON.parse(fileContent);
      });

    //res.status(200).send(fileContents);

    openshift.createImageStream(fileContents[0])
      .then(function(result){
        return openshift.createBuildConfig(fileContents[1]);
      }).then(function(result){
        return kubernetes.createService(fileContents[2]);
      }).then(function(result){
        return openshift.createRoute(fileContents[3]);
      }).then(function(result){
        vars.device.url = "http://" + result.spec.host;
        var dcPath = path.resolve(__dirname, "deploymentconfig.json");
        var dcContent = fs.readFileSync(dcPath,"utf8");
        dcContent = ejs.render(dcContent, vars);
        return openshift.createDeploymentConfig(JSON.parse(dcContent));
      }).then(function(result){
        //console.log(result);
        res.status(200).send(result);
      }).catch(errorHandler(res));
  })
}
