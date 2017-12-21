const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    username: String,
    name: String,
    dept: String,
    advisees: [String]
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;