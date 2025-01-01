const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;
const Mixed = Schema.Types.Mixed;

const TradeSchema = new mongoose.Schema({
  _id: ObjectId,
  timestamp: Number,
  market: String,
  token: String,
  spread: Number,
  size: Number,
  type: {
    type: String,
    default: 'default' // default and reverse
  },
  profit: Number,
  land_time: Mixed,
  order_time: Mixed,
  txid: String,
  status: {
    type: String,
    enum: ['success', 'error', 'success-rebuy', 'error-rebuy'],
    default: 'success'
  },
}, { strict: true });

const TradeModel = mongoose.model('TradeModel', TradeSchema);

module.exports = TradeModel
