
const express = require("express");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/payment.route");
const webhookRoutes = require("./routes/webhook.route");

const app = express();
app.use(bodyParser.json());

app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
});