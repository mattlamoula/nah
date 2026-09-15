// Real, non-demo data from StonkFun's own public API: $STONK's price/mcap,
// platform revenue (buybacks/burns), and pad activity (new listings, pairs
// quoted in $STONK). Independent from demo.js (simulated $GOOB hunts) and
// goob-live.js ($GOOB's own future market data via Dexscreener) — this is
// StonkFun-the-platform's data, not $GOOB's.
//
// UNVERIFIED: this sandbox's egress proxy blocks stonkfun.xyz, so none of
// these field names/shapes were confirmed against a live response — they're
// exactly what was specified, no invented fallback field names. Every value
// is read defensively; an endpoint that fails, or doesn't have the expected
// field, just drops that one ticker item rather than showing a dash or a
// wrong number. Deliberately skips the separate /burns endpoint — its
// amount's unit (USD vs raw $STONK) isn't specified, and mislabeling a
// token count as a dollar figure is worse than not showing it; the burn
// ticker item uses /revenue's burnsUsd instead, which is unambiguous.
//
// Rate limit is 300 reads/min; this does at most 5 fetches per 25s cycle
// (~12/min), so no throttling logic is needed on top of the poll interval.
const GOOB_STONKFUN_LIVE = (() => {
  const MINT = "6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx";
  const BASE = "https://www.stonkfun.xyz/api/public/v1";
  const SITE_URL = "https://www.stonkfun.xyz";
  const REFRESH_MS = 25000;

  let state = {
    price: null,
    mcap: null,
    buybackUsd: null,
    burnUsd: null,
    newTokens: [], // [{ symbol }], newest first, max 2, spam-filtered
    pairsCount: null,
  };
  let onUpdate = null;

  async function getJson(path) {
    const res = await fetch(BASE + path, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status " + res.status);
    return res.json();
  }

  async function fetchQuote() {
    const data = await getJson(`/tokens/${MINT}`);
    const price = parseFloat(data.priceUsd);
    if (!Number.isFinite(price)) throw new Error("no priceUsd");
    const mcap = Number(data.marketCapUsd);
    return { price, mcap: Number.isFinite(mcap) ? mcap : null };
  }

  async function fetchRevenue() {
    const data = await getJson(`/revenue?limit=1`);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("no revenue row");
    const buyback = Number(row.buybacksUsd);
    const burn = Number(row.burnsUsd);
    return {
      buybackUsd: Number.isFinite(buyback) ? buyback : null,
      burnUsd: Number.isFinite(burn) ? burn : null,
    };
  }

  function isSpamSymbol(sym) {
    return !sym || typeof sym !== "string" || !sym.trim();
  }

  async function fetchNewest() {
    const data = await getJson(`/tokens?sort=newest&pageSize=5`);
    const list = Array.isArray(data) ? data : data.tokens || [];
    return list
      .filter((t) => t && !isSpamSymbol(t.symbol))
      .slice(0, 2)
      .map((t) => ({ symbol: t.symbol.trim().replace(/^\$/, "") }));
  }

  async function fetchPairsCount() {
    const data = await getJson(`/tokens?quoteMint=${MINT}&pageSize=1`);
    const total = data?.pagination?.total;
    if (Number.isFinite(total)) return total;
    const big = await getJson(`/tokens?quoteMint=${MINT}&pageSize=25`);
    const list = Array.isArray(big) ? big : big.tokens || [];
    return list.length;
  }

  async function refresh() {
    const [quote, revenue, newest, pairs] = await Promise.allSettled([
      fetchQuote(),
      fetchRevenue(),
      fetchNewest(),
      fetchPairsCount(),
    ]);
    state = {
      price: quote.status === "fulfilled" ? quote.value.price : null,
      mcap: quote.status === "fulfilled" ? quote.value.mcap : null,
      buybackUsd: revenue.status === "fulfilled" ? revenue.value.buybackUsd : null,
      burnUsd: revenue.status === "fulfilled" ? revenue.value.burnUsd : null,
      newTokens: newest.status === "fulfilled" ? newest.value : [],
      pairsCount: pairs.status === "fulfilled" && Number.isFinite(pairs.value) ? pairs.value : null,
    };
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

  const getPriceText = () => (Number.isFinite(state.price) ? formatPrice(state.price) : null);
  const getMcapText = () => (Number.isFinite(state.mcap) ? formatUsd(state.mcap) : null);
  const getBuybackText = () => (Number.isFinite(state.buybackUsd) ? formatUsd(state.buybackUsd) : null);
  const getBurnText = () => (Number.isFinite(state.burnUsd) ? formatUsd(state.burnUsd) : null);
  const getNewTokens = () => state.newTokens;
  const getPairsCount = () => (Number.isFinite(state.pairsCount) ? state.pairsCount : null);

  function init(cb) {
    onUpdate = cb || null;
    refresh();
    setInterval(refresh, REFRESH_MS);
  }

  return {
    init,
    getPriceText,
    getMcapText,
    getBuybackText,
    getBurnText,
    getNewTokens,
    getPairsCount,
    siteUrl: SITE_URL,
  };
})();
