angular.module('employeeApp')

    .controller('listController',['$scope','$window','$routeParams','filterFilter','empFactory','directReportsFilter','filterService',function($scope,$window,$routeParams,filterFilter,empFactory,directReportsFilter,filterService){
        
        //initialization
        $scope.employees = [];  //all the employees
        $scope.display_employees = [];   //currently displayed employees
        $scope.filteredEmps = $scope.employees;
        $scope.isAscend = false;
        $scope.isDescend = false;
      
        var size = 5;
        var i;
        
        //function definations
        //set search box color to red if not found
        $scope.notFound = function(){
            if($scope.filteredEmps.length == 0)
                return "notFound";
            else
                return "found";
        };
        
        //set the sorting field to clicked one
        $scope.orderByMe = function(fieldName){

           if ($scope.myOrderBy === fieldName) {
                $scope.myOrderBy = '-' + fieldName;
                $scope.isDescend = true;
                $scope.isAscend = false;
            } else if ($scope.myOrderBy === '-' + fieldName) {
                $scope.isAscend = true;
                $scope.isDescend = false;
                $scope.myOrderBy = fieldName;
            } else {
                $scope.myOrderBy = fieldName;
                $scope.isAscend = true;
                $scope.isDescend = false;
            }
        };
        $scope.filterBy = function(directReports){
            $scope.reporters = directReports;
            $scope.$emit('directReports:reporters');
        };
        
        $scope.updateSearchResults = function(){
             $scope.filteredEmps = filterFilter($scope.employees,$scope.searchText);
             if($scope.searchText === '')
                $scope.filteredEmps = $scope.employees;
        };
        //update the search results as the searchtext is being typed
        $scope.$watch('searchText',function() {$scope.updateSearchResults();});
        
        $scope.goToTop = function(){
           $window.scrollTo(0, 0); 
        };
        $scope.goToHome = function(){
           $scope.filterBy(null); 
        }
        //load more items when scrolled to the bottom of the screen
        $scope.loadMore = function(){
           
            var last = $scope.display_employees.length;
            for(var i = last; i < (last + size) && i < $scope.employees.length ; i++) {
                console.log(i);
                $scope.display_employees.push($scope.employees[i]);
            }
        };
        $scope.getName = function(id){
           var k;
           for( k = 0 ; k < $scope.employees.length; k++){
               if($scope.employees[k]._id === id)
                   return($scope.employees[k].name);
           }
        };
        
        
        $scope.getEmployees = function(){
              empFactory.getAllEmployees().
                then(function(response){
                    //console.log(response);
                    $scope.employees = response.data;
                    $scope.filteredEmps = $scope.employees;
                    console.log("got updated employes");
                    //initialize dsiplayed employees 
                    for(i = 0 ; i < size && i < $scope.employees.length; i++){
                    $scope.display_employees.push($scope.employees[i]);
               }
            }); 
        };
        
        $scope.deleteEmployee = function(id){
            console.log("request delete emp:"+id);
            empFactory.deleteEmployee(id).
                then(function(response){
                    $scope.getEmployees ();
                });
        };
        
        $scope.getEmployees ();
        console.log(filterService.filterDirectReport);
        if(filterService.filterDirectReport == null )
            $scope.filterBy(null);
        else
            $scope.filterBy(filterService.filterDirectReport);
    }])

     .controller('empEditController',['$scope','$routeParams','$location','$window','empFactory','Upload',function($scope,$routeParams,$location, $window,empFactory,Upload){
            
            //$scope.employees = [];
            $scope.cur_employee = null;
            $scope.cur_id = $routeParams.param;
            $scope.elgManagers = [];
            $scope.manager_name = "Choose manager";
            $scope.imageChanged = false;
            var old_picFile ="";
         //called when uset selects an manager from dropdown
            $scope.setManager = function(manager){
                if(manager == null){
                    $scope.manager_name = "None";
                    $scope.manager_id = null;
                }
                else{
                    //console.log("manager selected:" + manager.name);
                    $scope.manager_name = manager.name;
                    $scope.manager_id = manager._id;
                }
             }
             $scope.setImageChange = function(){
                 $scope.imageChanged = true;
             };
             
               $scope.uploadPic = function(picFile,id){
                    picFile.upload = Upload.upload({
                            url: 'employees/images/'+id,
                            data: {file: picFile},
                        }).then(function (response) {
                            console.log("image uplaod complete:");
                            console.log(response.data);
                            
                            //use $location to navigate to list page
                            $window.location.href="/#/list";
                        });
            };
           //save the edited employee
            $scope.saveEmployee = function(pFile){
                console.log("saving edited emp");
                console.log($scope.picFile);
                var file_name ="";
                if(pFile == null)
                    file_name ="";
                else
                    file_name = pFile.name;
                console.log("edited image file_name:");
                console.log(file_name);
                var edited_emp ;
                edited_emp = {_id:$scope.cur_id,name:$scope.name,title:$scope.title,phone:$scope.phone,email:$scope.email,manager:$scope.manager_id};
                if( pFile == null)
                    edited_emp = {_id:$scope.cur_id,name:$scope.name,title:$scope.title,phone:$scope.phone,email:$scope.email,image:"",manager:$scope.manager_id};
                empFactory.editEmployee(edited_emp).
                    then(function(response){
                        console.log(response.data);
                        //upload image
                        console.log("olf file:"+old_picFile);
                        console.log(pFile);
                        //if(pFile != null && old_picFile != pFile.name){
                        if($scope.imageChanged){
                            //profile image is changed,uplaod new one
                            console.log("uploading edited image.."); $scope.uploadPic(pFile,$scope.cur_id);
                        }
                        else{
                            //navigate to the home page
                            $window.location.href="/#/list";
                        }
        
                    });
                
            };
            //populate the edit form with old info
            empFactory.getEmployee($scope.cur_id).
                then(function(response){
                $scope.cur_employee = response.data.employee;
                console.log($scope.cur_employee );
                $scope.name = $scope.cur_employee.name;
                $scope.title = $scope.cur_employee.title;
                $scope.phone = $scope.cur_employee.phone;
                $scope.email = $scope.cur_employee.email;
                $scope.picFile = $scope.cur_employee.image;
                console.log($scope.cur_employee.image);
                old_picFile = $scope.cur_employee.image;
                if( response.data.manager != null){
                    $scope.manager_name =  response.data.manager.name;
                    $scope.manager_id = response.data.manager._id;
                }
                else
                    $scope.manager_name = "None";
                empFactory.getManagers($scope.cur_id).
                    then(function(response){
                   console.log(response);
                   $scope.elgManagers = response.data;
               });
           });
        
    }])

     .controller('empAddController',['$scope','$window','empFactory','Upload',function($scope,$window,empFactory,Upload){
            $scope.new_employee = {};
            $scope.incomplete = true;
            $scope.manager_name = "Choose Manager"
            $scope.test = function(){
                $scope.incomplete = false;
                if(!$scope.name || $scope.name.length === 0)
                    $scope.incomplete = true;
            };
            $scope.$watch('name',function() {$scope.test();});
            $scope.setManager = function(new_manager){
                if(new_manager == null){
                    $scope.manager_name = "None";
                    $scope.manager_id = null;
                }
                else{
                    console.log("manager selected:" + new_manager.name);
                    $scope.manager_name = new_manager.name;
                    $scope.new_employee.manager = new_manager._id;
                    $scope.manager_id = new_manager._id;
                }
            }
            $scope.uploadPic = function(picFile,id){
                    picFile.upload = Upload.upload({
                            url: 'employees/images/'+id,
                            data: {file: picFile},
                        }).then(function (response) {
                            //console.log(response);
                            //use $location to navigate to list page
                            $window.location.href="/#/list";
                        });
            };
             $scope.saveEmployee = function(pFile){
                console.log("saving new emp");
                $scope.new_employee.name = $scope.name;
                $scope.new_employee.title = $scope.title;
                $scope.new_employee.phone = $scope.phone;
                $scope.new_employee.email = $scope.email;
                //console.log($scope.imageFiles.fileName);
                empFactory.addNew($scope.new_employee).
                    then(function(response){
                        //response the newly created employee
                        //profile pic upload
                        if(pFile)
                            $scope.uploadPic(pFile,response.data._id);
                        else{
                             //use $location to navigate to list page
                            $window.location.href="/#/list";
                        }
                       
                    });
            };
            empFactory.getAllEmployees().
                then(function(response){
                $scope.employees = response.data;
                
            });
        
    }])

     .controller('empDetailController',['$scope','$routeParams','empFactory','filterService',function($scope,$routeParams,empFactory,filterService){
             $scope.cur_id = $routeParams.param;
             $scope.cur_employee = {};
             filterService.filterDirectReport = null;
             $scope.setFilter = function(){
                 console.log("setting filter...");
                  filterService.filterDirectReport = $scope.cur_employee.directReports;
             };
             empFactory.getEmployee($scope.cur_id).
                then(function(response){
                  $scope.cur_employee = response.data.employee;
                  console.log(response.data);
                  $scope.name = $scope.cur_employee.name;
                  $scope.title = $scope.cur_employee.title;
                  $scope.phone = $scope.cur_employee.phone;
                  $scope.email = $scope.cur_employee.email;
                  $scope.manager_id = $scope.cur_employee.manager;
                  $scope.image = $scope.cur_employee.image;
                 
                  if(response.data.manager != null)
                    $scope.manager = response.data.manager.name;
                  else
                      $scope.manager = null; 
                  if($scope.cur_employee.directReports === null)
                    $scope.directReports = 0;
                  else
                    $scope.directReports = $scope.cur_employee.directReports.length;
             });
    }])

;