// src/controllers/payment.controller.js
const Order = require("../models/order.model");
const bot = require("../services/telegram.service");
const { ADMIN_CHAT_ID, PAYOS_CHECKSUM_KEY } = require("../config");
const crypto = require("crypto");

// Verify PayOS webhook signature
function verifySignature(data, signatureFromPayOS) {
  const sortedData = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("&");

  const expectedSignature = crypto
    .createHmac("sha256", PAYOS_CHECKSUM_KEY)
    .update(sortedData)
    .digest("hex");

  return expectedSignature === signatureFromPayOS;
}

async function handleWebhook(req, res) {
  try {
    console.log("🔔 WEBHOOK RECEIVED FROM PAYOS");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const data = req.body;
    const signature = data?.signature;

    // ✅ Verify signature
    if (!signature) {
      console.error("❌ Missing signature");
      return res.status(400).json({ error: "Missing signature" });
    }

    // Verify signature (pass all data except signature itself)
    const dataToVerify = { ...data };
    delete dataToVerify.signature;

    if (!verifySignature(dataToVerify, signature)) {
      console.error("❌ Invalid signature - webhook rejected");
      return res.status(401).json({ error: "Invalid signature" });
    }

    console.log("✅ Signature verified");

    const orderCode = data?.data?.orderCode;
    const status = data?.data?.status;

    console.log(`📋 Order Code: ${orderCode}, Status: ${status}`);

    // Only handle PAID status
    if (status !== "PAID") {
      console.log(`⏭️ Skipping - status is ${status}, not PAID`);
      return res.sendStatus(200);
    }

    // Convert orderCode to number for matching
    const orderCodeNum = Number(orderCode);
    console.log(`🔍 Finding order with orderCode: ${orderCodeNum} (type: ${typeof orderCodeNum})`);

    const order = await Order.findOneAndUpdate(
      { orderCode: orderCodeNum },
      { status: "paid" },
      { new: true }
    );

    console.log(`📦 Order from DB:`, order);

    if (!order) {
      console.warn(`⚠️  Order not found for orderCode: ${orderCodeNum}`);
      // Still return 200 so PayOS doesn't retry
      return res.sendStatus(200);
    }

    console.log(`✉��  Sending notification to user (chatId: ${order.chatId})`);
    
    // Send user notification
    try {
      const userMsg = await bot.sendMessage(
        order.chatId, 
        "✅ Thanh toán thành công!\n\nBạn sẽ nhận được đơn hàng sớm thôi 🚚"
      );
      console.log(`✅ User notification sent (messageId: ${userMsg.message_id})`);
    } catch (userErr) {
      console.error("❌ Failed to send user notification:", userErr.message);
      console.error("User error details:", userErr);
    }

    console.log(`✉️  Sending notification to admin (chatId: ${ADMIN_CHAT_ID})`);

    // Send admin notification
    try {
      const adminMsg = await bot.sendMessage(
        ADMIN_CHAT_ID,
        `📦 ĐƠN HÀNG MỚI - ĐÃ THANH TOÁN\n\n👤 Khách hàng: ${order.userName}\n💰 Tổng tiền: ${order.total}đ\n🕐 Thời gian: ${new Date().toLocaleString("vi-VN")}`
      );
      console.log(`✅ Admin notification sent (messageId: ${adminMsg.message_id})`);
    } catch (adminErr) {
      console.error("❌ Failed to send admin notification:", adminErr.message);
      console.error("Admin error details:", adminErr);
    }

    console.log("✅ Webhook processed successfully");
    res.sendStatus(200);

  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    console.error("Error stack:", err.stack);
    res.sendStatus(500);
  }
}

module.exports = {
  handleWebhook
};