// All branding values live here.
// Swap these placeholders for the real info before the StonkFun launch.
const SITE_CONFIG = {
  tokenName: "Skity",
  tokenTicker: "$SKITY",
  mascotName: "Skity",
  tagline: "The cat that trades for the community",

  // Contract address once the token is minted on StonkFun
  contractAddress: "",

  // Trading bot's public wallet (must be visible on-chain, never the private key)
  botWalletAddress: "",

  socials: {
    x: "#",
    telegram: "#",
    stonkfun: "#",
  },

  // Palette matched to stonkfun.xyz (very dark navy + cyan blue).
  // gain/accent stay green/red: the universal convention for price moves.
  colors: {
    primary: "#4dc8f5",
    primaryDim: "#1f6f96",
    bg: "#080b11",
    bgPanel: "#0e131c",
    accent: "#ff5470",
    gain: "#3ddc84",
    warn: "#ffb347",
  },

  // Starting seed given to the bot (in USD) and the profit threshold that triggers a buyback
  bot: {
    seedUsd: 100,
    buybackThresholdUsd: 130,
    dryRun: true,
  },

  api: {
    stonkfunTickerEndpoint: "/api/stonkfun",
    tradesEndpoint: "/api/trades",
    balanceEndpoint: "/api/balance",
  },
};
