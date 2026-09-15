// Central branding + engine config. Edit here first.
const GOOB_CONFIG = {
  name: "GOOB",
  ticker: "$GOOB",
  pairTicker: "$STONK",
  chain: "Solana",
  launchpad: "StonkFun",

  supply: 1_000_000_000,
  taxPct: 3,
  devPct: 0,

  // Demo-tape only: internal pacing for the simulated feed stream. Not a
  // product concept — never surfaced as a countdown or "every Xs" claim.
  demoTickSec: 60,
  demoFeedChance: 0.32,

  demoSolUsd: 150,
  demoStonkPerSol: 31000,
  demoGenesisMs: Date.parse("2026-09-08T00:00:00Z"),

  caLive: false,
  contractAddress: "",

  socials: {
    x: "",
    telegram: "",
    dexscreener: "",
  },

  poll: {
    infoMs: 5000,
    tradesMs: 10000,
    feedMs: 30000,
  },
};
