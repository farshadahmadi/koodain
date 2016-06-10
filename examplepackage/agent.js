function Agent(repeat, interval){
    
    var that = {};
    
    // public functions that will be overriden by applications
    that.main;
    that.initialize;
    that.terminate;
    
    // private property
    var timer = true;
    
    // public properties
    that.repeat = repeat || true;
    that.interval = interval || 1000;
    
    that.configureInterval = function(repeat, interval) {
        that.repeat = repeat;
        that.interval = interval;
    }
    
    var createInterval = function(f, param, interval) {
        setTimeout( function() {f(param);}, interval );
    }
    
    var s = function() {
        createInterval(that.main, function(restartMainMessage){
            if(restartMainMessage){
                console.log(restartMainMessage);
            }
            if(timer) {
                s();
            } else {
                that.terminate(function(stopExecutionMessage){
                    if(stopExecutionMessage){
                        console.log(stopExecutionMessage);
                    }
                });
            }
        }, that.interval);
    };
    
    that.start = function() {
      that.initialize(function(startMainMessage){
          if(startMainMessage){
              console.log(startMainMessage);
          }
              timer = true;
              that.main(function(restartMainMessage){
                  if(restartMainMessage){
                      console.log(restartMainMessage);
                  }
                  console.log("app-started-without-error");
                  if(that.repeat) {
                      s();
                  }
              });
      });
    };
    
    that.stop = function() {
        timer = false;
        if(!that.repeat) {
            that.terminate(function(stopExecutionMessage){
                if(stopExecutionMessage){
                    console.log(stopExecutionMessage);
                }
            });
        }
    };
        
    return that;
}

module.exports = Agent;


