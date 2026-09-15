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

      const holdersEl = document.getElementById("live-holders");
      if (holdersEl) holdersEl.textContent = DEMO.getHolderCount(now).toLocaleString();

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
    initLiveStrip();
    GOOB_TICKER.init();
  });
})();
