const { getMenu } = require("./menu.service");
const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("../config");
const client = new OpenAI({
  apiKey: OPENAI_API_KEY
});

async function parseOrder(message) {
  const menu = await getMenu();

  const drinks = menu.filter(
    item => item.available && !item.category.toLowerCase().includes("topping")
  );

  const toppings = menu.filter(
    item => item.available && item.category.toLowerCase().includes("topping")
  );

  const drinkText = drinks
    .map(item => `${item.name} (M: ${item.price_m}, L: ${item.price_l})`)
    .join("\n");

  const toppingText = toppings
    .map(item => `${item.name} (+${item.price_m})`)
    .join("\n");

  const prompt = `
Bạn là nhân viên bán trà sữa.

MENU NƯỚC:
${drinkText}

TOPPING:
${toppingText}

YÊU CẦU:
- Hiểu khách gọi món
- Nếu không nói size → mặc định M
- Nhận diện topping nếu có
- Trả về JSON
- KHÔNG giải thích

Format:
{
  "items": [
    {
      "name": "",
      "quantity": 1,
      "size": "M",
      "toppings": [],
      "ice": "Bình thường",
      "sugar": "Bình thường"
    }
  ]
}

Message: "${message}"
`;

try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    });

    return res.choices[0].message.content;

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    throw err;
  }
}

module.exports = {
  parseOrder
};