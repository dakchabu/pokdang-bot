const mongoose = require('../../config/mongoose')
const { Schema } = require('mongoose')

const reportSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  winloseReport: { type: Schema.Types.Mixed, default: {} },
});

module.exports = mongoose.main.model('Report', reportSchema);
