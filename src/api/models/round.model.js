const mongoose = require('../../config/mongoose')
const { Schema } = require('mongoose')

const roundSchema = new mongoose.Schema({
  roundId: { type: Number, required: true, default: 0 },
  groupId: { type: String, required: true },
  roundStatus: { type: String, required: true, default: 'OPEN' },
  result: { type: Schema.Types.Mixed, default: {} },
  resultComfirmed: { type: Boolean, default: false },
  createdByUserId: { type: String, required: true },
  createdByUsername: { type: String, required: true },
  createdDate: { type: Date, default: new Date() },
  updatedDate: { type: Date, default: new Date() },
});

module.exports = mongoose.main.model('Round', roundSchema);
