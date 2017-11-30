'use strict';

angular.module('koodainApp')
  .directive('liotFooter', function() {
    return{
      restrict: 'E',
      scope: {},
      link: function(scope, elem, attr) {
        scope.currentPage = attr.currentPage;
        scope.steps = [
          {pagename: 'addDevice', desc: 'Add a device to network', substeps: true},
          {pagename: 'home', desc: 'Monitor device(s) and application(s)', substeps: false},
          {pagename: 'projects', desc: 'Explore/Create project(s)', substeps: false},
          {pagename: 'projectcode', desc: 'Edit code, capabilities, APIs', substeps: true},
          {pagename: 'deploy', desc: 'Deploy/update applications', substeps: false},
          {pagename: 'APIs', desc: 'Add or Edit API templates', substeps: false}
        ];
      },
      templateUrl: "components/footer/footer.html" 

    };
  });
