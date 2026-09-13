// Scrolling banner of StonkFun's top-market-cap tokens.
// Public StonkFun API (keyless): https://www.stonkfun.xyz/api/public/v1
// We try a direct fetch first (works if StonkFun allows cross-origin CORS).
// If that fails (CORS blocked, or API down), we fall back to the serverless proxy
// /api/stonkfun, which makes the call server-side and sidesteps CORS entirely.
// If both fail, we show a clear message instead of making up numbers.

const STONKFUN_DIRECT_URL = "https://www.stonkfun.xyz/api/public/v1/tokens?sort=newest";
const TICKER_REFRESH_MS = 45000;
const TICKER_TOP_N = 15;

function pickField(obj, candidates, fallback) {
  for (const key of candidates) {
    if (obj && obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return fallback;
}

function normalizeToken(raw) {
  const marketCap = Number(pickField(raw, ["marketCap", "market_cap", "mcap", "marketcap"], 0)) || 0;
  const symbol = pickField(raw, ["symbol", "ticker", "tokenSymbol"], "???");
  const change = Number(pickField(raw, ["priceChange24h", "change24h", "priceChangePercent", "change_24h"], 0)) || 0;
  return { symbol: String(symbol).toUpperCase(), marketCap, change };
}

function formatMc(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

async function fetchStonkfunTokens() {
  const tryFetch = async (url) => {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.tokens || data.data || data.pairs || []);
    if (!Array.isArray(list)) throw new Error("Unexpected response format");
    return list.map(normalizeToken);
  };

  try {
    return await tryFetch(STONKFUN_DIRECT_URL);
  } catch (directErr) {
    try {
      return await tryFetch(SITE_CONFIG.api.stonkfunTickerEndpoint);
    } catch (proxyErr) {
      console.warn("StonkFun ticker: both direct fetch and proxy failed.", directErr, proxyErr);
      return null;
    }
  }
}

function renderTicker(tokens) {
  const track = document.getElementById("ticker-track");
  if (!track) return;

  if (!tokens || tokens.length === 0) {
    track.innerHTML = `<div class="ticker-item"><span class="sym">StonkFun ticker unavailable right now</span></div>`;
    return;
  }

  const top = tokens
    .filter(t => t.marketCap > 0)
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, TICKER_TOP_N);

  const itemHtml = top.map(t => {
    const dir = t.change >= 0 ? "up" : "down";
    const arrow = t.change >= 0 ? "▲" : "▼";
    return `<div class="ticker-item">
      <span class="sym">$${t.symbol}</span>
      <span class="mc">${formatMc(t.marketCap)}</span>
      <span class="chg ${dir}">${arrow} ${Math.abs(t.change).toFixed(1)}%</span>
    </div>`;
  }).join("");

  // Duplicated once for a seamless continuous scroll (translateX -50%).
  track.innerHTML = itemHtml + itemHtml;
}

async function refreshTicker() {
  const tokens = await fetchStonkfunTokens();
  renderTicker(tokens);
}

document.addEventListener("DOMContentLoaded", () => {
  refreshTicker();
  setInterval(refreshTicker, TICKER_REFRESH_MS);
});
