// $GOOB's own market stats (mc, price, liquidity, 24h volume) for the floor
// snapshot, via Dexscreener — separate from stonkfun-live.js, which reads
// StonkFun's own API for $STONK/platform data. There is genuinely nothing
// to fetch yet — $GOOB has no mint until launch — so every getter returns
// null (rendered as an em dash) until GOOB_CONFIG.caLive + contractAddress
// are both set. Holder count and payout count need a different data source
// entirely (a Solana RPC/indexer, not Dexscreener) and are left as a
// permanent em dash here — wire them up separately when that's chosen.
const GOOB_LIVE = (() => {
  const CFG = GOOB_CONFIG;
  const REFRESH_MS = 20000;

  let state = { price: null, mcap: null, liquidity: null, volume24h: null, ok: false };
  let onUpdate = null;

  function isReady() {
    return CFG.caLive && !!CFG.contractAddress;
  }

  function pickBestPair(pairs) {
    if (!Array.isArray(pairs) || !pairs.length) return null;
    return pairs.slice().sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
  }

  async function refresh() {
    if (!isReady()) {
      state = { price: null, mcap: null, liquidity: null, volume24h: null, ok: false };
      if (onUpdate) onUpdate(state);
      return;
    }
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CFG.contractAddress}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad status " + res.status);
      const data = await res.json();
      const pair = pickBestPair(data.pairs);
      const price = pair && parseFloat(pair.priceUsd);
      if (!pair || !Number.isFinite(price)) throw new Error("no usable pair data");
      state = {
        price,
        mcap: pair.fdv || pair.marketCap || null,
        liquidity: pair.liquidity?.usd ?? null,
        volume24h: pair.volume?.h24 ?? null,
        ok: true,
      };
    } catch (e) {
      state = { ...state, ok: false };
    }
    if (onUpdate) onUpdate(state);
  }

  function formatUsd(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + Math.round(n).toLocaleString();
  }
  function formatPrice(p) {
    if (p < 0.01) return "$" + p.toFixed(6);
    if (p < 1) return "$" + p.toFixed(4);
    return "$" + p.toFixed(2);
  }

  const getPriceText = () => (state.ok ? formatPrice(state.price) : null);
  const getMcapText = () => (state.ok && state.mcap != null ? formatUsd(state.mcap) : null);
  const getLiquidityText = () => (state.ok && state.liquidity != null ? formatUsd(state.liquidity) : null);
  const getVolumeText = () => (state.ok && state.volume24h != null ? formatUsd(state.volume24h) : null);

  function init(cb) {
    onUpdate = cb || null;
    refresh();
    if (isReady()) setInterval(refresh, REFRESH_MS);
  }

  return { init, getPriceText, getMcapText, getLiquidityText, getVolumeText };
})();
