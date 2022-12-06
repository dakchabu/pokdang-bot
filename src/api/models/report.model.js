const mongoose = require("../../config/mongoose");
const { Schema, Types } = require("mongoose");

const reportSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  winloseSummary: { type: Types.Decimal128, default: 0 },
  winloseReport: { type: Schema.Types.Mixed, default: {} },
});

module.exports = mongoose.main.model("Report", reportSchema);
