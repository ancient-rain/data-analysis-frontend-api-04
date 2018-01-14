const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
    type: String,
    term: String,
    startDate: String,
    endDate: String
});

const Term = mongoose.model('Term', termSchema);

module.export = Term;