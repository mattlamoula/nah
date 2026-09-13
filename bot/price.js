const C = require("./constants");

const JUPITER_PRICE_URL = "https://lite-api.jup.ag/price/v2";

async function getPricesUsd(mints) {
  const ids = mints.join(",");
  const res = await fetch(`${JUPITER_PRICE_URL}?ids=${ids}`);
  if (!res.ok) throw new Error(`Jupiter price API HTTP ${res.status}`);
  const { data } = await res.json();
  const out = {};
  for (const mint of mints) out[mint] = Number(data?.[mint]?.price) || null;
  return out;
}

async function getSolPriceUsd() {
  const prices = await getPricesUsd([C.SOL_MINT]);
  return prices[C.SOL_MINT];
}

module.exports = { getPricesUsd, getSolPriceUsd };
