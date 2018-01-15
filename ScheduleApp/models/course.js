const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    type: {
        type: String
    },
    name: {
        type: String
    },
    term: {
        type: String
    },
    description: {
        type: String
    },
    creditHours: {
        type: String
    },
    meetTimes: {
        type: String
    },
    instructor: {
        type: String
    }
}, {
    collection: 'lookup'
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;