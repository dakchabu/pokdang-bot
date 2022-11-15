const mongoose = require('../../config/mongoose')
const { Types } = require('mongoose')

const roundSchema = new mongoose.Schema({
  roundId: { type: Number, require: true, default: 0},
  roundStatus: { type: String, require: true, default: false },
  result: { type: String },
});

module.exports = mongoose.main.model('Round', roundSchema);
