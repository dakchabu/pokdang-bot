const mongoose = require('../../config/mongoose')
const { Types } = require('mongoose')

const userSchema = new mongoose.Schema({
  userId: { type: Number },
  username: { type: String },
  refUsername: { type: String },
  wallet: {
    balance: { type: Types.Decimal128, default: 0 },
    balanceHolding: { type: Types.Decimal128, default: 0 },
    lastUpdated: { type: Date, default: new Date() },
  },
  role: { type: String, default: 'MEMBER' },
  isSuspended: { type: Boolean, default: false },
});

module.exports = mongoose.main.model('User', userSchema);
