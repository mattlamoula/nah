# $GOOB — full project brief (handoff document)

This is a standalone brief for a fresh Claude Code session with no memory of
prior sessions. Read this in full before touching any code.

## 1. What this project is

A one-page marketing/showcase website for **$GOOB**, a Solana memecoin that
will launch on **StonkFun** (https://www.stonkfun.xyz/), a Solana launchpad
positioned as a Pump.fun competitor. The mascot artwork already exists
(provided by the project owner, see Section 4 — do not generate a new
mascot). The site's job is to present the mascot, explain the token
mechanic, and drive traffic to buy $GOOB once it's live.

**No smart contract, token program, or bot needs to be built.** $GOOB is
created entirely through StonkFun's own "LaunchLab" flow — this project is
website-only.

## 2. Token facts (confirmed by the project owner — do not invent beyond this)

- Name: GOOB / Ticker: $GOOB
- Chain: Solana
- Launchpad: StonkFun (https://www.stonkfun.xyz/) — explicitly **not**
  Pump.fun
- Quote/pair asset: **$STONK** (StonkFun's own platform token) — $GOOB
  trades directly against $STONK, not against SOL. This is the core
  mechanic of the whole project; see Section 3.
- $STONK mint address: `6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx`
- $GOOB mint address: **not live yet.** Display a placeholder
  (`DROPPING AT LAUNCH` or equivalent — see Section 7 for the exact
  `{{GOOB_CA}}` placeholder convention) until the owner provides the real
  address post-mint.
- Total supply: **1,000,000,000** (1B) — standard StonkFun/LaunchLab issuance
- Decimals: **do not invent a number** — use whatever StonkFun's default is,
  or omit decimals from the UI entirely if unknown
- Reward tax: a holder-reward tax paid out in $STONK on every trade.
  Default **1%**, but the owner said this could become 3% and wants it
  trivially editable from a single config value (not hardcoded in multiple
  copy strings).
- Liquidity: locked/managed entirely by StonkFun's own launch flow. Do not
  invent a team vesting schedule — there isn't one to describe.
- No presale, no team allocation. Fair launch via StonkFun's bonding curve.
- Graduation mechanic: trades on a bonding curve through StonkFun's
  LaunchLab until it hits StonkFun's graduation threshold (~85 SOL
  equivalent), then the pool graduates to Raydium. State this simply in
  copy — the site does not implement or simulate this.

## 3. The core mechanic — explain this accurately, it's the whole pitch

StonkFun lets any token launch with a fixed supply and a **one-sided market
quoted directly against another token** instead of the usual SOL pair.
$GOOB uses this to pair against $STONK itself. Concretely:

- Every buy/sell of $GOOB routes through $STONK reserves — there is no
  separate $GOOB/SOL pool.
- Buying $GOOB means taking exposure to $STONK (StonkFun's own platform
  token) by extension.
- A reward tax (default 1%, see above) on every trade is redistributed to
  $GOOB holders, paid out in $STONK — not in $GOOB, not in SOL.
- **Narrative inspiration**: this mirrors the $TACZ / $ZCAT pattern (see
  https://x.com/TACZbiz for reference if reachable) — $TACZ pairs to
  $ZCAT, giving holders exposure to the parent token plus trading-fee
  rewards. $GOOB does the same thing, except the "parent" is $STONK.
  Approved copy line: *"Same idea as TACZ on ZCAT — except the parent is
  $STONK."*

**IMPORTANT — verify the exact buy flow now that you have internet
access.** Two slightly different descriptions of the buy flow were given
across the project's history:
  - One version: user must manually swap SOL → $STONK first, then swap
    $STONK → $GOOB as a second step.
  - The latest rebuild brief (Section 8) describes it as more automatic:
    "SOL routed → $STONK → $GOOB" via StonkFun/a bot, i.e. the platform
    or a routing bot handles the SOL→STONK leg for the user.
  These are not necessarily contradictory (StonkFun's own UI might route
  it automatically even though the underlying pool is STONK-quoted), but
  it hasn't been verified against the live product. **Check
  stonkfun.xyz directly** (now reachable) to confirm the actual UX before
  finalizing the "How to buy" copy, and default to the latest brief's
  phrasing if it can't be confirmed either way.

**Things to never claim:**
- Never say "official partner of StonkFun" (not confirmed)
- Never promise a fixed/guaranteed yield or fixed APY on the reward tax —
  it scales with trading volume and can be zero
- Never invent tokenomics numbers beyond what's listed in Section 2
  (no team allocation %, no vesting schedule, no decimals count)

## 4. Assets — use ALL of them, do not generate a generic new mascot

Repo: `mattlamoula/nah`, all assets already committed at
`assets/mascot/*.png` (500×500 PNG, transparent background, cartoon
sticker style with a cream/beige outline). There are exactly **6 files**,
no more exist — if a brief calls for an asset that doesn't exist, use a
clearly named placeholder, do not invent a new character pose:

| File | Pose |
|---|---|
| `Gemini_Generated_Image_c9iugqc9iugqc9iu-removebg-preview.png` | Jumping / flying, both arms out, dynamic — good hero image |
| `25d0a02d-de7e-42e7-aed1-845006fe4f2a-removebg-preview.png` | Standing, cap forward, mouth open with tongue out, one hand raised waving |
| `Gemini_Generated_Image_j6jjj8j6jjj8j6jj-removebg-preview.png` | Standing, smiling, one hand pointing to the side |
| `Gemini_Generated_Image_o04uajo04uajo04u-removebg-preview.png` | Walking, tongue out |
| `a07ba0c7-0330-456d-8d6e-4dcf6566afe7-removebg-preview.png` | Standing front-facing, tongue out, arms at sides — simplest pose, good for favicon/nav badge |
| `Gemini_Generated_Image_pcve1zpcve1zpcve-removebg-preview.png` | Peeking in from the left edge, half-hidden, worried expression — character only occupies roughly the left 40% of the 500×500 canvas, rest is transparent |

Sampled real colors from the artwork (via Pillow pixel histogram, not
guessed) — use as a starting palette, refine visually:
- Main teal (skin): `#2898a0` (cluster range `#2090a0`–`#3890a0`)
- Darker teal (shadow/cap): `#187080` (cluster range `#106878`–`#208098`)
- Cream/paper (sticker outline): `#f0e8d0` (cluster range `#e0d8d0`–`#f0e8d0`)
- Ink/outline (near-black linework): `#1a1a1a` (cluster range `#101010`–`#282828`)
- Tongue/mouth: pinkish-red (not sampled precisely — eyedrop from the
  artwork directly if needed)

## 5. Design references

### moodengsol.com — the structural/tonal reference (mandatory)

The project owner wants this site's structure, pacing, density and section
types **cloned** (adapted to $GOOB), not stonkfun.xyz's UI. Full
description as given by the owner (verify live now that internet access
works — this was transcribed by hand and may have small inaccuracies):

**Palette (approx.)**
- Background: navy/cosmos `#0B1B33` → `#16324F`
- Accent: rose-coral `#F06B6B` / `#E85A5A`
- Character (hippo): brown `#6B3A2A`, `#8B4A32`
- Flower accent: yellow `#F5D04A`
- Text: white/cream `#F7F3EA`
- Logo outline: dark brown + thick white (cartoon sticker style)

**Fonts**
- Display/logo: rounded cartoon bubble/comic display, ultra-bold, outline
  + drop shadow
- Body: clean sans-serif, fairly large, mixed sentence-case + CAPS for CTAs
- Stat numbers (1B+, 1M+): very large display figures

**Section order**
1. Full-bleed hero illustration (character + cosmic/jungle backdrop)
2. Stats banner: 1B+ views / 1M+ fans / 10B+ programmed (big number + small
   label, 3 stats)
3. About [character]
4. Exchanges/Moonshot CTA
5. Tokenomics (supply, CA)
6. How to buy (4 steps, Phantom-based)
7. Coming soon
8. PFP section (character as downloadable profile picture)
9. "Loved by millions" / socials
10. Footer

**Copy tone**: meme-cute and wholesome, not aggressive-degen. Simple,
oral, community-first. Examples given: "Join her on the moon!", "Our
tokenomics are simple – Pumpfun tokenomics!", "you're moo-gang! Welcome to
the moo deng family!"

**Look & feel**: illustration-first landing page, NOT a dashboard. Space
backdrop + nature elements. Big chunky CTAs. No app-like UI chrome, no
token cards.

### stonkfun.xyz — context only, explicitly NOT the UI to copy

Full description as given by the owner (dark SaaS/launchpad dashboard:
near-black background `#0B0E12`/`#0D1117`, card surfaces `#12181F`, cyan
accent `#3D8BFF`/`#4EA2FF`, Inter/Geist-style UI font, token grid cards with
sparklines, nav with Launch/Rewards/Flywheel/Revenue/API). **The owner has
explicitly forbidden cloning this UI for the $GOOB site** — no dashboard
cards, no sparklines, no dense SaaS nav, no market-cap grids. Its only
useful contribution is (a) confirming the real $STONK/pairing mechanic
copy, e.g. "Create a fixed-supply token with a one-sided Raydium market
quoted against a meme, stock, currency, commodity or any other token,"
and (b) verifying the real buy flow (see Section 3).

## 6. Repo state — READ BEFORE WRITING ANYTHING

- Repo: `mattlamoula/nah`, branch `claude/quirky-ramanujan-wzpk41` (this is
  the designated dev branch — confirm this is still true for your session,
  it may differ)
- **There is already a full site built on this branch from two prior
  iterations** (a first "Skity" trading-bot version that was scrapped
  entirely, then a $GOOB v1 that used a dark StonkFun-dashboard-style
  palette with dense card grids). **This does NOT match the latest rebuild
  brief in Section 8 and must be fully rebuilt, not patched** — the owner
  was explicit: "REBUILD COMPLET. Ne patche pas le site actuel. Supprime
  le layout existant."
- Current file structure (static site, no framework, no build step):
  ```
  index.html
  css/style.css
  js/config.js       — all branding/identity values (ticker, CA, socials,
                        reward tax %, mascot image paths)
  js/main.js          — applies config to the DOM, copy-CA buttons w/ toast
                        feedback, mobile nav toggle
  assets/mascot/*.png — the 6 artwork files (Section 4)
  README.md
  package.json        — no dependencies, pure static site
  ```
- Deployment: pure static site, no build step, deployable to Vercel/Netlify/
  GitHub Pages by pointing at the repo root.
- Keep the `js/config.js` pattern (or equivalent) as the single source of
  truth for: `contractAddress` (empty until mint), `pairContractAddress`
  (already known, see Section 2), `rewardTaxPercent` (default 1, must be
  trivially editable), `socials.x`/`socials.telegram` (empty/TBD),
  `launchUrl`. This satisfies the owner's `{{GOOB_CA}}` / `{{BUY_URL}}` /
  `{{X_URL}}` / `{{TG_URL}}` placeholder convention from Section 8 — no
  need to literally render `{{...}}` strings to visitors, render friendly
  placeholder text instead (e.g. "DROPPING AT LAUNCH" for the CA) wired to
  the same config value.

## 7. Environment note

This session previously ran in a sandboxed container whose outbound network
proxy only allowlisted GitHub domains — moodengsol.com, stonkfun.xyz, and
x.com were all unreachable (confirmed via direct curl tests, 403 on the
CONNECT tunnel). The user has since reconfigured the environment's network
policy specifically so a fresh session can reach the wider internet. **Use
this**: fetch moodengsol.com and stonkfun.xyz directly to verify the
descriptions in Section 5 against the real thing, and check
x.com/TACZbiz if useful context for Section 3's narrative framing.

## 8. THE LATEST REBUILD BRIEF — follow this verbatim, it supersedes anything implied in Sections 5-6 about the current site's structure

The owner's own words (kept verbatim/near-verbatim because the exact
copy lines and prohibitions matter):

> REBUILD COMPLET. Ne patche pas le site actuel. Supprime le layout
> existant et refais une one-page meme landing clonée sur
> moodengsol.com — structure, rythme, densité, type de sections —
> appliquée à $GOOB. Ne me demande pas d'"améliorer le site actuel".
> Rebuild.

### Structure to reproduce, in this exact order

1. **Nav** — minimal, sticky. Left: character logo + "GOOB" wordmark.
   Right: 3 text links (About, How to buy, Tokenomics) + exactly 1 BUY
   button. **No "Connect Wallet"** — this is not an app.
2. **Hero** — full viewport height. Mascot huge, centered, ~60-70% of
   desktop viewport height. GOOB wordmark display-bold with cartoon
   outline, over or just under the character. One line: *"Buy $GOOB. Get
   paid in $STONK."* One subline: *"The mascot of the $STONK biz. Launched
   on StonkFun."* Exactly 2 buttons: **BUY $GOOB** / **COPY CA**.
   Background: a flat color or illustrated backdrop extracted from the
   mascot artwork's own palette (Section 4) — explicitly NOT a generic
   `#0b0e12` dark SaaS background unless that actually matches the
   artwork. Subtle CSS float on the character (translateY 8–12px, 3–4s
   ease-in-out, no JS/animation library needed).
3. **Stats banner** — exactly 3 big-number-style stats (not 6), moodeng
   "1B+ views" style (huge figure, small label underneath), on a
   contrasting background from the hero:
   - Big: `$STONK` / label: "PAIRED WITH"
   - Big: `{{rewardTaxPercent}}%` / label: "REWARD TAX"
   - Big: `StonkFun` / label: "LAUNCHED ON"
4. **About** — heading "About GOOB". 3–5 sentences max, spoken/casual
   tone. Character image beside the text, a **different pose** from the
   hero image. Punchline: *"Join the $STONK biz."* Approved body copy:
   *"GOOB is the mascot that sits on $STONK. You buy $GOOB. Trading pays
   holders in $STONK. Same idea as TACZ on ZCAT — except the parent is
   $STONK."*
5. **Buy/Exchanges equivalent** (moodeng's "APE IN WITH MOONSHOT" analog)
   — one card or band, not a grid of exchange logos. Single CTA: **APE IN
   ON STONKFUN**. Subtext: *"Pair $GOOB / $STONK. Pay in SOL — Jupiter and
   bots route it."* (verify this claim per Section 3's flagged
   uncertainty before finalizing).
6. **Tokenomics** — heading + exactly one line: *"Our tokenomics are
   simple — StonkFun tokenomics."* Then exactly 3 lines, no more:
   - Total supply: 1,000,000,000
   - Pair: $GOOB / $STONK
   - CA: `{{GOOB_CA}}` placeholder + copy button
   **No pie chart. No vesting chart. No invented team allocation.**
7. **How to buy** — exactly 4 steps, moodeng-style (small cartoon number +
   caps title + 2 lines of body text each):
   1. CREATE A WALLET (Phantom)
   2. GET SOME $SOL
   3. BUY $GOOB (StonkFun / bot: SOL routed → $STONK → $GOOB)
   4. YOU'RE GOOB GANG
8. **PFP section** — heading "SET GOOB AS PFP". Grid of ALL 6 provided
   mascot images. Button linking out to X (use the `{{X_URL}}`
   placeholder/config value).
9. **Gallery / "Loved by"** — a band of mascot images (overflow-scroll or
   wrap layout). Every one of the 6 asset files must appear **somewhere
   on the page** at least once, counting the PFP grid and this gallery
   together — cross-check this before shipping.
10. **Footer** — socials (X, Telegram, StonkFun link), CA, short meme-style
    copyright line.

### Design system rules (non-negotiable per the owner)

- One-page, mobile-first, content max-width ~1100px; hero and gallery can
  be full-bleed (edge to edge)
- Alternate section backgrounds (background A / background B) to create
  visual rhythm the way moodeng does
- Generous whitespace: section padding 96–140px desktop, 64px mobile
- Buttons: either fully pill-shaped (border-radius 999px) or sticker-style
  (16–24px radius + 3–4px border). Large padding (16–22px vertical,
  28–36px horizontal), uppercase or title-case bold text, hover
  `scale(1.03)`
- No Material-style soft shadows. If it fits the artwork, use flat cartoon
  offset shadows (e.g. `4px 4px 0 #000` / ink color) instead
- Palette **must be eyedropped from the GOOB artwork itself** (Section 4
  has real sampled starting values) — forbidden to default to a generic
  Solana purple/cyan or a StonkFun dark-dashboard palette if it doesn't
  actually match the character
- Headings: fat display font, tight letter-spacing, line-height 0.9–1.05
- Body text: 18–20px, line-height 1.5, ~45–55 characters per line max
  width
- **One font combo only**: a display font in the "gros/comic-adjacent"
  family — Bangers, Lilita One, or Fredoka are all acceptable choices —
  paired with one clean body font (Nunito or Outfit suggested). Do not use
  Inter/Space Grotesk/JetBrains Mono everywhere like the previous
  iteration did.

### Explicitly forbidden (the owner listed these as hard no's)

- Cloning stonkfun.xyz's actual UI
- Market-cap/volume/sparkline cards
- Glassmorphism or generic gradient-mesh backgrounds
- Lorem ipsum placeholder text
- "Connect Wallet" as the primary CTA
- A shadcn/dashboard-component look
- A generic "Fast / Secure / Community" 3-column features block
- A 10-question FAQ section
- Forcing dark mode if it fights the (bright/colorful) artwork
- Claiming "official partner" of StonkFun
- Promising a fixed or guaranteed yield/APY

### Technical requirements

- Plain HTML/CSS/JS is fine (matches the existing repo's stack) — a
  framework is not required, visual result is what's being judged
- Sticky bottom buy button/bar on mobile
- Copy-CA button with visible "copied" feedback (the existing toast
  pattern in `js/main.js` already does this — reuse it)
- Config-driven placeholders equivalent to `{{GOOB_CA}}`, `{{BUY_URL}}`,
  `{{X_URL}}`, `{{TG_URL}}` (see Section 6 — `js/config.js` already does
  this, keep the pattern)
- Keep images optimized (they already are, ~70–200KB each) — no heavy
  animation library needed for a CSS float effect
- Basic accessibility: `alt` text on every image, sufficient contrast on
  CTA buttons

### Required deliverables when this rebuild is done

1. The page itself — when scrolled quickly, it should read as "moodengsol.com
   with a different character," not as a StonkFun dashboard clone
2. A list of which asset file was used in which section
3. A list of any asset files not yet used anywhere, and where they got
   placed (gallery/PFP grid, per the "every asset used at least once"
   rule in Section 8's step 9)
4. Do not ask whether to "improve the current site" — this is a full
   rebuild, replacing `index.html`/`css/style.css`/`js/*` wholesale

## 9. Known open items to resolve early in the new session

- Verify the exact StonkFun buy flow (Section 3) against the live site now
  that it's reachable, and correct "How to buy" / "Buy section" copy
  accordingly if it turns out to differ from the brief's assumption
- Confirm reward tax stays at 1% or the owner wants to bump it to 3% before
  finalizing copy (currently defaulted to 1%, trivially editable via
  `rewardTaxPercent` in config)
- Get real X/Telegram handles from the owner when available (currently
  empty/TBD — footer and PFP-section "post to X" link should degrade
  gracefully, e.g. a disabled/"coming soon" state, until filled in)
- Get the real $GOOB mint address once StonkFun minting happens
  (`contractAddress` in config — currently empty, triggers "DROPPING AT
  LAUNCH" placeholder state throughout the site until filled)
