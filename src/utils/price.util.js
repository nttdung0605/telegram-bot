const { getMenu } = require("../services/menu.service");

function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}

async function calculateItemPrice(item, menu) {
  const menuItem = menu.find(m => m.name === item.name);
  if (!menuItem) return 0;

  // giá theo size
  const basePrice =
    item.size === "L" ? menuItem.price_l : menuItem.price_m;

  // tính topping
  let toppingPrice = 0;

  if (item.toppings && item.toppings.length > 0) {
    item.toppings.forEach(t => {
      const topping = menu.find(m => m.name === t);
      if (topping) {
        toppingPrice += topping.price_m;
      }
    });
  }

  return (basePrice + toppingPrice) * item.quantity;
}

async function calculateTotal(order) {
  const menu = await getMenu();

  let total = 0;

  for (const item of order.items) {
    total += await calculateItemPrice(item, menu);
  }

  return total;
}

// render bill đẹp
async function buildBill(order) {
  const menu = await getMenu();

  let text = "🧾 ĐƠN HÀNG CỦA BẠN:\n";

  for (const item of order.items) {
    const itemPrice = await calculateItemPrice(item, menu);

    const toppingsText =
      item.toppings?.length > 0
        ? item.toppings.join(", ")
        : "Không";

    text += `
🍹 ${item.name} (${item.size}) x${item.quantity}
- Topping: ${toppingsText}
- Thành tiền: ${formatCurrency(itemPrice)}
`;
  }

  const total = await calculateTotal(order);

  text += `\n💰 TỔNG: ${formatCurrency(total)}`;

  return {
    text,
    total
  };
}

module.exports = {
  calculateTotal,
  buildBill
};