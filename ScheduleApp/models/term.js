const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    type: {type: String},
    term: {type: String},
    startDate: {type: String},
    endDate: {type: String}
}, { collection : 'lookup' });

const Term = mongoose.model('Term', termSchema);

module.export = Term;