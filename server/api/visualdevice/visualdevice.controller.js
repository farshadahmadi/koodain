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

  // get all build configs
  openshift.getBuildConfigs().then(function(buildConfigs){

    var globalRcs;

    var buildPromises = buildConfigs.items
      // filter the build configs that their name starts with host
      .filter(function(buildConfig){
        //return (buildConfig.metadata.labels.app != "ide1" && buildConfig.metadata.labels.app != "resource-registry")
        return buildConfig.metadata.labels.app.startsWith('siotad-');
      })
      // extract the most important information of build config (name and last build number)
      .map(function(buildConfig){
        return {lastBuildName: buildConfig.metadata.labels.app + "-" + buildConfig.status.lastVersion};
      })
      // get the list of 'get build' promises
      .map(function(buildInfo){
        return openshift.getBuild(buildInfo.lastBuildName);
      });

    // get all builds
    Promise.all(buildPromises)
      .then(function(builds){
        // extract the most important information of builds (name and status)
        var bs = builds.map(function(b){
          var key = b.metadata.labels.app;
          return {name: b.metadata.labels.app, buildStatus: b.status.phase}
        });

        var depConfigPromises = bs
          // extract the builds that are completed
          .filter(function(build){
            return build.buildStatus === 'Complete';
          })
          // get the list of 'deployment config' promises
          .map(function(build){
            return openshift.getDeploymentConfig(build.name);
          })

        Promise.all(depConfigPromises)
          .then(function(depConfigs){
              return depConfigs
                // extract the most important information of deployment configs (name and last deployment version)
                .map(function(dc){
                  return {lastDeploymentName: dc.metadata.labels.app + "-" + dc.status.latestVersion};
                })
                // get the list of 'deploynet (AKA replication controllers)' promises
                .map(function(deploymentInfo){
                  return kubernetes.getReplicationController(deploymentInfo.lastDeploymentName);
                });
          })
          .then(function(rcPromises){
            return Promise.all(rcPromises);
          })
          .then(function(rcs){
            globalRcs = rcs;

            // get all pods
            return kubernetes.getPods()
              .then(function(allPods){
                return allPods.items
                  // filter the pods that are for a specific host
                  .filter(function(pod){
                    return pod.metadata.labels.app && pod.metadata.labels.app.startsWith('siotad-');
                    //return pod.metadata.labels.app === hostName;
                  });
                // map the list of "pods" to the list of "delete pod promises"
                /*.map(function(pod){
                  return kubernetes.deletePod(pod.metadata.name);
                });*/
              });

          })
          .then(function(pods){

            //console.log(pods);

            var ps = pods.map(function(p){
              //var key = p.metadata.labels.app;
                return {name: p.metadata.labels.app, podStatus: p.status.phase};
              });
                  
            var podsObj = {};
            ps.forEach(function(p){
              podsObj[p.name] = p;
            });

            console.log(ps);

                  var dps = globalRcs
                    // extract the most important information of deployment (name and status)
                    .map(function(rc){
                      //var key = rc.metadata.labels.app;
                      return {name: rc.metadata.labels.app, deploymentStatus: rc.metadata.annotations['openshift.io/deployment.phase']};
                    });

                  var dpsObj = {};
                  dps.forEach(function(dp){
                    dpsObj[dp.name] = dp;
                  });

                  // combine build information with the deployment information
                  bs.forEach(function(build){
                    // if there is an deployment status just add it to the build info
                    if(build.buildStatus !== 'Complete'){
                      build.deploymentStatus = 'Not started';
                      build.podStatus = 'Not started';
                      //build.deploymentStatus = dpsObj[build.name].deploymentStatus;
                    // if there is not deployment started, yet the build does not started.
                    } else {
                      build.deploymentStatus = dpsObj[build.name].deploymentStatus;
                      if(build.deploymentStatus === 'Complete'){
                        build.podStatus = podsObj[build.name].podStatus;
                      } else {
                        build.podStatus = 'Not started';
                      }
                      //build.deploymentStatus = 'Not started';
                    }
                    // remove siotad- from the name of build
                    build.name = build.name.slice(7);
                  });

                  console.log(bs);

                  res.status(200).send(bs);
          });
      });
  })
  .catch(errorHandler(res));
}

// create a host
exports.create = function (req, res) {

  openshift.getBuildConfigs().then(function(bcs){

    //console.log(buildConfigs);

    //var bcs = JSON.parse(buildConfigs);

    var hostsNumber = bcs.items
    .filter(function(buildConfig){
      //return (buildConfig.metadata.labels.app != "ide1" && buildConfig.metadata.labels.app != "resource-registry")
      return buildConfig.metadata.labels.app.startsWith('siotad-');
    })
    .map(function(buildConfig){
      return {lastBuildName: buildConfig.metadata.labels.app + "-" + buildConfig.status.lastVersion};
    }).length;

    return hostsNumber;
  }).then(function(hostNumber){

    var vars = {
      project:{
        name: 'siotad-' + req.body.hostname,
        namespace: 'impact-ide',
        //name: 'host' + hostNumber,
        //name: 'host3',
        git: {
          //url: "https://github.com/farshadahmadi/liquidiot-server.git",
          //ref: "oc-singleprocess"
          url: "https://github.com/farshadahmadi/liquidiot-server.git",
          //ref: "research-development-newframework"
          ref: "research-development-newframework-separateprocesses"
        }
      },
      device: {
        url:null,
        location:{
          x: (hostNumber % 4) * 400,
          y: Math.floor(hostNumber / 4) * 400
        }
      },
      rr: {
        url: "http://resource-registry-impact-ide.paas.msv-project.com/"
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

// remove a host
exports.remove = function(req, res){
  var hostName = 'siotad-' + req.params.host;

  openshift.getBuilds()
    .then(function(allBuilds){
      return allBuilds.items
        .filter(function(build){
          return build.metadata.labels.app === hostName;
        })
        .map(function(build){
          return openshift.deleteBuild(build.metadata.name);
        });
    })
    .then(function(pBuilds){
      // delete all builds
      return Promise.all(pBuilds);
    })
    .then(function(){
      // delete build config
      return openshift.deleteBuildConfig(hostName);
    })
    .then(function(){
      // delete deployment config
      return openshift.deleteDeploymentConfig(hostName);
    })
    .then(function(){
      return kubernetes.getReplicationControllers()
        .then(function(allRcs){
          return allRcs.items
            .filter(function(rc){
              return rc.metadata.labels.app === hostName;
            })
            .map(function(rc){
              return kubernetes.deleteReplicationController(rc.metadata.name);
            });
        });

    })
    .then(function(pRcs){
      // delete all replication controllers (actually deployments)
      return Promise.all(pRcs);
    })
    .then(function(){
      // delete route
      return openshift.deleteRoute(hostName);
    })
    .then(function(){
      // delete service
      return kubernetes.deleteService(hostName);
    })
    .then(function(){
      // get all image streams
      return openshift.getImageStreams()
        .then(function(allIss){
          return allIss.items
            // filter the image streams that are for a specific host
            .filter(function(is){
              return is.metadata.labels.app === hostName;
            })
            // map the list of "image streams" to the list of "delete image stream promises"
            .map(function(is){
              return openshift.deleteImageStream(is.metadata.name);
            });
        });

    })
    .then(function(pIss){
      // delete all image streams
      return Promise.all(pIss);
    })
    .then(function(){
      // get all pods
      return kubernetes.getPods()
        .then(function(allPods){
          return allPods.items
            // filter the pods that are for a specific host
            .filter(function(pod){
              return pod.metadata.labels.app === hostName;
            })
            // map the list of "pods" to the list of "delete pod promises"
            .map(function(pod){
              return kubernetes.deletePod(pod.metadata.name);
            });
        });

    })
    .then(function(pPods){
      // delete all pods
      return Promise.all(pPods);
    })
    .then(function(response){
      res.status(200).json({response: response});
    })
    .catch(errorHandler(res));

  //console.log(hostName);
  //res.status(200).json({host: hostName});
}

exports.trigger = function(req, res){
  var hostName = 'siotad-' + req.params.host;
  openshift.triggerBuild(hostName)
    .then(function(response){
      console.log(response);
      res.status(200).json({hostname: hostName});
    })
    .catch(errorHandler(res));
  //res.status(200).json({hostname: hostName});
  //openshift.triggerBuild();
}

exports.triggerDeployment = function(req, res){

  var hostName = 'siotad-' + req.params.host;

  openshift.getDeploymentConfig(hostName)
    .then(function(dc){
      // one way to trigger a build is to change the deployment configuration (DC)
      // just changing the DC by editing a n environment variable
      dc.spec.template.spec.containers[0].env[5] = {name: "random_number", value: String(Math.floor(Math.random() * 1000000))};
      //console.log(dc);
      //response.metadata.labels.newlabel = "Hi";
      //response.status.lastVersion = 11;
      return openshift.replaceDeploymentConfig(hostName, dc);
    })
    .then(function(response){
      console.log(response);
      res.status(200).json(response);
    })
    .catch(errorHandler(res));
  //res.status(200).json({hostname: hostName});
  //openshift.triggerBuild();
}
