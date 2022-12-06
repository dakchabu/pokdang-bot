const mongoose = require('../../config/mongoose')
const { Types } = require('mongoose')

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  groupId: { type: String, required: true },
  id: { type: Number, required: true },
  wallet: {
    balance: { type: Types.Decimal128, default: 0 },
    buyIn: { type: Types.Decimal128, default: 0 },
    balanceHolding: { type: Types.Decimal128, default: 0 },
    lastUpdated: { type: Date, default: new Date() },
  },
  role: { type: String, default: 'MEMBER' },
  permission: {
    isCreateAdmin: { type: Boolean, default: false }
  },
  isSuspended: { type: Boolean, default: false },
  createdDate: { type: Date, default: new Date() }
});

module.exports = mongoose.main.model('User', userSchema);
userSchema.index({ 'createdDate': -1 })
