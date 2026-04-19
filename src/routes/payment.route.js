const express = require("express");
const router = express.Router();

const { createPayment } = require("../services/payos.service");
const { handleWebhook } = require("../controllers/payment.controller");

router.post("/create", async (req, res) => {
  try {
    const { orderCode, amount } = req.body;

  const payment = await createPayment(orderCode, amount);

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Create payment failed" });
  }
});

router.post("/webhook", handleWebhook);

module.exports = router;