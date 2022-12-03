const mongoose = require('../../config/mongoose');
const { Schema } = require('mongoose');
const { Types } = require('mongoose');


const creditLogSchema = new mongoose.Schema({
  approveBy: { type: String , required: true },
  amount: { type: Types.Decimal128, required: true },
  forMember: { type: String, required: true },
  memberId: { type: String, required: true },
  timeStamp: { type: Date, default: new Date() },
});

module.exports = mongoose.main.model('CreditLog', creditLogSchema);
