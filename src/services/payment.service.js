const { v4: uuidv4 } = require("uuid");

async function createPayment(orderId, amount) {
  const fakeQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-${orderId}-${amount}`;

  return {
    paymentId: uuidv4(),
    qrCode: fakeQR,
    amount
  };
}

module.exports = {
  createPayment
};