const mongoose = require('../../config/mongoose')

const BankInfoSchema = new mongoose.Schema({
  groupId: { type: String, required: true, index: true },
  groupName: { type: String, default: 'dakChabu' },
  url: { type: String },
  bankCode: { type: String }
});

module.exports = mongoose.main.model('BankInfoUrl', BankInfoSchema);
