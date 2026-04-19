const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  chatId: String,
  userName: String, 
  orderCode: Number,
  items: Array,
  total: Number,
  status: {
    type: String,
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);