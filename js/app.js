(() => {
  const CFG = GOOB_CONFIG;
  const DEMO = GOOB_DEMO;

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
    const text = CFG.caLive ? CFG.contractAddress : CFG.copyCaText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => toast("Copied to clipboard"))
        .catch(() => (fallbackCopy(text) ? toast("Copied to clipboard") : toast(text)));
    } else {
      toast(fallbackCopy(text) ? "Copied to clipboard" : text);
    }
  }

  function initGlobalClicks() {
    document.addEventListener("click", (e) => {
      const buyEl = e.target.closest("[data-buy]");
      if (buyEl) {
        if (!CFG.caLive) {
          e.preventDefault();
          toast(CFG.soonToast);
        }
        return;
      }
      const socialEl = e.target.closest("[data-social]");
      if (socialEl) {
        const url = CFG.socials[socialEl.dataset.social];
        if (!url) {
          e.preventDefault();
          toast(CFG.soonToast);
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
        toast(CFG.soonToast);
      }
    });
  }

  function initStaticContent() {
    const minHunt = document.getElementById("engine-min-hunt");
    if (minHunt) minHunt.textContent = `${CFG.minHuntSol} SOL`;
    const slippage = document.getElementById("engine-slippage");
    if (slippage) slippage.textContent = `${CFG.slippagePct}%`;
    const heroStatus = document.getElementById("hero-status-text");
    if (heroStatus) heroStatus.textContent = CFG.caLive ? "on-chain · real hunts" : "hunt armed";

    if (CFG.caLive) {
      document.querySelectorAll("[data-buy]").forEach((el) => {
        el.classList.remove("is-soon");
        el.removeAttribute("aria-disabled");
      });
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
    if (it.type === "hunt") {
      return `<span class="tick tick-hunt">💥 hunt #${it.id} · ${it.sol.toFixed(2)} SOL → 🔥 ${DEMO.formatStonk(it.stonk)} ${CFG.huntTicker} · ${DEMO.formatAgo(it.atMs, now)}</span>`;
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

  function renderHuntRow(h) {
    const d = new Date(h.atMs);
    let statusHtml, mid;
    if (h.status === "done") {
      statusHtml = '<span class="status status-done">done</span>';
      mid = `claimed ${h.sol.toFixed(4)} SOL → bought ${DEMO.formatStonk(h.stonk)} ${CFG.huntTicker} → fed holders
        <span class="explorer-links"><a href="#" data-soon>claim ↗</a> · <a href="#" data-soon>buy ↗</a> · <a href="#" data-soon>feed ↗</a></span>`;
    } else if (h.status === "rolled") {
      statusHtml = '<span class="status status-rolled">rolled</span>';
      mid = `${h.sol.toFixed(4)} SOL — too small, waits for the next hunt`;
    } else {
      statusHtml = '<span class="status status-failed">failed</span>';
      mid = `claim reverted — retries on the next hunt`;
    }
    const amount = h.status === "done" ? `🔥 ${DEMO.formatStonk(h.stonk)}` : "—";
    const usd = h.status === "done" ? `$${h.usd.toFixed(2)}` : "";
    return `<div class="round" data-hunt="${h.id}">
      <div class="round-left">
        <div class="round-title">Hunt #${h.id}</div>
        <div class="round-time">${d.toLocaleString()}</div>
        ${statusHtml}
      </div>
      <div class="round-mid">${mid}</div>
      <div class="round-right">
        <div class="round-amount">${amount}</div>
        <div class="round-usd">${usd}</div>
      </div>
    </div>`;
  }

  function renderHunts() {
    const rows = document.getElementById("hunts-rows");
    if (!rows) return;
    const hunts = DEMO.getHuntsList(Date.now(), 50);
    rows.innerHTML = hunts.map(renderHuntRow).join("") || '<p class="lead">No hunts yet. The log starts with the first claim.</p>';
  }

  function flashStage() {
    const stage = document.getElementById("stage");
    if (!stage) return;
    stage.classList.add("stage-hit");
    setTimeout(() => stage.classList.remove("stage-hit"), 900);
  }

  function initCountdown() {
    const clock = document.getElementById("clock");
    const bar = document.getElementById("progress-bar");
    const fuel = document.getElementById("fuel-amount");
    const lastHunt = document.getElementById("last-hunt-amount");
    let lastCycle = null;

    function tick() {
      const now = Date.now();
      const nextAt = DEMO.nextHuntAtMs(now);
      const remainMs = Math.max(0, nextAt - now);
      const remainS = Math.ceil(remainMs / 1000);
      const mm = String(Math.floor(remainS / 60)).padStart(2, "0");
      const ss = String(remainS % 60).padStart(2, "0");
      if (clock) {
        clock.textContent = `${mm}:${ss}`;
        clock.classList.toggle("warn", remainMs < 10000);
      }
      const elapsed = CFG.INTERVAL_SEC - remainS;
      const pct = Math.min(100, Math.max(0, (elapsed / CFG.INTERVAL_SEC) * 100));
      if (bar) bar.style.width = pct + "%";
      if (fuel) fuel.textContent = `${DEMO.getFuel(now).toFixed(4)} SOL`;
      if (lastHunt) {
        const last = DEMO.getLastHunt(now);
        lastHunt.textContent = last ? `${last.sol.toFixed(4)} SOL` : "—";
      }

      const cycle = DEMO.cycleAt(now);
      if (lastCycle === null) lastCycle = cycle;
      if (cycle !== lastCycle) {
        lastCycle = cycle;
        renderTicker();
        renderHunts();
        flashStage();
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  function initReducedMotion() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReducedMotion();
    initStaticContent();
    initGlobalClicks();
    initScrollspy();
    renderTicker();
    renderHunts();
    initCountdown();
    setInterval(renderTicker, CFG.poll.tradesMs);
    setInterval(renderHunts, CFG.poll.huntsMs);
    GOOB_CHART.init();
  });
})();
