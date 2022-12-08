const mongoose = require('../../config/mongoose')

const backOfficeSchema = new mongoose.Schema({
  gameGroupId: { type: String, required: true, index: true },
  backOfficeGroupId: { type: String, required: true, index: true },
  lineNotify: { type: String, required: true, index: true },
  gameGroupName: { type: String },
  backOfficeGroupName: { type: String },
});

module.exports = mongoose.main.model('BackOffice', backOfficeSchema);
