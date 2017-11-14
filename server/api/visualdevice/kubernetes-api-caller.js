var request = require('request-promise');

//const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJub2RlLW1vbmdvMiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJpZGUtdG9rZW4tc3ZqcHEiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiaWRlIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiZTgyNDk2OTctMDk3Zi0xMWU3LTg1NTYtNTRhYjNhY2E4YWM4Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Om5vZGUtbW9uZ28yOmlkZSJ9.YQAOW6tTWCwd99GSzEhoI4kgpQ0bCld2YDg5n8US1_IgLIt2Dstx6_nlaKyN08RSAWZick19vpvdqSdgiSvek1WAwmrHir7evNkSA9tdGt_boFjyk1xbsnaI-HCDzVBCbccN9w9s-tqIgUI_4899z3WShv3DKVoyTIghNbHMmXRUa_zWBJjzMPhrt_bB7nyW2AdaWstjGNUzqlz7jdZ2XwPHXDzo0eNwX0EK4flGVMt9qAWb7uimuwteN5xRBGcTY91A4ky7CC09vKigW1RNBJRVX0n9Z0MkVOuTtu8iqr5gAxHkHdpatJfwstWriI2aAXSZHu6quMPr3IaGAA4UGQ";

const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJpbXBhY3QtaWRlIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImlkZS10b2tlbi04eHJycCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJpZGUiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5NDE4MzYwZS1jOTNkLTExZTctODMyZi01NGFiM2FjYThhYzgiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6aW1wYWN0LWlkZTppZGUifQ.Z-Y_z02w_bs6rutxNPbAJX8KqFTc-Wt24Rpj3OWfkrPREWYf1vahn7jbLVpvz-1Dhq89PzXwwZ309qA0A5Wisl3rO6kndDDsYik8SYMdGPyp1njHO16lFyeNfjdiCVCeBsfrsfYennVmQXg5Fnofqsg9DnPo8Phykk0l9vB4D4X6Xmd_jH6yttfVes8D04jnatd8BVdAVdYjOBBxsTEpweyGRALH8DAnTxCW4t70JrN_DK8PyHFFdzv9tND0Ni7sXP7Pen7zyqOaFsT_9_CRtWFRbOktwTX2syH6nZ99h5k5tsN18bKYyzK4QFP3AIEUvLCOxZxxucL1BPphXTLjMA"

//const URL = "https://ocp.msv-project.com:8443/api/v1/namespaces/node-mongo2";
const URL = "https://ocp.msv-project.com:8443/api/v1/namespaces/impact-ide";

//const URL = "https://openshift.default.svc.cluster.local/api/v1/namespaces/node-mongo2";

function getResource(type, name){

  var option = {
    uri: URL + "/" + (type || "") + (name ? "/" + name : ""),
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false
  }

  return request(option);
}

exports.getHosts = function(){
  return getResource("endpoints")
    .then(function(eps){
      var endpoints = JSON.parse(eps);
      return endpoints.items
        .map(function(endpoint){
          return {name: endpoint.metadata.name, podName: endpoint.subsets[0].addresses[0].targetRef.name};
        }).filter(function(endpoint){
          //console.log(host);
          return (endpoint.name != "ide1" && endpoint.name != "mongodb" && endpoint.name != "mongodbp" && endpoint.name != "resource-registry")
        });
    }).then(function(endpoints){
      var ps = endpoints.map(function(endpoint){
        return getResource("pods", endpoint.podName);
      })
      return Promise.all(ps).then(function(pods){
        return pods.map(function(pd){
          var pod = JSON.parse(pd);
          return {name: pod.metadata.labels.app, status: pod.status.phase};
        });
      });
    });
}

exports.createService = function(service){

  var option = {
    uri: URL + "/services",
    method: "POST",
    body: service,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

/*exports.getApi = function(){

  var option = {
    uri: "https://ocp.msv-project.com:8443/oapi/v1",
    method: "GET",
    strictSSL: false
  }

  return request(option);
}



exports.getBuildConfigs = function(){

  var option = {
    uri: "https://ocp.msv-project.com:8443/oapi/v1/namespaces/node-mongo2/buildconfigs",
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false
  }

  return request(option);
}

exports.createImageStream = function(imageStream){

  var option = {
    uri: "https://ocp.msv-project.com:8443/oapi/v1/namespaces/node-mongo2/imagestreams",
    method: "POST",
    body: imageStream,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.createDeploymentConfig = function(depConfig){

  var option = {
    uri: "https://ocp.msv-project.com:8443/oapi/v1/namespaces/node-mongo2/deploymentconfigs",
    method: "POST",
    body: depConfig,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.createRoute = function(route){

  var option = {
    uri: "https://ocp.msv-project.com:8443/oapi/v1/namespaces/node-mongo2/routes",
    method: "POST",
    body: route,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.createService = function(service){

  var option = {
    uri: "https://ocp.msv-project.com:8443/api/v1/namespaces/node-mongo2/services",
    method: "POST",
    body: service,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}*/
