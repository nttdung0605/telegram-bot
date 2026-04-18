const bot = require("./services/telegram.service");
const { handleMessage } = require("./utils/message.util");

function initBot() {
  bot.on("message", async (msg) => {
    try {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (!text) return;

      const userName = `${msg.from.first_name || ""} ${msg.from.last_name || ""}`.trim();

      const res = await handleMessage(text, chatId, userName);

      if (typeof res === "string") {
        return bot.sendMessage(chatId, res);
      }

      await bot.sendMessage(chatId, res.text);

    } catch (err) {
      console.error("BOT ERROR:", err);
    }
  });

  console.log("🤖 Bot is running...");
}

module.exports = initBot;