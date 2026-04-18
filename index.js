const initBot = require("./src/bot");
const connectDB = require("./src/config/db");

async function start() {
  await connectDB(); 

  initBot(); 
  require("./src/server");
}

start();

// process.on("uncaughtException", (err) => {
//   console.error("🔥 UNCAUGHT:", err);
// });
// 
// process.on("unhandledRejection", (err) => {
//   console.error("🔥 PROMISE ERROR:", err);
// });