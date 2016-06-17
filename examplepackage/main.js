
var Agent = require('./agent');

function MainClass(){
    
    var app = Agent();
    
    var greeting = "";
    
    app.configureInterval(true, 3000);
    
    app.initialize = function(startMain){
        greeting = "World!";
        startMain();
    };
    
    app.main = function(restartMain) {
        console.log("hello " + greeting);
        restartMain();
    };
    
    app.terminate = function(stopExecution){
        console.log("See you " + greeting);
        stopExecution("");
    };
    
    return app;
}


function createAgentObject() {
  var obj = MainClass();
  return obj;
}

// Do not change basepath
var basePath = "/api";

