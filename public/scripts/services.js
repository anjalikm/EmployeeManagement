angular.module('employeeApp')
.factory('empFactory',['$http', function($http) {
    var empFact = {};
   
    empFact.getAllEmployees = function(){
         return $http.get("/employees");
    };
    empFact.editEmployee = function(editedEmp){
        var cur_id =  editedEmp._id;
        return($http.put("/employees/"+ cur_id,editedEmp));
    };
    empFact.addNew = function(newEmp){
         return($http.post("/employees",newEmp));
    };
    
    empFact.getEmployee = function(id){
        //return id th user
        return ($http.get("/employees/"+id));
    };
    
    empFact.getManagers = function(id){
        return($http.get("/employees/managers/"+id));
    };
    
    empFact.deleteEmployee = function(id){
         return $http.delete("/employees/" + id);
    };
    
    return empFact;
}])
.service('filterService',[function(){
    this.filterDirectReport = null;
}])

;
