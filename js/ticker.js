// The scrolling tape under the nav. Always-real items: the pair/tax fact
// and the (demo) cumulative $STONK fed total. Everything else comes from
// StonkFun's own public API (stonkfun-live.js) and only appears once its
// specific value actually arrives — never as a dash, never partially (the
// $STONK quote needs both price and mcap together). No per-hunt entries
// and no "last hunt" — that already lives in the live-fed strip.
const GOOB_TICKER = (() => {
  const CFG = GOOB_CONFIG;
  const DEMO = GOOB_DEMO;
  const COPY = GOOB_COPY;
  const SF = GOOB_STONKFUN_LIVE;

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
    const items = [
      { ...COPY.ticker.pairFact(CFG.taxPct) },
      { ...COPY.ticker.fedSoFar(DEMO.formatBig(DEMO.cumulativeFedAt(now / 1000))), href: "/feed" },
    ];

    const priceText = SF.getPriceText();
    const mcapText = SF.getMcapText();
    if (priceText && mcapText) {
      items.push({ ...COPY.ticker.stonkQuote(priceText, mcapText), href: SF.siteUrl, external: true });
    }

    const buybackText = SF.getBuybackText();
    if (buybackText) {
      items.push({ ...COPY.ticker.padBuyback(buybackText), href: SF.siteUrl, external: true });
    }

    const burnText = SF.getBurnText();
    if (burnText) {
      items.push({ ...COPY.ticker.stonkBurned(burnText), href: SF.siteUrl, external: true });
    }

    SF.getNewTokens().forEach((t) => {
      items.push({ ...COPY.ticker.newOnPad(t.symbol), href: SF.siteUrl, external: true });
    });

    const pairsCount = SF.getPairsCount();
    if (pairsCount != null) {
      items.push({ ...COPY.ticker.pairsQuoted(pairsCount), href: SF.siteUrl, external: true });
    }

    return items;
  }

  function render() {
    const track = document.getElementById("nav-ticker-track");
    if (!track) return;
    const items = buildItems(Date.now()).map(renderItem).join('<span class="tick-sep">·</span>');
    track.innerHTML = items + '<span class="tick-sep">·</span>' + items + '<span class="tick-sep">·</span>';
  }

  function init() {
    render();
    // Re-renders on its own 25s refresh; app.js also calls refresh()
    // immediately when a new demo hunt lands, so "Fed so far" stays current.
    SF.init(render);
  }

  return { init, refresh: render };
})();
