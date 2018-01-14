const mongoose = require('mongoose');

const facultySchema = mongoose.Schema({
    type: String,
    term: String,
    username: String,
    name: String,
    dpet: String,
    advisees: [String]
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.export = Faculty;