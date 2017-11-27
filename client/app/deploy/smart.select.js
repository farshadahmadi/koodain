angular.module('koodainApp')
    .directive('selectAllRows', function(){
        return {
            require: '^stTable',
            template: '<input type="checkbox">',
            scope: {
                allDataRows: '=allDataRows',
                selectedRows: '=selectedRows'
            },
            link: function(scope, element, attr) {
                scope.areAllRowsSelected = false;
                element.bind('click', function(evt){
                    console.log(scope.allDataRows);
                    console.log(scope.selectedRows);
                    
                    scope.$apply(function() {
                        scope.allDataRows.forEach(function(row){
                            row.isSelected = scope.areAllRowsSelected;
                        })
                    })
                });

                scope.$watchCollection('selectedRows', function(newVal) {
                    console.log("Inside watch selectedRows: ", scope.selectedRows);
                    
                    var selectedCount = newVal.length;
                    var allRowCount = scope.allDataRows.length;
                    if(selectedCount === allRowCount && selectedCount > 0 && allRowCount > 0) {
                        element.find('input').prop('checked', true);
                        scope.areAllRowsSelected = false;
                    }
                    else {
                        element.find('input').prop('checked', false);
                        scope.areAllRowsSelected = true;
                    }
                })
            }
        }

});


angular.module('koodainApp')
    .directive('selectRow', function(){
        return {
            require: '^stTable',
            template: '<input type="checkbox">',
            scope: {
                rowData: '=rowData'
            },
            link: function(scope, element, attr, ctrl){
                element.bind('click', function(evt){
                    scope.$apply(function(){
                        ctrl.select(scope.rowData, 'multiple');
                    });
                });
                
                scope.$watch('rowData.isSelected', function(newVal, oldVal) {
                    console.log("Inside rowData selectionchange: ", scope.rowData);
                    console.log("Inside rowData selectionchange: ", newVal, oldVal);
                    
                        if(newVal === true) {
                            element.parent().addClass('st-selected');
                            element.find('input').prop('checked', true);
                        }
                        else {
                            element.parent().removeClass('st-selected');
                            element.find('input').prop('checked', false);
                        }
                   
                });

            }
        }
    });