// Toutes les valeurs de branding sont centralisées ici.
// Remplace ces placeholders par les vraies infos avant le lancement StonkFun.
const SITE_CONFIG = {
  tokenName: "Skity",
  tokenTicker: "$SKITY",
  mascotName: "Skity",
  tagline: "Le chat qui trade pour la commu",

  // Adresse du contrat une fois le token mint sur StonkFun
  contractAddress: "",

  // Wallet public du bot de trading (doit être visible on-chain, jamais la clé privée)
  botWalletAddress: "",

  socials: {
    x: "#",
    telegram: "#",
    stonkfun: "#",
  },

  // Palette calquée sur stonkfun.xyz (marine très sombre + bleu cyan).
  // gain/accent restent vert/rouge : convention universelle pour les variations de prix.
  colors: {
    primary: "#4dc8f5",
    primaryDim: "#1f6f96",
    bg: "#080b11",
    bgPanel: "#0e131c",
    accent: "#ff5470",
    gain: "#3ddc84",
    warn: "#ffb347",
  },

  // Seed initial donné au bot (en USD) et seuil de profit qui déclenche un buyback
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
