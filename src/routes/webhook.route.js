const express = require("express");
const router = express.Router();

const Order = require("../models/order.model");
const bot = require("../services/telegram.service");

router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const orderCode = data.data.orderCode;
    const status = data.data.status;

    if (status === "PAID") {
      const order = await Order.findOneAndUpdate(
        { orderCode: orderCode },
        { status: "paid" },
        { new: true }
      );

      if (!order) return res.sendStatus(404);

      // gửi admin
      await bot.sendMessage(process.env.ADMIN_CHAT_ID, `
📦 ĐƠN MỚI (ĐÃ THANH TOÁN)

👤 Khách: ${order.userName}
📱 ChatID: ${order.chatId}

🧾 ${order.items.map(i => `- ${i.name} x${i.quantity}`).join("\n")}

💰 Tổng: ${order.total}đ
      `);

      // gửi user
      await bot.sendMessage(order.chatId,
        "✅ Thanh toán thành công! Quán đang làm món 🧋"
      );
    }

    res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;