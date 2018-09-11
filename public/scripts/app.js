'use strict';

angular.module('employeeApp',['ngRoute','ngFileUpload', 'infinite-scroll'])
    .config(['$routeProvider',function($routeProvider){
        $routeProvider.when("/list", {
                templateUrl: "views/list.html",
                controller:"listController"
        });
        $routeProvider.when("/list/:param", {
                templateUrl: "views/list.html",
                controller:"listController"
        });
         $routeProvider.when("/viewDetail/:param", {
                templateUrl: "views/empDetail1.html",
                controller:"empDetailController"
        });
        
        $routeProvider.when("/add", {
                templateUrl: "views/addEmp.html",
                controller:"empAddController"
        });
        $routeProvider.when("/edit/:param", {
                templateUrl: "views/editEmp.html",
                controller:"empEditController"
        });
        $routeProvider.otherwise({
            templateUrl:"views/list.html",
             controller:"listController"
        });
        
        
    }])

// a filter to return the direct reports of the selected employee
.filter('directReports', function() {

  // Create the return function 
  return function(employees,directReport) {
      var out = [];
      //if filter is not selected, return all the employees
      if(directReport === undefined || directReport === null){
         out = out.concat(employees);
      }
      else {
        angular.forEach(employees, function(emp) {
            if (directReport.indexOf(emp._id) != -1 ){
                out.push(emp);                     
            }
        })
      }

    return out;
  }

});

angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250);