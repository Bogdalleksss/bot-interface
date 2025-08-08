import express from 'express';
import mongoose, { connect, set } from 'mongoose';
const cors = require('cors');
import { TradeModel, TradeSchema } from "./models/trade.model";
import { HistoryModel, HistorySchema } from "./models/history.model";
// import socketIO from "socket.io";

export default (app) => {
  set("strictQuery", false)
  connect('mongodb://admin:QGfcYjT0O-Kgf4Y@202.182.98.33:27017/arb_bot_newbd12334')
    .then(() => console.log('MongoDB is connected!'));
  const pumpConnection = mongoose.createConnection('mongodb://admin:QGfcYjT0O-Kgf4Y@2.57.215.208/arb_bot_newbd12334_pf')
  const coinexConnection = mongoose.createConnection('mongodb://admin:0_stepa_0@167.179.65.41:27017/arb_bot')
  const bitmartConnection = mongoose.createConnection('mongodb://admin:0_stepa_0@45.32.15.178:27017/arb_bot')

  const pumpTradeModel = pumpConnection.model('TradeModel', TradeSchema)
  const coinexTradeModel = coinexConnection.model('TradeModel', TradeSchema)
  const bitmartTradeModel = bitmartConnection.model('TradeModel', TradeSchema)

  const pumpHistoryModel = pumpConnection.model('HistoryModel', HistorySchema)
  const coinexHistoryModel = coinexConnection.model('HistoryModel', HistorySchema)
  const bitmartHistoryModel = bitmartConnection.model('HistoryModel', HistorySchema)

  app.use(express.json());
  app.use(cors());

  app.get('/trades', async (req, res) => {
    try {
      const [trades, pump_trades, coinex_trades, bitmart_trades] = await Promise.all([
        TradeModel.find({})
          .maxTimeMS(120000) // 2 минуты на запрос
          .lean(), // ускоряет обработку
        pumpTradeModel.find({})
          .maxTimeMS(120000)
          .lean(),
        coinexTradeModel.find({})
          .maxTimeMS(120000)
          .lean(),
        bitmartTradeModel.find({})
          .maxTimeMS(120000)
          .lean(),
      ]);
      res.json([...trades, ...pump_trades, ...coinex_trades, ...bitmart_trades]);
    } catch (e) {
      console.error('Error fetching trades:', e);
      res.status(500).json({ error: 'Failed to fetch trades: \n' + e.message });
    }
  });
  app.get('/history', async (req, res) => {
    try {
      const [history, pump_history, coinex_history, bitmart_history] = await Promise.all([
        HistoryModel.find({})
          .maxTimeMS(120000) // 2 минуты на запрос
          .lean(), // ускоряет обработку
        pumpHistoryModel.find({})
          .maxTimeMS(120000)
          .lean(),
        coinexHistoryModel.find({})
          .maxTimeMS(120000)
          .lean(),
        bitmartHistoryModel.find({})
          .maxTimeMS(120000)
          .lean(),
      ]);

      res.json([...history, ...pump_history, ...coinex_history, ...bitmart_history]);
    } catch (e) {
      console.error('Error fetching history:', e);
      res.status(500).json({ error: 'Failed to fetch history: \n' + e.message });
    }
  });

  // app.post('/bar', (req, res) => {
  //   res.json(req.body);
  // });

  // optional support for socket.io

  // let io = socketIO(http);
  // io.on("connection", client => {
  //   client.on("message", function(data) {
  //     // do something
  //   });
  //   client.emit("message", "Welcome");
  // });
}
