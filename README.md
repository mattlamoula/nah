# $GOOB — every 3 min a new HUNT into the chart

Static site for $GOOB, a Solana memecoin. UX/IA/motion is modeled on a BLAST-style
live on-chain dashboard: sticky nav, hero, a dark countdown "stage", a live trade
ticker, KPI tiles, a canvas price chart annotated with hunt markers, how/rules/engine
cards, a social panel, and a hunts log.

Lore: StonkFun built a furnace and forgot the cat. $GOOB doesn't eat itself — it
hunts $STONK. Every `INTERVAL_SEC` (180s), the fees $GOOB collects get claimed and
spent on one buy of $STONK, which is fed to holders. Dev 0%, tax 0%, supply
1,000,000,000. Nothing is burned; $GOOB's own supply never moves.

## Structure

```
index.html          single page, all sections
css/style.css        full design system (tokens in :root) + components + responsive
js/config.js          all branding/engine constants — edit here first
js/demo.js             deterministic demo-tape engine (see below)
js/chart.js             canvas price chart: pan/zoom/hover/hunt markers
js/app.js                nav scroll-spy, countdown, ticker/log rendering, copy-CA, toasts

goob/stand.png       logo, nav icon, footer
goob/jump.png         hero art
goob/wave.png          social panel mini-tile
goob/point.png          social panel mini-tile / rules energy
goob/walk.png            (spare pose, not currently placed — ticker/footer candidate)
goob/peek.png             social panel lore tile
```

No build step. Deploys as a static site (Vercel picks it up automatically).

## The demo-tape engine (`js/demo.js`)

The contract isn't live yet, so there's no chain to read from. Every number on the
page — the countdown, the fuel tile, the chart, the ticker, the hunts log — is a
**pure function of the current wall-clock time**, seeded deterministically per
"cycle" (`Math.floor(time / INTERVAL_SEC)`). That means:

- Reloading the page, or opening it in two tabs, shows the *same* countdown, the
  same past hunts, and the same chart shape — it behaves like a real shared feed
  even though nothing is stored anywhere.
- A "hunt" fires automatically every `INTERVAL_SEC` in real time; the KPI/ticker/
  chart/log all pick it up on their own poll cycle (5s/10s/15s/30s, matching the
  cadences in `GOOB_CONFIG.poll`).
- The **KPI row is the one honest section**: supply/dev/tax are real facts, and
  "hunts so far" is left at the literal `0` because no real hunt has happened yet.
  The chart and hunts log are explicitly labeled "demo tape" since they simulate
  what activity will look like once $STONK buys are real.

## Going live

In `js/config.js`:

1. Set `caLive: true` and fill in `contractAddress`.
2. Fill in `engineWallet`, `explorerTxBase`/`explorerAddressBase`, and `socials`.
3. Replace the demo-tape engine: swap `js/demo.js`'s functions for real reads from
   your indexer/RPC, keeping the same function names/shapes (`getHunt`,
   `getHuntsList`, `getFuel`, `getTicks`, `priceAt`, …) so `chart.js`/`app.js`
   don't need to change.

## Legacy bot/API scaffolding

`api/`, `bot/`, `scripts/generate-bot-wallet.sh`, `vercel.json`'s cron, and
`.env.example` are leftover infrastructure from an earlier, unrelated concept for
this repo (a "Skity" trading-bot mascot that bought back its own supply). They are
**not used by the current frontend** — $GOOB's mechanic (claim fees → buy $STONK →
feed holders on a fixed clock) is different enough from that bot's strategy (trade
StonkFun trend tokens, buy back on profit) that the code doesn't map over directly.
They're left in place rather than deleted in case the swap-execution/Jupiter/wallet
plumbing is useful groundwork for building the real hunt engine later — delete them
if you'd rather start that clean.
