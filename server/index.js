import express from 'express';
import { connect, set } from 'mongoose';
const cors = require('cors');
import TradeModel from "./models/trade.model";
// import socketIO from "socket.io";

export default (app) => {
  // mongodb://Admin8host:bogdanzahodi@139.180.195.205:27017/arb_bot_newbd
  // mongodb://Admin8host:bogdanzahodi@139.180.195.205:27017/arb_bot_newbd
  set("strictQuery", false)
  connect('mongodb://admin:QGfcYjT0O-Kgf4Y@2.57.215.208:27017/arb_bot_newbd12334')
    .then(() => console.log('MongoDB is connected!'));


  // db.createUser({
  //   user: "admin",
  //   pwd: "QGfcYjT0O-Kgf4Y", // Замените на надежный пароль
  //   roles: [{ role: "readWrite", db: "arb_bot_newbd12334" }]
  // })
  // //
  // db.createUser({
  //   user: "admin",
  //   pwd: "QGfcYjT0O-Kgf4Y", // замените на надежный пароль
  //   roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
  // })
  //
  // arb_bot_newbd12334

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
