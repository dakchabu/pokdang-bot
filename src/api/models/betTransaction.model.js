const mongoose = require('../../config/mongoose')
const { Schema } = require('mongoose')

const betTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  roundId: { type: String, required: true, index: true },
  groupId: { type: String, required: true, index: true },
  balance: {
    bet: {
      before: { type: Types.Decimal128, default: 0 },
      after: { type: Types.Decimal128, default: 0 },
    },
    payout: {
      before: { type: Types.Decimal128, default: 0 },
      after: { type: Types.Decimal128, default: 0 },
    }
  },
  type: { type: String, required: true, index: true, default: 'BET' },
  bet: { type: Schema.Types.Mixed, default: {} },
  createdDate: { type: Date, default: new Date(), index: true },
  updatedDate: { type: Date, default: new Date(), index: true },
});

module.exports = mongoose.main.model('BetTransaction', betTransactionSchema);
// betTransactionSchema.index({ 'playId.provider': 1, 'playId.name': 1 }, { unique: true, partialFilterExpression: { role: { $eq: 'MEMBER' } } })
// betTransactionSchema.index({ 'prefix': 1, 'bank.bankCode': 1, 'bank.accountCode': 1 }, { unique: true, partialFilterExpression: { role: { $eq: 'MEMBER' } } })

