const TelegramBot = require("node-telegram-bot-api");
const { BOT_TOKEN, PAYOS_WEBHOOK_URL } = require("../config");

const bot = new TelegramBot(BOT_TOKEN, { 
    webHook: {
      port: PAYOS_WEBHOOK_URL || 3000
    }
  });

module.exports = bot;