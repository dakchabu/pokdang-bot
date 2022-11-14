const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId
const Decimal128 = require('mongoose').Types.Decimal128

const userSchema = new mongoose.Schema({
  userId: { type: Number },
  username: { type: String },
  refUsername: { type: String },
  balance: { type: Decimal128, default: 0 },
  role: { type: String, default: 'member'},
  deduct: { type: String, default: false }
});

module.exports = mongoose.model('User', userSchema);
