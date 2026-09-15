// The scrolling tape under the nav. Exactly four rotating facts, in this
// order: the pair/tax fact, the (demo) cumulative $STONK fed total, and two
// genuinely real $STONK figures from Dexscreener (price, mcap). No per-hunt
// entries and no "last hunt" — that already lives in the live-fed strip.
// Never fabricates a number: a failed $STONK fetch renders as an em dash.
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
    const priceText = GOOB_STONK_LIVE.getPriceText();
    const mcapText = GOOB_STONK_LIVE.getMcapText();
    return [
      { ...COPY.ticker.pairFact(CFG.taxPct) },
      { ...COPY.ticker.fedSoFar(DEMO.formatBig(DEMO.cumulativeFedAt(now / 1000))), href: "/feed" },
      { ...COPY.ticker.stonkPrice(priceText || COPY.ticker.dash), href: GOOB_STONK_LIVE.dexUrl, external: true },
      { ...COPY.ticker.stonkMcap(mcapText || COPY.ticker.dash), href: GOOB_STONK_LIVE.dexUrl, external: true },
    ];
  }

  function render() {
    const track = document.getElementById("nav-ticker-track");
    if (!track) return;
    const items = buildItems(Date.now()).map(renderItem).join('<span class="tick-sep">·</span>');
    track.innerHTML = items + '<span class="tick-sep">·</span>' + items + '<span class="tick-sep">·</span>';
  }

  function init() {
    render();
    // Re-renders on its own 20s price refresh; app.js also calls refresh()
    // immediately when a new demo hunt lands, so "Fed so far" stays current.
    GOOB_STONK_LIVE.init(render);
  }

  return { init, refresh: render };
})();
