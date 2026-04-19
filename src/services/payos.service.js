const axios = require("axios");
const crypto = require("crypto");
const { PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY } = require("../config");


function generateSignature(data) {
  const sortedData = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join("&");

  return crypto
    .createHmac("sha256", PAYOS_CHECKSUM_KEY)
    .update(sortedData)
    .digest("hex");
}

async function createPayment(orderId, amount) {
  const orderCode = Date.now();
  const body = {
    orderCode,
    amount: amount,
    description: `TS${orderId}`,
    returnUrl: "https://your-site.com/success",
    cancelUrl: "https://your-site.com/cancel"
  };

  const signature = generateSignature(body);

  const res = await axios.post(
    "https://api-merchant.payos.vn/v2/payment-requests",
    {
      ...body,
      signature
    },
    {
      headers: {
        "x-client-id": PAYOS_CLIENT_ID,
        "x-api-key": PAYOS_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  if (!res.data || res.data.code !== "00") {
    throw new Error(res.data?.desc || "PayOS lỗi");
  }

  return res.data.data;
}

module.exports = {
  createPayment
};