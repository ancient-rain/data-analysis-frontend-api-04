const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: String,
    description: String,
    creditHours: String,
    meetTimes: String,
    intructor: String
});

const facultySchema = new mongoose.Schema({
    username: String,
    name: String,
    dept: String,
    advisees: [String]
});

const studentSchema = new mongoose.Schema({
    username: String,
    name: String,
    year: String,
    majors: [String],
    minors: [String],
    gradDate: String,
    courses: [String]
});

const Student = mongoose.model('Student', studentSchema);
const Faculty = mongoose.model('Faculty', facultySchema);
const Course = mongoose.model('Course', courseSchema);


const termSchema = new mongoose.Schema({
    name: String,
    startDate: String,
    endDate: String,
    courses: [Course],
    faculty: [Faculty],
    students: [Student]
});


const Term = mongoose.model('Term', termSchema);
module.exports = Term;