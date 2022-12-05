const mongoose = require('../../config/mongoose')
const { Schema, Types } = require('mongoose')

const betTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userRunningId: { type: Number, required: true, index: true },
  username: { type: String, required: true },
  roundId: { type: String, required: true, index: true },
  groupId: { type: String, required: true, index: true },
  betAmount: { type: Types.Decimal128, required: true },
  turnover: { type: Types.Decimal128, required: true },
  winlose: { type: Types.Decimal128, required: true },
  balance: {
    before: { type: Types.Decimal128, default: 0 },
    after: { type: Types.Decimal128, default: 0 },
  },
  type: { type: String, required: true, index: true, default: 'BET', enum: ['BET', 'PAYOUT'] },
  bet: { type: Schema.Types.Mixed, default: {} },
  payout: { type: Schema.Types.Mixed, default: {} },
  createdDate: { type: Date, default: new Date() },
  updatedDate: { type: Date, default: new Date() },
});

module.exports = mongoose.main.model('BetTransaction', betTransactionSchema);
betTransactionSchema.index({ 'createdDate': -1 })
betTransactionSchema.index({ 'updatedDate': -1 })

