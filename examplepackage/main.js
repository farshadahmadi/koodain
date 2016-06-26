module.exports = function(<%= project.name %>){
var greeting = "";

<%= project.name %>.configureInterval(true, 3000);

<%= project.name %>.initialize = function(initCompleted){
    greeting = "World!";
    initCompleted();
};

<%= project.name %>.task = function(taskCompleted) {
    console.log("hello " + greeting);
    taskCompleted();
};

<%= project.name %>.terminate = function(terminateCompleted){
    console.log("See you " + greeting);
    terminateCompleted();
};
}
