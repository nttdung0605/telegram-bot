const initBot = require("./src/bot");
const connectDB = require("./src/config/db");

async function start() {
  await connectDB(); 

  initBot(); 
  require("./src/server");
}

start();

console.log("BOT:", process.env.ADMIN_CHAT_ID);