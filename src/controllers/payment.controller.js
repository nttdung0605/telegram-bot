const Order = require("../models/order.model");
const bot = require("../services/telegram.service");
const { ADMIN_CHAT_ID } = require("../config");

async function handleWebhook(req, res) {
  try {
    const data = req.body;

    const orderCode = data?.data?.orderCode;
    const status = data?.data?.status;

    // chỉ xử lý khi thanh toán thành công
    if (status !== "PAID") {
      return res.sendStatus(200);
    }

    const order = await Order.findOneAndUpdate(
      { orderCode },
      { status: "paid" },
      { new: true }
    );

    if (!order) return res.sendStatus(200);

    // gửi user
    await bot.sendMessage(order.chatId, "✅ Thanh toán thành công!");

    // gửi admin
    try {
        await bot.sendMessage(ADMIN_CHAT_ID, `
  📦 ĐƠN MỚI (ĐÃ THANH TOÁN)
  
  👤 ${order.userName}
  💰 ${order.total}đ
        `);
      } catch (err) {
        console.error("❌ Failed to send message to admin:", err);
      }
  
      res.sendStatus(200);
  
    } catch (err) {
      console.error("❌ WEBHOOK ERROR:", err);
      res.sendStatus(500);
    }
  }

module.exports = {
  handleWebhook
};