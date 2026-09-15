// Every visible string on the site lives here. Nothing else should hardcode
// marketing copy — index.html binds to this via [data-copy] paths, and the
// JS renderers (app.js / chart.js) call these fields/functions directly.
const GOOB_COPY = {
  meta: {
    title: "GOOB · the unofficial mascot of the hunt",
    description:
      "$GOOB is paired with $STONK. Every trade hunts the house token and feeds holders. Dev 0. The bag stays on.",
  },

  nav: {
    brand: "GOOB",
    tabLive: "Live",
    tabHow: "How",
    tabRules: "Rules",
    tabFeed: "Feed",
    tabSocials: "Socials",
    chainPill: "Solana · StonkFun",
    buy: "Buy $GOOB",
  },

  hero: {
    chipTicker: "$GOOB",
    chipPair: "$GOOB / $STONK",
    chipStatus: "hunt armed",
    h1Line1: "The unofficial",
    h1Line2: "mascot of the",
    h1Line3: "hunt.",
    body: "$GOOB is paired with $STONK. Every trade hunts the house token and feeds it to holders. No team cut. Dev 0. The zipper stays shut on the bag.",
    ctaBuy: "Buy $GOOB ↗",
    ctaFeed: "See the feed",
    ctaCopy: "Copy CA",
    mascotAlt: "GOOB, the $GOOB mascot, leaping",
  },

  liveStrip: {
    label: "LIVE FEED",
    fedLabel: "$STONK fed to holders",
    lastHuntLabel: "last hunt",
    holdersLabel: "holders eating",
    taxLabel: "tax",
    caption: "Volume in. $STONK out. No claim button.",
    fedFallback: "0",
    lastHuntFallback: "—",
    holdersFallback: "—",
  },

  kpis: {
    supplyNum: "1B+",
    supplyLabel: "supply",
    devNum: "Dev 0",
    devLabel: "bag stays on",
    taxLabel: "hunt tax",
    taxNum: (pct) => `${pct}%`,
    pairNum: "$STONK",
    pairLabel: "pair",
  },

  ticker: {
    feed: (stonk) => `feed · ${stonk} $STONK → holders`,
  },

  chart: {
    headerSuffix: "fed",
    legendLine: "$STONK fed to holders",
    legendDot: "a hunt",
    legendHint: "drag · scroll to zoom · hover a hunt · live from the chain",
    demoNote: "demo tape — live from the chain at launch",
    huntTooltip: (id, sol, stonk, time) => `hunt #${id} · ${sol} SOL → ${stonk} $STONK · ${time} · click for tx`,
    totalTooltip: (stonk, time) => `${stonk} $STONK fed · ${time}`,
    fallbackPrefix: "Total $STONK fed to holders: ",
    feedBarCaption: (fed, milestone) => `${fed} / ${milestone} $STONK fed to holders`,
  },

  underlying: {
    h2Line1: "Every pair on the pad",
    h2Line2: "is our chart.",
    body: "$STONK isn't a mascot here: it's the other side of the pair. StonkFun is the furnace. $GOOB is the animal they forgot to paint on the hood. When the pad does volume, the zipper hunts.",
    facts: ["Pair $GOOB/$STONK", "Settlement onchain", "Quote $STONK"],
  },

  how: {
    h2: "Three things, then you're caught up.",
    steps: [
      {
        n: "01",
        title: "$GOOB is paired with $STONK",
        body: "Not a SOL pair. The zipper trades against the house token of StonkFun, so $GOOB moves with the pad — not with some diluted gas coin.",
      },
      {
        n: "02",
        title: "Every trade is a hunt",
        body: "A tax comes off each swap. That cut buys $STONK on the open market. Nobody pockets it. Dev 0.",
      },
      {
        n: "03",
        title: "Holders eat",
        body: "The $STONK is airdropped to $GOOB wallets. No staking. No claiming. Hold $GOOB. $STONK shows up.",
      },
    ],
  },

  rules: {
    h2: "The rules of GOOB",
    lead: "Simple. Every number is live from the engine. Every hunt leaves transactions on the explorer: buy $STONK, feed.",
    items: [
      { title: "On the pair", body: "$GOOB/$STONK. That's the product." },
      { title: "The tax hunts", body: "Fees buy $STONK, not $GOOB." },
      { title: "Fed, not burned", body: "GOOB does not buy itself. Holders eat the bag it fetches." },
      { title: "No team wallet", body: "Dev 0. The bag stays on." },
      { title: "Unofficial", body: "Not StonkFun. The cat on the hood." },
    ],
    engineTitle: "The engine",
    engineRows: {
      pair: { label: "Pair", value: "$GOOB/$STONK" },
      tax: { label: "Hunt tax", value: (pct) => `${pct}%` },
      team: { label: "Team cut", value: "0%" },
      payout: { label: "Payout", value: "$STONK airdrop" },
      claim: { label: "Claim", value: "none" },
    },
  },

  feedLog: {
    h2: "Feed",
    lead: "Each hunt buys $STONK with the tax it collects, then airdrops it to holders. No claim button, no clock — just the tape.",
    demoNote: "demo tape — live from the chain at launch",
    row: (stonk) => `bought ${stonk} $STONK → sent to holders`,
    linkBuy: "buy ↗",
    linkFeed: "feed ↗",
    empty: "No feeds yet. The tape starts with the first hunt.",
  },

  social: {
    chip: "GOOB-GANG",
    h2Plain: "Join the ",
    h2Serif: "hunt.",
    lead: "StonkFun built a furnace and forgot the cat. $GOOB is the animal on the hood — hunting anyway.",
    miniFactDev: "Dev 0",
    miniFactTax: (pct) => `${pct}% hunt tax`,
    miniFactSupply: "1B supply",
    socialX: "Twitter",
    socialTelegram: "Telegram",
    socialDex: "DexScreener",
    loreParagraphs: [
      "StonkFun built a furnace and forgot the cat. $GOOB is the animal on the hood — the mascot nobody asked for, hunting anyway.",
      "$GOOB does not eat itself. It hunts $STONK and leaves it for the holders. Dev 0. The bag stays on.",
    ],
  },

  footer: {
    caPlaceholder: "CA drops at launch",
    copyBtn: "copy",
    tagline: "Bag stays on · Dev 0 · $GOOB does not eat itself.",
    disclaimer: "Unofficial mascot. Not StonkFun. Not financial advice.",
    socialX: "X",
    socialTelegram: "Telegram",
    socialDex: "DexScreener",
  },

  copyCaText: "CA drops at launch — $GOOB is not live yet",
  soonToast: "Dropping at launch — the hunt is armed.",
  copiedToast: "Copied to clipboard",
};
