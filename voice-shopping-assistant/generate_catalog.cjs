const fs = require('fs');
const text = fs.readFileSync('raw_catalog.txt', 'utf8');

const lines = text.split('\n');
const catalog = [];
let currentCategory = 'Miscellaneous';

const priceMap = {
  'Fresh Fruits & Vegetables': [40, 150],
  'Rice, Atta, Flour & Grains': [60, 200],
  'Pulses, Dal & Beans': [80, 180],
  'Spices & Masalas': [30, 100],
  'Oils, Sauces & Condiments': [50, 400],
  'Canned & Packaged Foods': [60, 200],
  'Biscuits, Cookies & Bakery': [20, 120],
  'Chocolates & Sweets': [10, 300],
  'Snacks': [20, 150],
  'Dairy & Refrigerated': [30, 250],
  'Cold Drinks & Beverages': [40, 150],
  'Tea & Coffee': [100, 400],
  'Frozen Foods': [100, 350],
  'Household Cleaning': [50, 250],
  'Personal Care': [60, 350],
  'General Household & Miscellaneous': [30, 200]
};

for (const line of lines) {
  if (line.startsWith('###')) {
    currentCategory = line.replace('###', '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(); // Remove emoji
  } else if (line.match(/^\d+\./)) {
    const name = line.replace(/^\d+\./, '').trim();
    const range = priceMap[currentCategory] || [50, 200];
    const price = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    // make price a multiple of 5 for realism
    const cleanPrice = Math.round(price / 5) * 5;
    catalog.push({
      id: catalog.length + 1,
      name,
      price: cleanPrice,
      category: currentCategory
    });
  }
}

const content = `export const MOCK_CATALOG = ${JSON.stringify(catalog, null, 2)};\n`;
fs.writeFileSync('src/catalog.js', content);
console.log('Catalog generated!');
