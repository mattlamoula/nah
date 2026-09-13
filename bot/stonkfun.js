const C = require("./constants");

function pick(obj, candidates, fallback) {
  for (const key of candidates) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
}

function normalize(raw) {
  return {
    mint: pick(raw, ["mint", "tokenMint", "address", "contractAddress", "mintAddress"], null),
    symbol: String(pick(raw, ["symbol", "ticker", "tokenSymbol"], "???")).toUpperCase(),
    marketCap: Number(pick(raw, ["marketCap", "market_cap", "mcap"], 0)) || 0,
    change24h: Number(pick(raw, ["priceChange24h", "change24h", "priceChangePercent", "change_24h"], 0)) || 0,
    volume24h: Number(pick(raw, ["volume24h", "volume_24h", "volume"], 0)) || 0,
    priceUsd: Number(pick(raw, ["priceUsd", "price_usd", "price"], 0)) || 0,
  };
}

// Renvoie les tokens tendance StonkFun, triés par variation 24h décroissante.
// Retourne [] en cas d'échec réseau/API plutôt que de faire planter le tick du bot.
async function getTrendingTokens() {
  try {
    const res = await fetch(C.STONKFUN_TOKENS_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`StonkFun API HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.tokens || data.data || data.pairs || []);
    if (!Array.isArray(list)) throw new Error("Format de réponse StonkFun inattendu");
    return list.map(normalize).filter(t => t.mint);
  } catch (err) {
    console.error("stonkfun.getTrendingTokens failed", err);
    return [];
  }
}

module.exports = { getTrendingTokens, normalize };
