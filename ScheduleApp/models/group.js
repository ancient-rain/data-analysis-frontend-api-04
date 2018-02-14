const mongoose = require('mongoose');


const groupSchema = new mongoose.Schema({
    type: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    students: {
        type: [String],
        required: true
    },
    faculty: {
        type: [String],
        required: true
    }
}, {
    collection: 'lookup'
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;