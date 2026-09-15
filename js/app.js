(() => {
  const CFG = GOOB_CONFIG;
  const DEMO = GOOB_DEMO;
  const COPY = GOOB_COPY;

  function renderHowSteps() {
    const el = document.getElementById("how-steps");
    if (!el) return;
    el.innerHTML = COPY.how.steps
      .map((s) => `<div class="mini-tile"><div class="badge">${s.n}</div><h4>${s.title}</h4><p>${s.body}</p></div>`)
      .join("");
  }

  function renderSnapshotBullets() {
    const el = document.getElementById("snapshot-bullets");
    if (!el) return;
    el.innerHTML = COPY.snapshot.bullets.map((b) => `<li>${b}</li>`).join("");
  }

  // Every field here either shows a real fetched value or stays hidden —
  // never a "—" placeholder. The header (MC/PRICE) and each card tile are
  // revealed independently, only once their own value actually arrives.
  function initSnapshotLive() {
    function setOrHide(valueId, tileId, text) {
      const valueEl = document.getElementById(valueId);
      const tileEl = tileId ? document.getElementById(tileId) : valueEl;
      if (!tileEl) return;
      if (text) {
        if (valueEl) valueEl.textContent = text;
        tileEl.hidden = false;
      } else {
        tileEl.hidden = true;
      }
    }

    GOOB_LIVE.init(() => {
      const price = GOOB_LIVE.getPriceText();
      const mcap = GOOB_LIVE.getMcapText();
      const header = document.getElementById("snapshot-market-header");
      if (header) header.hidden = !(price && mcap);
      if (price) document.getElementById("snap-price").textContent = price;
      if (mcap) document.getElementById("snap-mc").textContent = mcap;

      setOrHide("snap-liquidity", "snap-liquidity-tile", GOOB_LIVE.getLiquidityText());
      setOrHide("snap-volume", "snap-volume-tile", GOOB_LIVE.getVolumeText());
      setOrHide("snap-payouts", "snap-payouts-tile", null); // no real payouts source wired yet

      const cardsRow = document.getElementById("snapshot-market-cards");
      if (cardsRow) {
        const anyVisible = ["snap-liquidity-tile", "snap-volume-tile", "snap-payouts-tile"].some(
          (id) => !document.getElementById(id).hidden
        );
        cardsRow.hidden = !anyVisible;
      }
    });
  }

  function flashLiveStrip() {
    const el = document.getElementById("live-strip");
    if (!el) return;
    el.classList.add("live-strip-hit");
    setTimeout(() => el.classList.remove("live-strip-hit"), 900);
  }

  function initLiveStrip() {
    let lastSeenId = null;
    function tick() {
      const now = Date.now();
      const total = DEMO.cumulativeFedAt(now / 1000);
      const fedEl = document.getElementById("live-fed");
      if (fedEl) fedEl.textContent = `${DEMO.formatBig(total)} $STONK`;
      const fedCaptionEl = document.getElementById("live-fed-caption");
      if (fedCaptionEl) fedCaptionEl.textContent = COPY.liveStrip.fedCaption(Math.round(total).toLocaleString());

      const last = DEMO.getLastFeed(now);
      const lastEl = document.getElementById("live-last-hunt");
      if (lastEl) lastEl.textContent = last ? `${DEMO.formatStonk(last.stonk)} $STONK` : COPY.liveStrip.lastHuntFallback;

      const holders = DEMO.getHolderCount(now);
      const holdersEl = document.getElementById("live-holders");
      if (holdersEl) holdersEl.textContent = holders.toLocaleString();

      const snapFedEl = document.getElementById("snap-fed");
      if (snapFedEl) snapFedEl.textContent = `${DEMO.formatBig(total)} $STONK`;
      const snapLastHuntEl = document.getElementById("snap-last-hunt");
      if (snapLastHuntEl) snapLastHuntEl.textContent = last ? `${DEMO.formatStonk(last.stonk)} $STONK` : COPY.liveStrip.lastHuntFallback;
      const snapHoldersEl = document.getElementById("snap-holders");
      if (snapHoldersEl) snapHoldersEl.textContent = holders.toLocaleString();

      const curId = last ? last.id : null;
      if (lastSeenId === null) lastSeenId = curId;
      if (curId !== null && curId !== lastSeenId) {
        lastSeenId = curId;
        GOOB_TICKER.refresh();
        flashLiveStrip();
      }
    }
    tick();
    setInterval(tick, CFG.poll.infoMs);
  }

  document.addEventListener("DOMContentLoaded", () => {
    GOOB_CHROME.init();
    renderHowSteps();
    renderSnapshotBullets();
    initLiveStrip();
    initSnapshotLive();
    GOOB_TICKER.init();
  });
})();
