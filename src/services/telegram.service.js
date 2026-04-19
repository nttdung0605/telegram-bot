const TelegramBot = require("node-telegram-bot-api");
const { BOT_TOKEN } = require("../config");

const bot = new TelegramBot(BOT_TOKEN, { 
    polling: true,
    interval: 1000  
  });

module.exports = bot;