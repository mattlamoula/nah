// Every visible string on the site lives here. Nothing else should hardcode
// marketing copy — index.html and feed/index.html bind to this via
// [data-copy="dot.path"], and the JS renderers (chrome.js / ticker.js /
// app.js) call these fields/functions directly.
const GOOB_COPY = {
  meta: {
    title: "GOOB · Hold $GOOB. Eat $STONK.",
    description:
      "$GOOB is paired with $STONK on StonkFun. Every trade takes a 3% hunt tax, buys $STONK, and sends it to holders. No team cut. Dev 0. No claim button.",
  },

  nav: {
    tabLive: "Live",
    tabFeed: "Feed",
    tabSocials: "Socials",
    chainPill: "Solana · StonkFun",
    buy: "Buy $GOOB",
  },

  ticker: {
    fedSoFar: (stonk) => ({ emoji: "📦", event: "Fed so far", detail: `${stonk} $STONK` }),
    pairFact: (pct) => ({ emoji: "🔗", event: "$GOOB/$STONK", detail: `${pct}% hunt tax · Dev 0` }),
    stonkQuote: (price, mcap) => ({ emoji: "📈", event: "$STONK", detail: `${price} · mcap ${mcap}` }),
    padBuyback: (usd) => ({ emoji: "🔥", event: "Pad buyback", detail: usd }),
    stonkBurned: (usd) => ({ emoji: "🔥", event: "$STONK burned", detail: usd }),
    newOnPad: (symbol) => ({ emoji: "🚀", event: "New on pad", detail: `$${symbol}` }),
    pairsQuoted: (n) => ({ emoji: "🔗", event: "Pairs in $STONK", detail: `${n} quoted` }),
    dash: "—",
  },

  hero: {
    eyebrow: "Unofficial mascot · StonkFun",
    h1: "Hold $GOOB. Eat $STONK.",
    body: "$GOOB is paired with $STONK on StonkFun. Every trade takes a 3% hunt tax, buys $STONK, and sends it to holders. No team cut. Dev 0. No claim button.",
    ctaBuy: "Buy $GOOB",
    ctaCopy: "Copy CA",
    mascotAlt: "GOOB, the $GOOB mascot, leaping",
  },

  liveStrip: {
    label: "LIVE",
    fedLabel: "$STONK fed to holders",
    fedCaption: (stonk) => `${stonk} $STONK sent to holders. No claim. No stake.`,
    lastHuntLabel: "last hunt",
    holdersLabel: "holders earning",
    taxLabel: "tax",
    lastHuntFallback: "—",
    holdersFallback: "—",
  },

  stats: {
    dev: "Dev 0",
    tax: (pct) => `${pct}% hunt tax`,
    paid: "Paid in $STONK",
  },

  how: {
    h2: "How it works",
    steps: [
      { n: "01", title: "Paired with $STONK", body: "Not a SOL pair. $GOOB trades against the house token." },
      { n: "02", title: "Every swap hunts", body: "3% tax buys $STONK on the open market." },
      { n: "03", title: "Holders get paid", body: "$STONK hits wallets automatically. No staking. No claim." },
    ],
  },

  snapshot: {
    eyebrow: "$GOOB",
    headline: "HOLD $GOOB   EARN $STONK",
    subtitle: "Live floor snapshot · StonkFun pair",
    mcLabel: "MC",
    priceLabel: "PRICE",
    liquidityLabel: "LIQUIDITY",
    volumeLabel: "24H VOLUME",
    volumeCaption: "ACTIVE TAPE",
    holdersLabel: "HOLDERS",
    engineTitle: "Hold $GOOB. Earn $STONK.",
    engineFedLabel: "$STONK FED",
    engineLastHuntLabel: "LAST HUNT",
    payoutsLabel: "PAYOUTS",
    payoutsCaption: "COMPLETED",
    taxLabel: "HUNT TAX",
    bullets: [
      "$GOOB is paired with $STONK, not SOL.",
      "Every swap hunts. Holders get paid. No claim.",
      "Dev 0. No team cut.",
      "3% tax. Hold $GOOB. Earn $STONK.",
    ],
    footerLine1: "SAME ZIPPER. BIGGER STONKS.",
    footerLine2: "Built on StonkFun",
    footerLine3: "Not financial advice.",
    dash: "—",
  },

  cta: {
    h2Plain: "Join the ",
    h2Serif: "hunt.",
    body: "Hold $GOOB. Get $STONK. Dev 0. The bag stays on.",
    socialX: "X",
    socialTelegram: "Telegram",
    socialDex: "Dexscreener",
  },

  feedPage: {
    title: "GOOB · Feed",
    description: "Each hunt buys $STONK and airdrops it to holders.",
    h2: "Feed",
    lead: "Each hunt buys $STONK and airdrops it to holders.",
    demoNote: "Live from chain at launch.",
    row: (stonk) => `bought ${stonk} $STONK → sent to holders`,
    linkBuy: "buy ↗",
    linkFeed: "feed ↗",
    empty: "No feeds yet. The tape starts with the first hunt.",
  },

  footer: {
    caPlaceholder: "CA drops at launch",
    copyBtn: "copy",
    disclaimer: "Unofficial mascot on StonkFun. Not financial advice.",
    socialX: "X",
    socialTelegram: "Telegram",
    socialDex: "Dexscreener",
  },

  soonToast: "Dropping at launch — the hunt is armed.",
  copiedToast: "Copied to clipboard",
};
