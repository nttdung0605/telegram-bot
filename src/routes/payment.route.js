const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");
const bot = require("../services/telegram.service");
const { ADMIN_CHAT_ID } = require("../config");

// webhook từ payOS
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;

    const orderCode = data.orderCode;

    const order = await Order.findOne({ chatId: orderCode });

    if (!order) {
      return res.json({ message: "Order not found" });
    }

    // update trạng thái
    order.status = "PAID";
    await order.save();

    // gửi user
    await bot.sendMessage(order.chatId, `
✅ Thanh toán thành công!

🧾 Đơn của bạn đang được chuẩn bị
    `);

    // gửi admin
    await bot.sendMessage(ADMIN_CHAT_ID, `
📦 ĐƠN MỚI (ĐÃ THANH TOÁN)

👤 ${order.userName}
${order.total}đ
    `);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Webhook error" });
  }
});

module.exports = router;