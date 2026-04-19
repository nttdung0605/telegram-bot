const { getMenu } = require("../services/menu.service");
const { parseOrder } = require("../services/ai.service");
const { saveOrder, getOrder, clearOrder } = require("../services/order.service");
const { buildBill } = require("./price.util");
const { saveOrderToDB } = require("../services/order-db.service");
const { createPayment } = require("../services/payos.service");

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

async function getMenuText() {
  const menu = await getMenu();

  const drinks = [];
  const toppings = [];

  menu.forEach(item => {
    if (!item.available) return;

    if (item.category.toLowerCase().includes("topping")) {
      toppings.push(item);
    } else {
      drinks.push(item);
    }
  });

  // group category (drinks)
  const groupByCategory = {};
  drinks.forEach(item => {
    if (!groupByCategory[item.category]) {
      groupByCategory[item.category] = [];
    }
    groupByCategory[item.category].push(item);
  });

  let text = "📂 MENU QUÁN\n";

  // Drinks
  text += "\n🍹 NƯỚC UỐNG:\n";

  Object.keys(groupByCategory).forEach(category => {
    text += `\n🧋 ${category}:\n`;

    groupByCategory[category].forEach(item => {
      text += `- ${item.name}\n  💰 M: ${item.price_m}đ | L: ${item.price_l}đ\n`;
    });
  });

  // Topping
  text += "\n🧁 TOPPING:\n";

  toppings.forEach(item => {
    text += `- ${item.name} (+${item.price_m}đ)\n`;
  });

  return text;
}

async function handleMessage(msg, chatId, userName) {
  msg = msg.toLowerCase();

  // xem menu
  if (msg.includes("menu")) {
    return await getMenuText();
  }

  const axios = require("axios");
  // confirm đơn
  if (msg === "yes") {
    try {
      const order = getOrder(chatId);
  
      if (!order) return { text: "Bạn chưa có đơn 😅" };
  
      const bill = await buildBill(order);
      const orderCode = Date.now();
      await saveOrderToDB(
        chatId,
        { ...order, userName, orderCode},
        bill.total,
        "pending_payment"
      );
  
      const payment = await createPayment(orderCode, bill.total);

      if (!payment || !payment.qrCode) {
        throw new Error("Không tạo được QR");
      }

      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payment.qrCode)}`;
      clearOrder(chatId);
  
      return {
        text: `${bill.text}
  
  💳 Thanh toán tại:
  ${payment.checkoutUrl}
  
  📱 QR:
  ${qrImage}
  
  ⏳ Đợi thanh toán...`,
  qrImage
      };
  
    } catch (err) {
      console.error(err);
      console.error("PAYMENT ERROR:", err.response?.data || err.message);
      return { text: "❌ Lỗi thanh toán 😅" };
    }
  }

  // huỷ đơn
  if (msg === "no") {
    clearOrder(chatId);
    return "❌ Đã huỷ đơn";
  }

  // parse order mới
  try {
    const aiResult = await parseOrder(msg);

    const jsonString = extractJSON(aiResult);
    const order = JSON.parse(jsonString);

    if (!order.items || order.items.length === 0) {
      return "Bạn muốn uống gì trong menu nè 😆?";
    }

    // lưu order
    saveOrder(chatId, order);

    let text = "🧾 Bạn đặt:\n";

    order.items.forEach(item => {
      const toppingsText =
        item.toppings?.length > 0
          ? item.toppings.join(", ")
          : "Không";
    
      text += `
    - ${item.name} (${item.size}) x${item.quantity}
      Đá: ${item.ice}
      Đường: ${item.sugar}
      Topping: ${toppingsText}
    `;
    });

    text += "\n👉 Xác nhận (yes/no)?";

    return text;


  } catch (err) {
    console.error(err);
    return "Bạn nói rõ hơn giúp mình nha 😅";
  }
}

module.exports = {
  handleMessage
};