const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
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
    dpet: {
        type: String
    },
    advisees: {
        type: [String]
    }
}, {
    collection: 'lookup'
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.export = Faculty;