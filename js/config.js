// Central branding + engine config. Edit here first.
const GOOB_CONFIG = {
  name: "GOOB",
  ticker: "$GOOB",
  huntTicker: "$STONK",
  chain: "Solana",
  launchpad: "StonkFun",

  supply: 1_000_000_000,
  taxPct: 0,
  devPct: 0,

  // Single source of truth for the hunt clock. Change only this to retime everything.
  INTERVAL_SEC: 180,

  minHuntSol: 0.01,
  gasReserveSol: 0.003,
  slippagePct: 5,

  // Demo-tape only constants (used until caLive is true).
  demoSolUsd: 150,
  demoStonkPerSol: 31000,
  demoGenesisMs: Date.parse("2026-09-08T00:00:00Z"),

  caLive: false,
  contractAddress: "",
  engineWallet: "",
  explorerTxBase: "https://solscan.io/tx/",
  explorerAddressBase: "https://solscan.io/account/",

  socials: {
    x: "",
    telegram: "",
    dexscreener: "",
  },

  copyCaText: "CA drops at launch — $GOOB is not live yet",
  soonToast: "Dropping at launch — the hunt is armed.",

  poll: {
    infoMs: 5000,
    chartMs: 15000,
    tradesMs: 10000,
    huntsMs: 30000,
  },
};
