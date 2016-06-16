
function Agent() {
  this.work = "";
  this.preStopWork = "";
  this.preStartWork = "";
  this.timer = true;
  this.repeat = true;
  this.interval = 1000;
}

Agent.prototype.s = function() {
    this.createInterval(this.work, function(restartMainMessage){
        if(restartMainMessage){
            console.log(restartMainMessage);
        }
        if(this.timer) {
            this.s();
        } else {
            this.preStopWork(function(stopExecutionMessage){
                if(stopExecutionMessage){
                    console.log(stopExecutionMessage);
                }
            });
        }
    }.bind(this), this.interval);
}

Agent.prototype.createInterval = function(f, param, interval) {
    setTimeout( function() {f(param);}, interval );
}

Agent.prototype.setWork = function(mainFunc, repeat, interval) {
  this.work = mainFunc;
  this.repeat = repeat;
  this.interval = interval;
}

Agent.prototype.start = function() {
  this.preStartWork(function(startMainMessage){
      if(startMainMessage){
          console.log(startMainMessage);
      }
          this.timer = true;
          this.work(function(restartMainMessage){
              if(restartMainMessage){
                  console.log(restartMainMessage);
              }
              console.log("app-started-without-error");
              if(this.repeat) {
                  this.s();
              }
          }.bind(this));
      
  }.bind(this));
}

Agent.prototype.setPreStopWork = function(preStopFunc) {
  this.preStopWork = preStopFunc;
}

Agent.prototype.setPreStartWork = function(preStartFunc) {
  this.preStartWork = preStartFunc;
}

Agent.prototype.stop = function() {
    this.timer = false;
    if(!this.repeat) {
        this.preStopWork(function(stopExecutionMessage){
            if(stopExecutionMessage){
                console.log(stopExecutionMessage);
            }
        });
    }
}

module.exports = Agent;
