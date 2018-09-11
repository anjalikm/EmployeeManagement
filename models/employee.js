//model - employee

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
    name : String,
    title : String,
    sex: String,
    phone: String,
    startDate : Date,
    officePhone: String,
    SMS: String,
    email: String,
    manager : String,
    directReports : Array,
    image: String
});

module.exports = mongoose.model('Employee', EmployeeSchema);