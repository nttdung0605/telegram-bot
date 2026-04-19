const Order = require("../models/order.model");

async function saveOrderToDB(chatId, orderData, total, status) {
  return Order.create({
    chatId,
    userName: orderData.userName,
    orderCode: orderData.orderCode,
    items: orderData.items,
    total,
    status,
    createdAt: new Date()
  });
}

module.exports = {
  saveOrderToDB
};