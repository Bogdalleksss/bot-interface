import express from 'express';
import mongoose, { connect, set } from 'mongoose';
const cors = require('cors');
import { TradeModel, TradeSchema } from "./models/trade.model";
import { HistoryModel, HistorySchema } from "./models/history.model";

export default (app) => {
  set("strictQuery", false)
  const connections = [
    mongoose.createConnection('mongodb://admin:0_stepa_0@202.182.116.8:27017/arb_bot'),
    mongoose.createConnection('mongodb://admin:0_stepa_0@5.61.208.89:27017/arb_bot'),
  ]

  const models = connections.map(connection => connection.model('TradeModel', TradeSchema))
  const modelsHistory = connections.map(connection => connection.model('HistoryModel', HistorySchema))

  const config = {
    connections: {
      'ams-1': mongoose.createConnection('mongodb://admin:0_stepa_0@89.23.119.178:27017/arb-test'),
      'ams-1-new': mongoose.createConnection('mongodb://admin:0_stepa_0@89.23.119.178:27017/arb-test'),
      'ams-bg': mongoose.createConnection('mongodb://admin:0_stepa_0@89.42.231.73:27017/arb_bot_newbd12334_cp_profi144_1'),
    }
  }

  const getModelTransferBot = (id, modelName = 'TradeModel') => {
    const connection = config.connections[id]

    const models =  {
      TradeModel: connection.model('TradeModel', TradeSchema),
      HistoryModel: connection.model('HistoryModel', HistorySchema),
    }

    return models[modelName]
  }

  app.use(express.json());
  app.use(cors());

  app.get('/trades', async (req, res) => {
    try {
      const requests = models.map(model => model.find({}).maxTimeMS(120000).lean())
      const results = await Promise.all(requests);
      res.status(200).json(results.flat());
    } catch (e) {
      console.error('Error fetching trades:', e);
      res.status(500).json({ error: 'Failed to fetch trades: \n' + e.message });
    }
  });

  app.get('/trades/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const model = getModelTransferBot(id)

      const items = await model.find({}).maxTimeMS(120000).lean()

      res.status(200).json(items);
    } catch (e) {
      console.error('Error fetching trades:', e);
      res.status(500).json({ error: 'Failed to fetch trades: \n' + e.message });
    }
  });

  app.get('/history', async (req, res) => {
    try {
      const requests = modelsHistory.map(model => model.find({}).maxTimeMS(120000).lean())
      const results = await Promise.all(requests);
      res.status(200).json(results.flat());
    } catch (e) {
      console.error('Error fetching history:', e);
      res.status(500).json({ error: 'Failed to fetch history: \n' + e.message });
    }
  });
}
