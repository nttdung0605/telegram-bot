const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const menuPath = path.join(__dirname, "../data/Menu.csv");

function loadMenu() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(menuPath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          category: data.category,
          item_id: Number(data.item_id),
          name: data.name,
          description: data.description,
          price_m: Number(data.price_m),
          price_l: Number(data.price_l),
          available: data.available === "true"
        });
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

let cachedMenu = null;

async function getMenu() {
  if (cachedMenu) return cachedMenu;
  cachedMenu = await loadMenu();
  return cachedMenu;
}

module.exports = {
  getMenu
};