const mongoose = require('../../config/mongoose');
const { Schema } = require('mongoose');
const { Types } = require('mongoose');


const transactionLogSchema = new mongoose.Schema({
  approveByUsername: { type: String, required: true, index: true },
  approveByUserId: { type: String, required: true, index: true },
  amount: { type: Types.Decimal128, required: true },
  balance: {
    before: { type: Types.Decimal128, required: true },
    after: { type: Types.Decimal128, required: true },
  },
  type: { type: String, required: true, enum: ['ADD', 'DEDUCT'], index: true },
  memberUsername: { type: String, required: true, index: true },
  memberId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: new Date() },
});

module.exports = mongoose.main.model('transactionLog', transactionLogSchema);
transactionLogSchema.index({ 'timestamp': -1 })
