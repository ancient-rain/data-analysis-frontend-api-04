const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema({
    type: {
        type: String
    },
    name: {
        type: String
    },
    term: {
        type: String
    },
    students: {
        type: [String]
    },
    faculty: {
        type: [String]
    }
}, {
    collection: 'lookup'
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;