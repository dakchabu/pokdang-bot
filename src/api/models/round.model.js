const mongoose = require('../../config/mongoose')
const { Schema } = require('mongoose')

const roundSchema = new mongoose.Schema({
  roundId: { type: Number, required: true, default: 0, index: true },
  matchId: { type: String, required: true, index: true},
  groupId: { type: String, required: true, index: true },
  roundStatus: { type: String, required: true, default: 'OPEN', enum: ['OPEN', 'RESULT', 'CLOSE'] },
  result: { type: Schema.Types.Mixed, default: {} },
  createdByUserId: { type: String, required: true },
  createdByUsername: { type: String, required: true },
  createdDate: { type: Date, default: new Date() },
  updatedDate: { type: Date, default: new Date() },
});

module.exports = mongoose.main.model('Round', roundSchema);
roundSchema.index({ 'matchId': 1, 'roundStatus': 1 }, { unique: true, partialFilterExpression: { roundStatus: { $eq: 'OPEN' } } })
