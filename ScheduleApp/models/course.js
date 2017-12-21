const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: String,
    roseId: String,
    creditHours: Number
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;

