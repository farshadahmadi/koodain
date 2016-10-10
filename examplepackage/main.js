module.exports = function(<%= project.name %>){

<%= project.name %>.internal.configureInterval(true, 3000);

<%= project.name %>.internal.initialize = function(initCompleted){
    <%= project.name %>.guyName = "World!";
    initCompleted();
};

<%= project.name %>.internal.task = function(taskCompleted) {
    console.log("hello " + <%= project.name %>.guyName);
    taskCompleted();
};

<%= project.name %>.internal.terminate = function(terminateCompleted){
    console.log("See you " + <%= project.name %>.guyName);
    terminateCompleted();
};
}
