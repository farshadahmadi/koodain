var request = require('request-promise');

//const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJub2RlLW1vbmdvMiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJpZGUtdG9rZW4tc3ZqcHEiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiaWRlIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiZTgyNDk2OTctMDk3Zi0xMWU3LTg1NTYtNTRhYjNhY2E4YWM4Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50Om5vZGUtbW9uZ28yOmlkZSJ9.YQAOW6tTWCwd99GSzEhoI4kgpQ0bCld2YDg5n8US1_IgLIt2Dstx6_nlaKyN08RSAWZick19vpvdqSdgiSvek1WAwmrHir7evNkSA9tdGt_boFjyk1xbsnaI-HCDzVBCbccN9w9s-tqIgUI_4899z3WShv3DKVoyTIghNbHMmXRUa_zWBJjzMPhrt_bB7nyW2AdaWstjGNUzqlz7jdZ2XwPHXDzo0eNwX0EK4flGVMt9qAWb7uimuwteN5xRBGcTY91A4ky7CC09vKigW1RNBJRVX0n9Z0MkVOuTtu8iqr5gAxHkHdpatJfwstWriI2aAXSZHu6quMPr3IaGAA4UGQ";

const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJpbXBhY3QtaWRlIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImlkZS10b2tlbi04eHJycCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJpZGUiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiI5NDE4MzYwZS1jOTNkLTExZTctODMyZi01NGFiM2FjYThhYzgiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6aW1wYWN0LWlkZTppZGUifQ.Z-Y_z02w_bs6rutxNPbAJX8KqFTc-Wt24Rpj3OWfkrPREWYf1vahn7jbLVpvz-1Dhq89PzXwwZ309qA0A5Wisl3rO6kndDDsYik8SYMdGPyp1njHO16lFyeNfjdiCVCeBsfrsfYennVmQXg5Fnofqsg9DnPo8Phykk0l9vB4D4X6Xmd_jH6yttfVes8D04jnatd8BVdAVdYjOBBxsTEpweyGRALH8DAnTxCW4t70JrN_DK8PyHFFdzv9tND0Ni7sXP7Pen7zyqOaFsT_9_CRtWFRbOktwTX2syH6nZ99h5k5tsN18bKYyzK4QFP3AIEUvLCOxZxxucL1BPphXTLjMA"


//const URL = "https://ocp.msv-project.com:8443/oapi/v1/namespaces/node-mongo2";
const URL = "https://ocp.msv-project.com:8443/oapi/v1/namespaces/impact-ide";

//const URL = "https://openshift.default.svc.cluster.local/api/v1/namespaces/node-mongo2";

/*exports.getApi = function(){

  var option = {
    uri: "https://ocp.msv-project.com:8443/oapi/v1",
    method: "GET",
    strictSSL: false
  }

  return request(option);
}*/


exports.createBuildConfig = function(buildConfig){

  var option = {
    uri: URL + "/buildconfigs",
    method: "POST",
    body: buildConfig,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getBuildConfigs = function(){

  var option = {
    uri: URL + "/buildconfigs",
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getBuild = function(buildName){

  var option = {
    uri: URL + "/builds/" + buildName,
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getBuilds = function(){

  var option = {
    uri: URL + "/builds",
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getDeploymentConfigs = function(){

  var option = {
    uri: URL + "/deploymentconfigs",
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getDeploymentConfig = function(dcName){

  var option = {
    uri: URL + "/deploymentconfigs/" + dcName,
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getImageStreams = function(){

  var option = {
    uri: URL + "/imagestreams",
    method: "GET",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.getDeployment = function(depName){

  var option = {
    uri: URL + "/replicationcontrollers/" + depName,
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
    uri: URL + "/imagestreams",
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
    uri: URL + "/deploymentconfigs",
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

exports.replaceDeploymentConfig = function(dcName, depConfig){

  var option = {
    uri: URL + "/deploymentconfigs/" + dcName,
    method: "PUT",
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
    uri: URL + "/routes",
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

exports.deleteDeploymentConfig = function(dcName){

  var option = {
    uri: URL + "/deploymentconfigs/" + dcName,
    method: "DELETE",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.deleteBuildConfig = function(bcName){

  var option = {
    uri: URL + "/buildconfigs/" + bcName,
    method: "DELETE",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.deleteBuild = function(bName){

  var option = {
    uri: URL + "/builds/" + bName,
    method: "DELETE",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.deleteRoute = function(rName){

  var option = {
    uri: URL + "/routes/" + rName,
    method: "DELETE",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.deleteImageStream = function(isName){

  var option = {
    uri: URL + "/imagestreams/" + isName,
    method: "DELETE",
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}

exports.triggerBuild = function(bName){

  var option = {
    uri: URL + "/buildconfigs/" + bName + "/webhooks/1234/generic",
    method: "POST",
    //body: route,
    headers: {
      authorization: "Bearer " + token
    },
    strictSSL: false,
    json: true
  }

  return request(option);
}
