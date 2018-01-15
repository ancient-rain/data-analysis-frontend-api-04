const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    type: {
        type: String
    },
    term: {
        type: String
    },
    username: {
        type: String
    },
    name: {
        type: String
    },
    year: {
        type: Number
    },
    majors: {
        type: [String]
    },
    minors: {
        type: [String]
    },
    graduationDate: {
        type: String
    },
    courses: {
        type: [String]
    }
}, {
    collection: 'lookup'
});

module.exports = mongoose.model('Student', studentSchema);