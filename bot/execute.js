const C = require("./constants");
const jupiter = require("./jupiter");
const { loadKeypair } = require("./wallet");
const { getSolPriceUsd } = require("./price");

// Achète une position sur un token tendance. En dry-run : simulation pure basée
// sur le prix StonkFun du moment, aucune transaction envoyée. En live : swap SOL -> token via Jupiter.
async function buyMomentumToken(state, token, usdAmount) {
  if (C.isDryRun()) {
    const tokensAmount = usdAmount / token.priceUsd;
    state.positions.push({
      mint: token.mint, symbol: token.symbol, entryPrice: token.priceUsd,
      tokensAmount, amountUsd: usdAmount, openedAt: Date.now(), highestPrice: token.priceUsd,
    });
    state.cashUsd -= usdAmount;
    return { side: "buy", symbol: token.symbol, amountUsd: usdAmount, simulated: true };
  }

  const keypair = loadKeypair();
  if (!keypair) throw new Error("BOT_PRIVATE_KEY manquant : impossible de trader en live");

  const solPrice = await getSolPriceUsd();
  const lamports = Math.floor((usdAmount / solPrice) * 1e9);
  const { signature, quote, outputDecimals } = await jupiter.executeSwap({
    inputMint: C.SOL_MINT, outputMint: token.mint, amountLamports: lamports, keypair,
  });
  const tokensAmount = Number(quote.outAmount) / 10 ** outputDecimals;

  state.positions.push({
    mint: token.mint, symbol: token.symbol, entryPrice: usdAmount / tokensAmount,
    tokensAmount, amountUsd: usdAmount, openedAt: Date.now(), highestPrice: usdAmount / tokensAmount,
  });
  state.cashUsd -= usdAmount;
  return { side: "buy", symbol: token.symbol, amountUsd: usdAmount, signature, simulated: false };
}

// Ferme une position (take-profit, stoploss, ou trailing stop).
async function sellPosition(state, position, currentPrice, reason) {
  const grossValueUsd = position.tokensAmount * currentPrice;

  if (C.isDryRun()) {
    state.cashUsd += grossValueUsd;
    state.positions = state.positions.filter(p => p !== position);
    return { side: "sell", symbol: position.symbol, amountUsd: grossValueUsd, reason, simulated: true };
  }

  const keypair = loadKeypair();
  if (!keypair) throw new Error("BOT_PRIVATE_KEY manquant : impossible de trader en live");

  const decimals = await jupiter.getDecimalsForMint(position.mint);
  const rawAmount = Math.floor(position.tokensAmount * 10 ** decimals);
  const { signature } = await jupiter.executeSwap({
    inputMint: position.mint, outputMint: C.SOL_MINT, amountLamports: rawAmount, keypair,
  });
  state.cashUsd += grossValueUsd;
  state.positions = state.positions.filter(p => p !== position);
  return { side: "sell", symbol: position.symbol, amountUsd: grossValueUsd, reason, signature, simulated: false };
}

// Rachète $TOKEN sur le marché avec l'excédent de profit au-dessus du seuil.
async function executeBuyback(state, usdAmount) {
  if (!C.TOKEN_MINT) {
    console.warn("executeBuyback: TOKEN_MINT non configuré, buyback ignoré");
    return null;
  }

  if (C.isDryRun()) {
    state.cashUsd -= usdAmount;
    return { side: "buyback", symbol: "TOKEN", amountUsd: usdAmount, simulated: true };
  }

  const keypair = loadKeypair();
  if (!keypair) throw new Error("BOT_PRIVATE_KEY manquant : impossible d'exécuter le buyback en live");

  const solPrice = await getSolPriceUsd();
  const lamports = Math.floor((usdAmount / solPrice) * 1e9);
  const { signature } = await jupiter.executeSwap({
    inputMint: C.SOL_MINT, outputMint: C.TOKEN_MINT, amountLamports: lamports, keypair,
  });
  state.cashUsd -= usdAmount;
  return { side: "buyback", symbol: "TOKEN", amountUsd: usdAmount, signature, simulated: false };
}

module.exports = { buyMomentumToken, sellPosition, executeBuyback };
