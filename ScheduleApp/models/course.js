const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    type: String,
    name: String,
    term: String,
    description: String,
    creditHours: String,
    meetTimes: String,
    instructor: String
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;