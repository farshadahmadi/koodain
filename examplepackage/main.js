
var Agent = require('./agent');

//inherit from Agent
function MainClass(){
  Agent.call(this);
}

MainClass.prototype = Object.create(Agent.prototype);
MainClass.prototype.constructor = MainClass;

MainClass.prototype.preStartFunction = function(startMain){
    console.log("pre-start");
    startMain();
}

MainClass.prototype.preStopFunction = function(stopExecution){
    console.log("pre-stop");
    stopExecution("");
}

MainClass.prototype.mainFunction = function(restartMain) {
    console.log("helloOoOo!");
    restartMain();
}

function createAgentObject() {
  var obj = new MainClass();
  obj.setWork(obj.mainFunction, true, 1000);
  obj.setPreStopWork(obj.preStopFunction);
  obj.setPreStartWork(obj.preStartFunction);
  return obj;
}

// Do not change basepath
var basePath = "/api";

// receives HTTP GET request sent to http://<deviceurl>:8000/app/<app-id>/api/sayhello>
app.get(basePath + "/sayhello", function(req, res){
  res.send("hello!!!");
});
