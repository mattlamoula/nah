const store = require("../bot/store");
const C = require("../bot/constants");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
  const defaultState = { balanceUsd: C.SEED_USD, dryRun: true, walletAddress: null, lastTickAt: null };
  const state = await store.getState(defaultState);
  res.status(200).json({
    balanceUsd: state.balanceUsd ?? C.SEED_USD,
    dryRun: state.dryRun !== false,
    walletAddress: state.walletAddress || null,
    lastTickAt: state.lastTickAt || null,
  });
};
