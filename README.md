# $GOOB · Hold $GOOB. Eat $STONK.

Static marketing site for $GOOB, a Solana memecoin paired against $STONK
(StonkFun's house token, mint `6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx`).

Mechanic: every $GOOB trade pays a tax (`GOOB_CONFIG.taxPct`, 3%) — a "hunt".
That tax buys $STONK on the open market and airdrops it straight to $GOOB
holders. No staking, no claiming, no button. Dev 0%, no team wallet, supply
1B. $GOOB never buys or burns itself.

Two pages, no build step, no framework:

```
index.html           homepage: nav, live ticker tape, hero, live-fed strip,
                       3 stat chips, how-it-works, floor snapshot, dark CTA, footer
feed/index.html        the full hunt-by-hunt feed list (moved off the
                         homepage so it stays a 5-second pitch, not a ledger)

css/style.css         full design system (tokens in :root) + components + responsive

js/config.js          engine constants (taxPct, supply, demo pacing) — edit here first
js/copy.js             EVERY visible string on the site — edit here for any copy change
js/demo.js              deterministic demo-tape engine for $GOOB's own (not-yet-live) hunts
js/stonk-live.js         REAL $STONK price/mcap from Dexscreener's public API — not demo
js/goob-live.js           REAL $GOOB market data (price/mcap/liquidity/volume) — inert
                           until CFG.caLive; feeds the homepage's floor-snapshot section
js/chrome.js             shared UI chrome: copy binding, toasts, copy-CA, nav scroll-spy
js/ticker.js              builds the nav ticker tape (pair fact + fed-so-far + $STONK quote)
js/app.js                 homepage-only bootstrap: live-fed strip, how-cards, snapshot, ticker
js/feed-page.js            /feed page bootstrap: renders the hunt list

goob/stand.png        logo, nav icon
goob/jump.png          hero art
goob/wave.png           dark CTA mascot
goob/point.png          (spare pose)
goob/walk.png            (spare pose)
goob/peek.png             (spare pose)
```

Deploys as a static site (Vercel picks it up automatically); `/feed` resolves
to `feed/index.html` via Vercel's default directory-index behavior — no
rewrite rule needed.

## Real data only shows when it's real — never a dash

Three sources feed the site, and none of them may fabricate or fake-freeze
a number. The rule everywhere: if a real value can't be fetched, **hide
that element**; never render a placeholder dash in its place.

- **$GOOB hunt totals** (fed-so-far, last hunt, holder count, the /feed
  list) come from `js/demo.js` — a deterministic, pure-function-of-time
  simulation, because $GOOB's own contract isn't live yet. It's watermarked
  ("NOT LIVE - DEMO TAPE", baked into a repeating background so no
  crop/scroll region can omit it) everywhere it appears. The floor-snapshot
  card's HOLDERS, $STONK FED, and LAST HUNT rows read the exact same values
  as the live-fed strip — one source, written to both places, never a
  second empty one.
- **$STONK price/mcap** (📈, in the ticker) come from `js/stonk-live.js`,
  which really does fetch `https://api.dexscreener.com/latest/dex/tokens/{mint}`
  every 20s. $STONK already trades on StonkFun today, so this is real — it
  is deliberately **not** watermarked. The ticker only shows these two
  items when **both** fetch successfully; if either fails, both are simply
  omitted from the tape (never a dash, never a stale number).
- **$GOOB's own market data** (MC/price/liquidity/24h volume, in the
  floor-snapshot section) comes from `js/goob-live.js`, which stays
  completely inert — no fetch, `null` from every getter — until
  `CFG.caLive && CFG.contractAddress`. Each snapshot tile hides itself
  independently until its own field actually arrives, so a partial
  response (e.g. liquidity but not volume) shows only what's real.

## Copy lives in one file

`js/copy.js` is the single source of truth for every marketing string (nav
labels, hero, ticker templates, stat chips, how/CTA text, feed-page copy,
toasts, meta title/description). `index.html`/`feed/index.html` elements
carry `data-copy="dot.path"` attributes; `chrome.js`'s `applyCopy()` walks
them on load. Repeated content (how-steps) renders from a copy.js array via
a small function in `app.js`. **To change any copy on the site, edit
`js/copy.js`.** The raw `<title>`/`<meta description>` stay static per page
for crawlers that don't run JS.

## Going live

1. In `js/config.js`: set `caLive: true`, fill in `contractAddress` and
   `socials`, confirm `taxPct` matches the deployed contract. This alone
   enables Buy $GOOB and Copy CA (both are disabled/dimmed pre-launch —
   see `chrome.js`'s `initStaticContent()`) and swaps the footer's
   placeholder text for the real CA.
2. Replace `js/demo.js`'s functions with real reads from your indexer/RPC,
   keeping the same names/shapes (`getFeed`, `getFeedsList`, `getLastFeed`,
   `cumulativeFedAt`, `getHolderCount`) so `ticker.js`/`app.js`/`feed-page.js`
   don't need to change.
3. `js/goob-live.js` needs its `fetchPair()` pointed at the real Dexscreener
   pair for `contractAddress` (mirror `stonk-live.js`'s fetch shape) so the
   floor-snapshot's MC/price/liquidity/volume tiles start revealing
   themselves. Holders and payouts have no Dexscreener equivalent — keep
   reading those from `demo.js`'s (now real) `getHolderCount`.
4. Wire the feed list's `data-soon` explorer links to real transaction URLs.
5. `js/stonk-live.js` needs no changes — it's already reading the real chain.

## Legacy bot/API scaffolding

`api/`, `bot/`, `scripts/generate-bot-wallet.sh`, `vercel.json`'s cron, and
`.env.example` are leftover infrastructure from an earlier, unrelated concept
for this repo (a "Skity" trading-bot mascot that bought back its own supply).
Not used by the current frontend; left in place in case the swap-execution/
Jupiter/wallet plumbing is useful groundwork for the real hunt engine later.
