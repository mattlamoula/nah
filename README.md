# $GOOB — the unofficial mascot of the hunt

Static site for $GOOB, a Solana memecoin paired against $STONK (StonkFun's house
token, stonkfun.xyz). UX/IA/motion is modeled on a BLAST-style live on-chain
dashboard: sticky nav, hero, a coal "live feed" strip, a live trade ticker, KPI
tiles, a canvas chart of cumulative $STONK fed to holders, how/rules/engine
cards, a social panel, and a feed log.

Mechanic (ZCAT-style, told with zipper-hunt lore): every $GOOB trade pays a tax
(`GOOB_CONFIG.taxPct`, default 3%). That tax buys $STONK on the open market — a
"hunt" — and the $STONK is airdropped straight to $GOOB holders. No staking, no
claiming, no button. $GOOB never buys or burns itself; supply stays 1B, dev is
0%, and there's no team wallet. Unofficial — not StonkFun, not endorsed by them.

## Structure

```
index.html          single page, all sections, binds to copy.js via [data-copy]
css/style.css        full design system (tokens in :root) + components + responsive
js/config.js          engine constants (taxPct, supply, demo pacing) — edit here first
js/copy.js             EVERY visible string on the site — edit here for any copy change
js/demo.js              deterministic demo-tape engine (see below)
js/chart.js              canvas chart of cumulative $STONK fed: pan/zoom/hover/hunt markers
js/app.js                 binds copy.js to the DOM, live-feed strip, ticker/feed-log, copy-CA, toasts

goob/stand.png       logo, nav icon, footer
goob/jump.png         hero art
goob/wave.png          social panel mini-tile
goob/point.png          social panel mini-tile / rules energy
goob/walk.png            (spare pose, not currently placed)
goob/peek.png             social panel lore tile
```

No build step. Deploys as a static site (Vercel picks it up automatically).

## Copy lives in one file

There's no React/JSX here, but the same discipline applies: `js/copy.js` is the
single source of truth for every marketing string (nav labels, hero, KPI
labels, how/rules/engine text, feed-log templates, toasts, meta title/
description — all of it). `index.html` elements carry `data-copy="dot.path"`
attributes; `app.js`'s `applyCopy()` walks them on load and sets their text
from `GOOB_COPY`. Repeated/array content (how-steps, rules, engine rows,
social mini-facts, lore) renders from copy.js into empty containers via small
render functions in `app.js`, rather than being written out in the markup.
**To change any copy on the site, edit `js/copy.js` — never hardcode a
sentence in `index.html` or a JS template string.** The one exception is the
raw `<title>`/`<meta description>` in `index.html`'s `<head>`, kept static for
crawlers/link-unfurling that don't run JS; `applyCopy()` re-sets both from
`copy.js` at runtime too, so they can't drift.

## The demo-tape engine (`js/demo.js`)

The contract isn't live yet, so there's no chain to read from. Every number on
the page — the live-feed strip, the chart, the ticker, the feed log — is a
**pure function of the current wall-clock time**, seeded deterministically.
That means reloading the page, or opening it in two tabs, shows the *same*
cumulative $STONK total, the same past feeds, and the same chart shape — it
behaves like a real shared feed even though nothing is stored anywhere.

There is deliberately no visible clock: $GOOB's tax hunts $STONK on every
trade, not on a timer. Internally, the simulation still needs *some* pacing
(`GOOB_CONFIG.demoTickSec`, 60s, each tick a `demoFeedChance` shot at
producing a feed event) so the ticker/chart/feed log have something to show,
but that pacing is never surfaced as a product claim.

- **KPIs stay honest**: supply/dev/tax/pair are real facts, not demo output.
- The chart, ticker, and feed log are demo simulations of what activity will
  look like once the pair is live, labeled "demo tape" — a visible amber badge
  plus a repeating "NOT LIVE - DEMO TAPE" watermark baked into the chart
  canvas and tiled via CSS over the ticker and feed log, so a cropped
  screenshot of any of them can't be passed off as real activity.

## Going live

1. In `js/config.js`: set `caLive: true`, fill in `contractAddress`, `socials`,
   and confirm `taxPct` matches the deployed contract.
2. Replace the demo-tape engine: swap `js/demo.js`'s functions for real reads
   from your indexer/RPC, keeping the same function names/shapes (`getFeed`,
   `getFeedsList`, `getLastFeed`, `cumulativeFedAt`, `getHolderCount`,
   `getTicks`) so `chart.js`/`app.js` don't need to change.
3. Wire the feed-log's `data-soon` explorer links to real transaction URLs.

## Legacy bot/API scaffolding

`api/`, `bot/`, `scripts/generate-bot-wallet.sh`, `vercel.json`'s cron, and
`.env.example` are leftover infrastructure from an earlier, unrelated concept
for this repo (a "Skity" trading-bot mascot that bought back its own supply).
They are **not used by the current frontend** — left in place in case the
swap-execution/Jupiter/wallet plumbing is useful groundwork for building the
real hunt engine later; delete them if you'd rather start that clean.
