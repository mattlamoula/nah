const store = require("../bot/store");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
  const trades = await store.getTrades(50);
  res.status(200).json({ trades });
};
