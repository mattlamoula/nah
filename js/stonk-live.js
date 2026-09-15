// Real, non-demo data: $STONK's live price/mcap from Dexscreener's public
// token API. Independent from demo.js (which simulates $GOOB's own not-yet-
// live hunts) — $STONK already trades on StonkFun today, so this is real.
// On any failure this keeps the last-known state marked !ok; callers must
// render an em dash rather than freeze or fabricate a number.
const GOOB_STONK_LIVE = (() => {
  const MINT = "6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx";
  const API_URL = `https://api.dexscreener.com/latest/dex/tokens/${MINT}`;
  const DEX_URL = `https://dexscreener.com/solana/${MINT}`;
  const REFRESH_MS = 20000;

  let state = { price: null, mcap: null, ok: false };
  let onUpdate = null;

  function pickBestPair(pairs) {
    if (!Array.isArray(pairs) || !pairs.length) return null;
    return pairs.slice().sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
  }

  async function refresh() {
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("bad status " + res.status);
      const data = await res.json();
      const pair = pickBestPair(data.pairs);
      const price = pair && parseFloat(pair.priceUsd);
      if (!pair || !Number.isFinite(price)) throw new Error("no usable pair data");
      state = { price, mcap: pair.fdv || pair.marketCap || null, ok: true };
    } catch (e) {
      state = { ...state, ok: false };
    }
    if (onUpdate) onUpdate(state);
  }

  function formatPrice(p) {
    if (p < 0.01) return "$" + p.toFixed(6);
    if (p < 1) return "$" + p.toFixed(4);
    return "$" + p.toFixed(2);
  }

  function formatMcap(m) {
    if (m >= 1e6) return "$" + (m / 1e6).toFixed(2) + "M";
    if (m >= 1e3) return "$" + (m / 1e3).toFixed(1) + "K";
    return "$" + Math.round(m).toLocaleString();
  }

  function getPriceText() {
    return state.ok ? formatPrice(state.price) : null;
  }
  function getMcapText() {
    return state.ok && state.mcap != null ? formatMcap(state.mcap) : null;
  }

  function init(cb) {
    onUpdate = cb || null;
    refresh();
    setInterval(refresh, REFRESH_MS);
  }

  return { init, getPriceText, getMcapText, dexUrl: DEX_URL };
})();
