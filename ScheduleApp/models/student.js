const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    type: String,
    term: String,
    username: String,
    name: String,
    year: String,
    majors: [String],
    minors: [String],
    graduationDate: String,
    courses: [String]
});

const Student = mongoose.model('Student', studentSchema);

module.export = Student;