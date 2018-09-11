//data entry

//database connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://anjali:1234@jello.modulusmongo.net:27017/ysynov9Y');
//model
var Employee = require('./models/employee');
//sample data
var sample_data = require('./data.json');
Employee.collection.insertMany(sample_data.data, function(err,r) {
     if(err)
         console.log(err);
    console.log(r);
 
      
 });