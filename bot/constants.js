// Paramètres de la stratégie de trading. Dupliqués depuis js/config.js côté serveur
// (le bot tourne en Node, js/config.js est un script navigateur) — garder les deux
// synchronisés si tu changes seedUsd / buybackThresholdUsd.
module.exports = {
  SEED_USD: 100,
  BUYBACK_THRESHOLD_USD: 130,

  MAX_OPEN_TRADES: 3,
  POSITION_SIZE_PCT: 0.2, // % du cash disponible investi par trade

  STOPLOSS_PCT: -0.05, // sortie forcée si une position perd 5%
  TRAILING_STOP_PCT: -0.03, // une fois en profit, sort si ça retombe de 3% depuis le plus haut

  // Table ROI façon freqtrade : take-profit minimum selon le temps déjà passé en position.
  // Plus une position est vieille, plus on accepte un profit modeste pour sortir.
  ROI_TABLE: [
    { afterMinutes: 0, roi: 0.08 },
    { afterMinutes: 30, roi: 0.05 },
    { afterMinutes: 120, roi: 0.025 },
    { afterMinutes: 360, roi: 0.01 },
  ],

  MOMENTUM_ENTRY_MIN_CHANGE_PCT: 15, // % de hausse 24h minimum pour envisager une entrée
  MOMENTUM_MIN_MARKET_CAP_USD: 20000, // évite les tokens trop illiquides/scam évidents
  SLIPPAGE_BPS: 150, // 1.5%

  SOL_MINT: "So11111111111111111111111111111111111111112",
  USDC_MINT: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  TOKEN_MINT: process.env.TOKEN_MINT || "",

  JUPITER_QUOTE_URL: "https://lite-api.jup.ag/swap/v1/quote",
  JUPITER_SWAP_URL: "https://lite-api.jup.ag/swap/v1/swap",
  STONKFUN_TOKENS_URL: "https://www.stonkfun.xyz/api/public/v1/tokens?sort=volume",

  RPC_URL: process.env.RPC_URL || "https://api.mainnet-beta.solana.com",

  // Double verrou de sécurité : il faut les DEUX pour que le bot touche des fonds réels.
  isDryRun() {
    const dryRunFlag = process.env.DRY_RUN !== "false";
    const confirmed = process.env.LIVE_TRADING_CONFIRMED === "yes-i-understand-the-risk";
    return dryRunFlag || !confirmed;
  },
};
