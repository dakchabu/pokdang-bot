const mongoose = require('../../config/mongoose')

const matchSchema = new mongoose.Schema({
  groupId: { type: String, required: true, index: true },
  type: { type: String, default: 'OPEN', enum: ['OPEN', 'CLOSE'], index: true },
  createdDate: { type: Date, default: new Date() },
  updatedDate: { type: Date, default: new Date() },
});

module.exports = mongoose.main.model('Match', matchSchema);
matchSchema.index({ 'groupId': 1, 'roundStatus': 1 }, { unique: true, partialFilterExpression: { type: { $eq: 'OPEN' } } })
