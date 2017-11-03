module.exports = function($app, $router, $request, console, listEndpoints, getEndpointDetails, event, getNumberOfEndpoints, createLifecycleEventSubscription){
$app.$configureInterval(true, 3000);

$app.$initialize = function(initCompleted){
    $app.guyName = "World!";
    initCompleted();
};

$app.$task = function(taskCompleted) {
    console.log("hello " + $app.guyName);
    taskCompleted();
};

$app.$terminate = function(terminateCompleted){
    console.log("See you " + $app.guyName);
    terminateCompleted();
};
}
