require("dotenv").config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MONGO_URI: process.env.MONGO_URI,
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
  PAYOS_WEBHOOK_URL: process.env.PAYOS_WEBHOOK_URL
};