const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    type: {
        type: String
    },
    groupName: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    forClass: {
        type: Boolean,
        required: true
    },
    members: {
        type: [String],
        required: true
    }
}, {
    collection: 'lookup'
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;