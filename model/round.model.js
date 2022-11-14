const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  round: { type: Number, require: true, default: 0},
  roundStatus: { type: Boolean, require: true, default: false },
  lastResult: { type: String },
});

module.exports = mongoose.model('Round', roundSchema);
