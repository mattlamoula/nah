const C = require("./constants");
const store = require("./store");
const stonkfun = require("./stonkfun");
const { getPricesUsd } = require("./price");
const { buyMomentumToken, sellPosition, executeBuyback } = require("./execute");
const { loadKeypair } = require("./wallet");

// Un "tick" complet : gère les sorties (stoploss/ROI/trailing), cherche de nouvelles
// entrées momentum, puis déclenche un buyback si la valeur totale dépasse le seuil.
// Toute la logique tourne pareil en dry-run et en live — seule bot/execute.js décide
// si une transaction réelle part sur la chaîne (voir constants.isDryRun()).
async function runTick() {
  const defaultState = { cashUsd: C.SEED_USD, positions: [], lastTickAt: null };
  const state = await store.getState(defaultState);
  const dryRun = C.isDryRun();
  const events = [];

  const keypair = loadKeypair();
  const walletAddress = keypair ? keypair.publicKey.toBase58() : null;

  let heldPrices = {};
  if (state.positions.length > 0) {
    const mints = [...new Set(state.positions.map(p => p.mint))];
    try { heldPrices = await getPricesUsd(mints); } catch (err) { console.error("price fetch failed", err); }

    for (const position of [...state.positions]) {
      const price = heldPrices[position.mint];
      if (!price) continue;
      position.highestPrice = Math.max(position.highestPrice, price);
      const pnlPct = (price - position.entryPrice) / position.entryPrice;
      const drawdownFromHighPct = (price - position.highestPrice) / position.highestPrice;
      const ageMinutes = (Date.now() - position.openedAt) / 60000;
      const roiTier = [...C.ROI_TABLE].reverse().find(tier => ageMinutes >= tier.afterMinutes) || C.ROI_TABLE[0];

      let reason = null;
      if (pnlPct <= C.STOPLOSS_PCT) reason = "stoploss";
      else if (pnlPct > 0 && drawdownFromHighPct <= C.TRAILING_STOP_PCT) reason = "trailing-stop";
      else if (pnlPct >= roiTier.roi) reason = `take-profit ${(roiTier.roi * 100).toFixed(1)}%`;

      if (reason) {
        try { events.push(await sellPosition(state, position, price, reason)); }
        catch (err) { console.error("sellPosition failed", err); }
      }
    }
  }

  const openSlots = C.MAX_OPEN_TRADES - state.positions.length;
  if (openSlots > 0 && state.cashUsd > 1) {
    const tokens = await stonkfun.getTrendingTokens();
    const heldMints = new Set(state.positions.map(p => p.mint));
    const candidates = tokens
      .filter(t => !heldMints.has(t.mint))
      .filter(t => t.change24h >= C.MOMENTUM_ENTRY_MIN_CHANGE_PCT)
      .filter(t => t.marketCap >= C.MOMENTUM_MIN_MARKET_CAP_USD)
      .filter(t => t.priceUsd > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, openSlots);

    for (const token of candidates) {
      const positionSizeUsd = Math.min(state.cashUsd, state.cashUsd * C.POSITION_SIZE_PCT);
      if (positionSizeUsd < 1) break;
      try { events.push(await buyMomentumToken(state, token, positionSizeUsd)); }
      catch (err) { console.error("buyMomentumToken failed", err); }
    }
  }

  const mintsHeld = state.positions.map(p => p.mint);
  if (mintsHeld.length > 0) {
    try { heldPrices = { ...heldPrices, ...(await getPricesUsd(mintsHeld)) }; } catch {}
  }
  const positionsValueUsd = state.positions.reduce((sum, p) => sum + p.tokensAmount * (heldPrices[p.mint] || p.entryPrice), 0);
  const totalValueUsd = state.cashUsd + positionsValueUsd;

  if (totalValueUsd > C.BUYBACK_THRESHOLD_USD) {
    const excessUsd = totalValueUsd - C.BUYBACK_THRESHOLD_USD;
    const buybackAmountUsd = Math.min(excessUsd, state.cashUsd);
    if (buybackAmountUsd > 1) {
      try {
        const result = await executeBuyback(state, buybackAmountUsd);
        if (result) events.push(result);
      } catch (err) { console.error("executeBuyback failed", err); }
    }
  }

  state.lastTickAt = Date.now();
  state.dryRun = dryRun;
  state.walletAddress = walletAddress;
  state.balanceUsd = state.cashUsd + state.positions.reduce((sum, p) => sum + p.tokensAmount * (heldPrices[p.mint] || p.entryPrice), 0);

  await store.setState(state);
  for (const event of events) {
    await store.appendTrade({ ...event, timestamp: Date.now(), dryRun });
  }

  return { state, events };
}

module.exports = { runTick };
