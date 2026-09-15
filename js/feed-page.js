(() => {
  const DEMO = GOOB_DEMO;
  const COPY = GOOB_COPY;

  function renderFeedRow(f) {
    const d = new Date(f.atMs);
    return `<div class="round" data-hunt="${f.id}">
      <div class="round-left">
        <div class="round-title">Hunt #${f.id}</div>
        <div class="round-time">${d.toLocaleString()}</div>
      </div>
      <div class="round-mid">
        ${COPY.feedPage.row(DEMO.formatStonk(f.stonk))}
        <span class="explorer-links"><a href="#" data-soon>${COPY.feedPage.linkBuy}</a> · <a href="#" data-soon>${COPY.feedPage.linkFeed}</a></span>
      </div>
      <div class="round-right">
        <div class="round-amount">🔥 ${DEMO.formatStonk(f.stonk)}</div>
        <div class="round-usd">$${f.usd.toFixed(2)}</div>
      </div>
    </div>`;
  }

  function renderFeedLog() {
    const rows = document.getElementById("feed-rows");
    if (!rows) return;
    const feeds = DEMO.getFeedsList(Date.now(), 100);
    rows.innerHTML = feeds.map(renderFeedRow).join("") || `<p class="lead">${COPY.feedPage.empty}</p>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    GOOB_CHROME.init();
    renderFeedLog();
    setInterval(renderFeedLog, GOOB_CONFIG.poll.feedMs);
  });
})();
