const orders = new Map(); // key: chatId

function saveOrder(chatId, order) {
  orders.set(chatId, order);
}

function getOrder(chatId) {
  return orders.get(chatId);
}

function clearOrder(chatId) {
  orders.delete(chatId);
}

module.exports = {
  saveOrder,
  getOrder,
  clearOrder
};