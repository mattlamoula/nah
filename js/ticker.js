// The scrolling tape under the nav: ~70% $GOOB hunt events (from the demo
// engine — still simulated pre-launch), ~30% $STONK facts (real live price/
// mcap from Dexscreener, plus static pair facts). Never fabricates a number:
// a failed $STONK fetch renders as an em dash, the tape keeps moving.
const GOOB_TICKER = (() => {
  const CFG = GOOB_CONFIG;
  const DEMO = GOOB_DEMO;
  const COPY = GOOB_COPY;

  function itemHtml(item) {
    return `<span class="tick-emoji">${item.emoji}</span><b>${item.event}</b><span class="tick-detail">${item.detail}</span>`;
  }

  function renderItem(item) {
    const inner = itemHtml(item);
    if (item.href) {
      const target = item.external ? ' target="_blank" rel="noopener"' : "";
      return `<a class="tick" href="${item.href}"${target}>${inner}</a>`;
    }
    return `<span class="tick">${inner}</span>`;
  }

  function buildItems(now) {
    const huntItems = [];
    const last = DEMO.getLastFeed(now);
    if (last) {
      huntItems.push({ ...COPY.ticker.lastHunt(DEMO.formatStonk(last.stonk), DEMO.formatAgo(last.atMs, now)), href: "/feed" });
    }
    const recent = DEMO.getFeedsList(now, 4);
    recent.forEach((f, i) => {
      const tpl = i % 2 === 0 ? COPY.ticker.huntSent(f.id, DEMO.formatStonk(f.stonk)) : COPY.ticker.huntBought(f.id, DEMO.formatStonk(f.stonk));
      huntItems.push({ ...tpl, href: "/feed" });
    });
    huntItems.push({ ...COPY.ticker.fedSoFar(DEMO.formatBig(DEMO.cumulativeFedAt(now / 1000))), href: "/feed" });

    const priceText = GOOB_STONK_LIVE.getPriceText();
    const mcapText = GOOB_STONK_LIVE.getMcapText();
    const stonkItems = [
      { ...COPY.ticker.stonkPrice(priceText || COPY.ticker.dash), href: GOOB_STONK_LIVE.dexUrl, external: true },
      { ...COPY.ticker.stonkMcap(mcapText || COPY.ticker.dash), href: GOOB_STONK_LIVE.dexUrl, external: true },
      Math.floor(now / 60000) % 2 === 0 ? COPY.ticker.pairFact(CFG.taxPct) : COPY.ticker.volumeFact(),
    ];

    // Interleave so the newest hunt leads and stonk facts are spread through
    // the loop rather than clumped at the end.
    const out = [];
    let hi = 0,
      si = 0;
    const pattern = ["h", "h", "s", "h", "h", "s", "h", "s", "h", "h"];
    pattern.forEach((kind) => {
      if (kind === "h" && hi < huntItems.length) out.push(huntItems[hi++]);
      else if (kind === "s" && si < stonkItems.length) out.push(stonkItems[si++]);
    });
    while (hi < huntItems.length) out.push(huntItems[hi++]);
    while (si < stonkItems.length) out.push(stonkItems[si++]);
    return out;
  }

  function render() {
    const track = document.getElementById("nav-ticker-track");
    if (!track) return;
    const now = Date.now();
    const items = buildItems(now).map(renderItem).join('<span class="tick-sep">·</span>');
    track.innerHTML = items + '<span class="tick-sep">·</span>' + items + '<span class="tick-sep">·</span>';
  }

  function init() {
    render();
    GOOB_STONK_LIVE.init(render);
    setInterval(render, CFG.poll.tradesMs);
  }

  return { init, refresh: render };
})();
