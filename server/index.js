import express from 'express';
import { connect } from 'mongoose';
const cors = require('cors');
import TradeModel from "./models/trade.model";
// import socketIO from "socket.io";

export default (app) => {
  connect('mongodb://Admin8host:bogdanzahodi@139.180.195.205:27017/arb_bot_newbd')
    .then(() => console.log('MongoDB is connected!'));

  app.use(express.json());
  app.use(cors());
  //
  app.get('/trades', async (req, res) => {
    const trades = await TradeModel.find({})
    res.json(trades);
  });
  //
  // app.post('/bar', (req, res) => {
  //   res.json(req.body);
  // });
  //
  // optional support for socket.io
  //
  // let io = socketIO(http);
  // io.on("connection", client => {
  //   client.on("message", function(data) {
  //     // do something
  //   });
  //   client.emit("message", "Welcome");
  // });
}
