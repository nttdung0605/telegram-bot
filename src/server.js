
const express = require("express");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/payment.route");
const bot = require("./services/telegram.service");
const PAYOS_WEBHOOK_URL = require("../config");
const BOT_TOKEN = require("../config");

const app = express();
app.use(bodyParser.json());

app.post(`/bot${BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
  
  // Set webhook cho Telegram
  bot.setWebHook(`${PAYOS_WEBHOOK_URL}/bot${BOT_TOKEN}`);
});