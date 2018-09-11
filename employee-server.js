// employee-server
"use strict;"
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var fileUpload = require('express-fileupload');
var fs = require('fs');


var app = express();

app.use(multipart({
    uploadDir: ""
}));
//get the models for the employees
var Employee = require('./models/employee');

//database connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://anjali:1234@jello.modulusmongo.net:27017/ysynov9Y');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//configure path for client request for static files
app.use(express.static(path.join(__dirname, '/public')));

//app.use(express.bodyParser({uploadDir:'public/profile_images'}));
/***** Routes for REST API ********/

//get the instance of the router
var router = express.Router();
//middleware for all kinds of requests
router.use(function(req,res,next){
     console.log("New Request arrived");  
     next(); //make sure to continute to handle the request
});
//define routes

router.route('/employees')

    .delete(function(req,res){
        Employee.remove({},function(err){
            if(err)
                res.send(err);
            var dir = __dirname + "/public/uploads";
            //remove all profile images
            fs.readdir(dir, function(err,files){
                if(err)
                    console.log(err);
                else{
                    var f ;
                    for(f = 0 ; f < files.length; f++){
                        console.log(files[f]);
                        fs.unlink(dir+"/" + files[f],function(err){
                            if(err)
                                console.log(err);
                        });
                    }
                }
            });
            res.json({message:"All the employees deleted"});
        });
        
    })
    //get all the employees
    //request - GET http://localhost:port/employees
    .get(function(req,res){
       Employee.find(function(err,employees){
           if(err)
               res.send(err);
           res.json(employees);
       }) ; 
    })

    //create a new employee
    //request - POST http://localhost:port
    .post(function(req,res){
          var emp = new Employee();
          emp.name = req.body.name;
          emp.title = req.body.title;
          emp.sex = req.body.sex;
          emp.startDate = new Date("2016-08-01");
          emp.phone = req.body.phone;
          emp.SMS = req.body.SMS;
          emp.email = req.body.email;
          emp.manager = req.body.manager;
          console.log(emp.manager);
          emp.save(function(err,employee){
              if(err)
                  res.send(err);
                  //on success update directReports of the manager
                  if(emp.manager != null || emp.manager != undefined){
                  Employee.findById(employee.manager,
                        function(err,man){
                            if(err)
                                res.send(err);
                                    //add directReports of the manager
                                    console.log("updating directreports of manager:"+man.name);
                                    man.directReports.push(employee._id);
                                    //save the updated manager
                                    man.save(function(err){
                                        if(err)
                                            res.send(err);
                                        res.json(employee);
                                    });
                            
                        });
                    }//end of if manager!=null
                    else {
                        console.log("sending back new employee.");
                        res.json(employee);
                    }
                });
        }); //end of post

router.route('/employees/:emp_id')
    //get the employee with id emp_id
    //request GET localhost:port/employees/emp_id
    .get(function(req,res){
        var record={}; // respond record
        Employee.findById(req.params.emp_id,
                         function(err,emp){
                         if(err)
                             res.send(err);
                         //on success get the manager record also if he has a manager
                         if(emp != null && (emp.manager != null || emp.manager != undefined)){
                            Employee.findById(emp.manager,function(err,man){
                                if(err)
                                    res.send(err);
                                record = {employee:emp,manager:man};
                                res.json(record);   
                            });
                        }
                        else{
                            record = {employee:emp,manager:null};
                            res.json(record);
                        }
                        
     });
    
    
    })//end of GET
    //delete the employee with id emp_id
    //request DELETE localhost:port/employees/emp_id
    .delete(function(req,res){
        //find the employees reporting to this employee
        //and set their manager as null of the employee to be deleted
        // also update this employee's manager's direct reports if any 
        Employee.findById(req.params.emp_id,
                          function(err,emp){
                            if(err)
                                res.send(err);
                            console.log(emp.name);
                            //get the directReports of this emp
                            var directReports = emp.directReports;
                            var manager = emp.manager;
                            Employee.remove({_id:req.params.emp_id},function(err){
                                if(err)
                                    res.send(err);
                                //on success update the managers of directReports
                                var d = 0;
                                for(d = 0 ; d < directReports.length; d++){
                                    Employee.findById(directReports[d],
                                                    function(err,rep_emp){
                                       //update the manager only
                                        rep_emp.manager = null;
                                        rep_emp.save(function(err){
                                            if(err)
                                                res.send(err);
                                
                                        });
                                    });
                                } //end of for
                                //on removing employee update his manager's direct reports
                                if(manager != undefined || manager != null){
                                    Employee.findById(manager,function(err,man){
                                        var index = man.directReports.indexOf(req.params.emp_id);
                                        man.directReports.splice(index,1);
                                        man.save(function(err){
                                            if(err)
                                                res.send(err);
                                        });
                                    });
                                }
                                
                            });
                res.json({"message": "Employee deleted successfull!"});
            
        });
        
    }) //end of DELETE

    //update the employee with id = emp_id
    //request PUT localhost:port/employees/emp_id
    .put(function(req,res){
        console.log("put req received");
        Employee.findById(req.params.emp_id,function(err,emp){
            var manager_changed = false;
            var ex_manager ;
            if(err)
                res.send(err);
            if(emp.manager != req.body.manager){
                manager_changed = true;
                ex_manager = emp.manager; // save the ex_manager to update directReports
            }
            console.log("ex_manager:"+ex_manager);
            emp.name = req.body.name;
            emp.title = req.body.title;
            emp.sex = req.body.sex;
            emp.startDate = new Date("2016-08-01");
            emp.phone = req.body.phone;
            emp.SMS = req.body.SMS;
            emp.email = req.body.email;
            emp.manager = req.body.manager;
            if( req.body.image != undefined)
                emp.image = req.body.image;
            
            emp.save(function(err){
                if(err)
                    res.send(err);
                /* on success handle 4 cases of manager change
                1. if manager is not changed - do nothing
                2. if manager is set to none - update directReports of ex-manager
                3. if manager is set to new manager - update directReports of ex-manager 
                                                      and new manager
                4. if manager is changed from null to new manager - update only new manager */
                if(manager_changed){
                    //case 2
                    if(emp.manager == null || emp.manager == undefined){
                        Employee.findById(ex_manager,function(err,ex_man){
                            //remove the deleted employee from the directReports
                            var index = ex_man.directReports.indexOf(req.params.emp_id);
                            console.log("updating only ex manager as new manager is null");
                            ex_man.directReports.splice(index,1);
                            ex_man.save(function(err){
                                if(err)
                                    res.send(err);
                                res.json({"message":"Employee and ex_manager updated successfully"});
                            });
                        });
                    }
                    else {
                        //case 4.
                        if(ex_manager === null || ex_manager === undefined){
                            //upate only new manager's direct reports
                                Employee.findById(emp.manager,function(err,new_man){
                                    if(err)
                                        res.send(err);
                                    new_man.directReports.push(req.params.emp_id);
                                    console.log("updating only new manager as ex_manager was null");
                                    new_man.save(function(err){
                                        if(err)
                                            res.send(err);
                                        res.json({"message":"Employee and new manager updated successfully!"})
                                    });
                                });
                        }
                        else{
                            //case 3
                            //first change ex_manager's dorectReports
                            Employee.findById(ex_manager,function(err,ex_man){
                                //remove the deleted employee from the directReports
                                console.log("case3. updating ex manager and");
                                var index = ex_man.directReports.indexOf(req.params.emp_id);
                                ex_man.directReports.splice(index,1);
                                ex_man.save(function(err){
                                    if(err)
                                        res.send(err);
                                    //change new manager's directReports
                                    Employee.findById(emp.manager,function(err,new_man){
                                        if(err)
                                            res.send(err);
                                        new_man.directReports.push(req.params.emp_id);
                                         console.log("case3. updating new manager");
                                        new_man.save(function(err){
                                            if(err)
                                                res.send(err);
                                            res.json({"message":"Employee updated successfully!"})
                                        });
                                    });

                                });
                            });
                        } //end of case 3
                    }
                }
                else
                    res.json({"message":"Employee updated successfully-simple"});
            });
            
        });
    }); //end of PUT

var all_emps; // to hold all the employees synchoronously
//helper function to get the employee synchronously 
var getEmployee = function(id){
    var k ;
    console.log(all_emps.length);
    for(k = 0 ; k < all_emps.length; k++){
        if(all_emps[k]._id == id)
            return(all_emps[k]);
    }
    return null;
};
//get managers for this existing employee
//should return the managers excluding the employee himself and all his inferiors
//to avoid cyclid dependancy

//use depth first search to find all the inferiors
//initialize datastructures for Depth First Search

var reporters = [];
var visited = {};
var DFSReportes = function(id){
    var visiting_emp = getEmployee(id);
    visited[id] = true;
    reporters.push(id.toString());
    var i ;
    if(visiting_emp != null){
        for(i = 0 ; i < visiting_emp.directReports.length; i++){
              if(visited[visiting_emp.directReports[i]] === null || visited[visiting_emp.directReports[i]] === undefined){
                  //this employee is not visited
                  visited[visiting_emp.directReports[i]] = true;
                  DFSReportes(visiting_emp.directReports[i]);
                 // reporters.push(visiting_emp.directReports[i]);
              }      
        }
    }
};

//filter all the the direct and indirect reporters 
var findEllegibleManagers = function(id){
    reporters = [];
    visited = {};
    //find first all the direct reporters of this employee
     DFSReportes(id);
     console.log(reporters);
     var k;
     var elg_managers = [];
    //filter the reporters from all the employees
    
    for(k = 0 ; k < all_emps.length; k++){
        //add to elligeble managers if he is not a reporter
        if(reporters.indexOf(all_emps[k]._id.toString()) === -1){
            //console.log("adding managers:"+all_emps[k].name);
            elg_managers.push(all_emps[k]);
        }
    }
    //console.log("managers:" + elg_managers);
    return elg_managers;           
}

//request for all the elligible managers for the current
//employee to be edited with id emp_id
//router.route('/employees/:emp_id')

router.route('/employees/managers/:emp_id')
    
    .get(function(req,res){
        //find the current employee to be edited
    
        var cur_emp_id = req.params.emp_id; Employee.findById(req.params.emp_id,function(err,cur_emp){
           if(err)
               res.send(err);
            //on finding the current employee
            // get all the employees
            Employee.find(function(err,emps){
                all_emps = emps;
                var elg_managers = findEllegibleManagers(cur_emp_id.toString());
                res.json(elg_managers);
            });
        });
    
});

router.route('/employees/images/:emp_id')
   .post(function(req,res){
    
        if(!req.files.file){
            res.send("no files were uploaded..");
        } 
        console.log(req.files.file);
        var cur_emp_id = req.params.emp_id;
        var imageFile = req.files.file;
        console.log(imageFile.name); 
        console.log("file path:"+ req.files.file.path);
        //using current timestamp as the filename to generate unique filenames
        
        var d = new Date();
        
        var newFileName = d.getTime().toString()+ ".jpg";
        var newPath = __dirname + "/public/uploads/"+ newFileName;
        fs.readFile(req.files.file.path, function (err, data) {
            fs.writeFile(newPath, data, function (err) {
                if(err)
                    res.send(err);
                //on success update image fieldname in employee collection
                Employee.findById(cur_emp_id,function(err,emp){
                    if(err)
                        res.send(err);
                    emp.image = "/uploads/"+newFileName;
                    emp.save(function(err){
                        if(err)
                            res.send(err);
                        res.json({"message":"employee's profile images uploaded successfully"});
                    });
                });
            });
        }); 
    
   });



var printManagers = function(){
    console.log("print reporters:"+reporters);
};
//tesing DFS
//findEllegibleManagers("58123a7779eb1b1e42e952d7");
//console.log("reporters:"+reporters);
var port = 8009;

app.use('/',router);

app.listen(port);

console.log("employee server listening on 8009 ...");

