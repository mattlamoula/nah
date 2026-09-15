(() => {
  const CFG = GOOB_CONFIG;
  const DEMO = GOOB_DEMO;
  const COPY = GOOB_COPY;

  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function applyCopy() {
    document.querySelectorAll("[data-copy]").forEach((el) => {
      const val = getByPath(COPY, el.dataset.copy);
      if (typeof val === "string") el.textContent = val;
    });
    document.title = COPY.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", COPY.meta.description);
  }

  function renderHowSteps() {
    const el = document.getElementById("how-steps");
    if (!el) return;
    el.innerHTML = COPY.how.steps
      .map((s) => `<div class="mini-tile"><div class="badge">${s.n}</div><h4>${s.title}</h4><p>${s.body}</p></div>`)
      .join("");
  }

  function renderRulesItems() {
    const el = document.getElementById("rules-items");
    if (!el) return;
    el.innerHTML = COPY.rules.items.map((r) => `<li><h4>${r.title}</h4><p>${r.body}</p></li>`).join("");
  }

  function renderEngineRows() {
    const el = document.getElementById("engine-rows");
    if (!el) return;
    const rows = COPY.rules.engineRows;
    const val = (v) => (typeof v === "function" ? v(CFG.taxPct) : v);
    el.innerHTML = [rows.pair, rows.tax, rows.team, rows.payout, rows.claim]
      .map((r) => `<div class="engine-row"><span>${r.label}</span><strong>${val(r.value)}</strong></div>`)
      .join("");
  }

  function renderMiniFacts() {
    const el = document.getElementById("mini-facts");
    if (!el) return;
    const items = [
      { img: "goob/wave.png", text: COPY.social.miniFactDev },
      { img: "goob/jump.png", text: COPY.social.miniFactTax(CFG.taxPct) },
      { img: "goob/point.png", text: COPY.social.miniFactSupply },
    ];
    el.innerHTML = items.map((i) => `<div class="mini-fact"><img src="${i.img}" alt="" /><span>${i.text}</span></div>`).join("");
  }

  function renderLore() {
    const el = document.getElementById("lore-paragraphs");
    if (!el) return;
    el.innerHTML = COPY.social.loreParagraphs.map((p) => `<p>${p}</p>`).join("");
  }

  function renderUnderlyingFacts() {
    const el = document.getElementById("underlying-facts");
    if (!el) return;
    el.innerHTML = COPY.underlying.facts.map((f) => `<span class="fact-chip">${f}</span>`).join("");
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch (e) {
      return false;
    }
  }

  function copyCA() {
    const text = CFG.caLive ? CFG.contractAddress : COPY.copyCaText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast(COPY.copiedToast))
        .catch(() => toast(fallbackCopy(text) ? COPY.copiedToast : text));
    } else {
      toast(fallbackCopy(text) ? COPY.copiedToast : text);
    }
  }

  function initGlobalClicks() {
    document.addEventListener("click", (e) => {
      const buyEl = e.target.closest("[data-buy]");
      if (buyEl) {
        if (!CFG.caLive) {
          e.preventDefault();
          toast(COPY.soonToast);
        }
        return;
      }
      const socialEl = e.target.closest("[data-social]");
      if (socialEl) {
        const url = CFG.socials[socialEl.dataset.social];
        if (!url) {
          e.preventDefault();
          toast(COPY.soonToast);
        }
        return;
      }
      const copyEl = e.target.closest("[data-copy-ca]");
      if (copyEl) {
        e.preventDefault();
        copyCA();
        return;
      }
      const soonEl = e.target.closest("[data-soon]");
      if (soonEl) {
        e.preventDefault();
        toast(COPY.soonToast);
      }
    });
  }

  function initStaticContent() {
    document.querySelectorAll("[data-kpi-tax]").forEach((el) => (el.textContent = COPY.kpis.taxNum(CFG.taxPct)));
    document.querySelectorAll("[data-live-tax]").forEach((el) => (el.textContent = `${CFG.taxPct}%`));
    if (CFG.caLive) {
      document.querySelectorAll("[data-buy]").forEach((el) => {
        el.classList.remove("is-soon");
        el.removeAttribute("aria-disabled");
      });
      const status = document.querySelector("[data-copy='hero.chipStatus']");
      if (status) status.textContent = "on-chain · real hunts";
    }
    document.querySelectorAll("[data-social]").forEach((el) => {
      const url = CFG.socials[el.dataset.social];
      if (url) el.href = url;
    });
  }

  function initScrollspy() {
    const tabs = Array.from(document.querySelectorAll(".tab[href^='#']"));
    const targets = tabs
      .map((tab) => ({ tab, el: document.querySelector(tab.getAttribute("href")) }))
      .filter((t) => t.el);
    if (!targets.length) return;

    let ticking = false;
    function update() {
      let active = targets[0];
      targets.forEach((t) => {
        if (t.el.getBoundingClientRect().top < 140) active = t;
      });
      tabs.forEach((t) => t.classList.remove("on"));
      active.tab.classList.add("on");
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });
    update();
  }

  function renderTickItem(it, now) {
    if (it.type === "feed") {
      return `<span class="tick tick-feed">🍽️ ${COPY.ticker.feed(DEMO.formatStonk(it.stonk))} · ${DEMO.formatAgo(it.atMs, now)}</span>`;
    }
    const emoji = it.type === "buy" ? "🟢" : "🔴";
    return `<span class="tick tick-${it.type}">${emoji} ${it.type} ${it.wallet} ${it.sol.toFixed(2)} SOL · ${DEMO.formatAgo(it.atMs, now)}</span>`;
  }

  function renderTicker() {
    const track = document.getElementById("ticker-track");
    const outer = document.querySelector(".ticker-outer");
    if (!track) return;
    const now = Date.now();
    const items = DEMO.getTicks(now, 20);
    if (!items.length) {
      if (outer) outer.hidden = true;
      return;
    }
    if (outer) outer.hidden = false;
    const html = items.map((it) => renderTickItem(it, now)).join("");
    track.innerHTML = html + html;
  }

  function renderFeedRow(f) {
    const d = new Date(f.atMs);
    return `<div class="round" data-hunt="${f.id}">
      <div class="round-left">
        <div class="round-title">Feed #${f.id}</div>
        <div class="round-time">${d.toLocaleString()}</div>
      </div>
      <div class="round-mid">
        ${COPY.feedLog.row(DEMO.formatStonk(f.stonk))}
        <span class="explorer-links"><a href="#" data-soon>${COPY.feedLog.linkBuy}</a> · <a href="#" data-soon>${COPY.feedLog.linkFeed}</a></span>
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
    const feeds = DEMO.getFeedsList(Date.now(), 50);
    rows.innerHTML = feeds.map(renderFeedRow).join("") || `<p class="lead">${COPY.feedLog.empty}</p>`;
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

      const last = DEMO.getLastFeed(now);
      const lastEl = document.getElementById("live-last-hunt");
      if (lastEl) lastEl.textContent = last ? `${DEMO.formatStonk(last.stonk)} $STONK` : COPY.liveStrip.lastHuntFallback;

      const holdersEl = document.getElementById("live-holders");
      if (holdersEl) holdersEl.textContent = DEMO.getHolderCount(now).toLocaleString();

      const curId = last ? last.id : null;
      if (lastSeenId === null) lastSeenId = curId;
      if (curId !== null && curId !== lastSeenId) {
        lastSeenId = curId;
        renderTicker();
        renderFeedLog();
        flashLiveStrip();
      }
    }
    tick();
    setInterval(tick, CFG.poll.infoMs);
  }

  function initReducedMotion() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReducedMotion();
    applyCopy();
    renderHowSteps();
    renderRulesItems();
    renderEngineRows();
    renderMiniFacts();
    renderLore();
    renderUnderlyingFacts();
    initStaticContent();
    initGlobalClicks();
    initScrollspy();
    renderTicker();
    renderFeedLog();
    initLiveStrip();
    setInterval(renderTicker, CFG.poll.tradesMs);
    setInterval(renderFeedLog, CFG.poll.feedMs);
    GOOB_CHART.init();
  });
})();
