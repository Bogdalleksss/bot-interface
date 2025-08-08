const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

const HistorySchema = new mongoose.Schema({
  _id: ObjectId,
  ticker: String,
  market: String,
  timestamp: Number,
  fee: {
    type: Number,
    default: 0
  },
  tx: String,
  side: {
    type: String,
    enum: ['reverse', 'default', 'in', 'out'],
  },
  type: {
    type: String,
    enum: ['deposit', 'withdraw']
  }
}, { strict: true });

const HistoryModel = mongoose.model('HistoryModel', HistorySchema);

module.exports = { HistoryModel, HistorySchema }
