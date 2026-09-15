const GOOB_CHART = (() => {
  const RANGES = { "15M": 900, "1H": 3600, "6H": 21600, "24H": 86400, All: null };
  const MILESTONES = [1e5, 2.5e5, 5e5, 1e6, 2.5e6, 5e6, 1e7, 2.5e7, 5e7, 1e8, 2.5e8, 5e8];
  const reduced = () => document.documentElement.classList.contains("reduced-motion");

  let canvas, ctx, wrap, tooltip;
  let width = 0,
    height = 0,
    dpr = 1;
  const state = {
    rangeKey: "6H",
    viewStart: 0,
    viewEnd: 0,
    following: true,
    dragging: false,
    dragMoved: false,
    dragStartX: 0,
    dragStartView: null,
    hoverX: null,
    hoverHunt: null,
  };
  let lastHunts = [];

  function genesisSec() {
    return (GOOB_DEMO.GENESIS_CYCLE * GOOB_DEMO.INTERVAL_SEC);
  }

  function nowSec() {
    return Date.now() / 1000;
  }

  function setRange(key) {
    state.rangeKey = key;
    const span = RANGES[key] || nowSec() - genesisSec();
    state.viewEnd = nowSec();
    state.viewStart = state.viewEnd - span;
    state.following = true;
    document.querySelectorAll(".pill-range").forEach((b) => b.classList.toggle("on", b.dataset.range === key));
    render();
  }

  function followLive() {
    if (!state.following) return;
    const span = state.viewEnd - state.viewStart;
    state.viewEnd = nowSec();
    state.viewStart = state.viewEnd - span;
  }

  function resizeCanvas() {
    const rect = wrap.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function mapT(t) {
    return ((t - state.viewStart) / (state.viewEnd - state.viewStart)) * width;
  }
  function mapX(x) {
    return state.viewStart + (x / width) * (state.viewEnd - state.viewStart);
  }

  function huntsInView() {
    const startCycle = Math.floor(state.viewStart / GOOB_DEMO.INTERVAL_SEC) - 1;
    const endCycle = Math.ceil(state.viewEnd / GOOB_DEMO.INTERVAL_SEC) + 1;
    const out = [];
    for (let c = startCycle; c <= endCycle; c++) {
      const h = GOOB_DEMO.getHunt(c);
      if (h && h.status === "done" && h.atMs / 1000 >= state.viewStart && h.atMs / 1000 <= state.viewEnd) {
        out.push(h);
      }
    }
    // Decimate by pixel spacing so wide zooms (24H/All) don't pack hundreds of
    // markers into an unreadable smear; always keep the most recent one.
    const minGapSec = (16 / width) * (state.viewEnd - state.viewStart);
    const decimated = [];
    let lastT = Infinity;
    for (let i = out.length - 1; i >= 0; i--) {
      const t = out[i].atMs / 1000;
      if (lastT === Infinity || lastT - t >= minGapSec) {
        decimated.unshift(out[i]);
        lastT = t;
      }
    }
    return decimated;
  }

  function render() {
    if (!ctx || width < 10) return;
    ctx.clearRect(0, 0, width, height);

    const padTop = 14,
      padBottom = 26,
      padLeft = 4,
      padRight = 4;
    const plotH = height - padTop - padBottom;

    const samples = Math.min(width, 900);
    const pts = [];
    for (let i = 0; i <= samples; i++) {
      const t = state.viewStart + (i / samples) * (state.viewEnd - state.viewStart);
      pts.push([t, GOOB_DEMO.priceAt(t)]);
    }
    let pmin = Infinity,
      pmax = -Infinity;
    pts.forEach(([, p]) => {
      if (p < pmin) pmin = p;
      if (p > pmax) pmax = p;
    });
    const padP = (pmax - pmin) * 0.15 || pmax * 0.1;
    pmin -= padP;
    pmax += padP;

    const mapP = (p) => padTop + (1 - (p - pmin) / (pmax - pmin)) * plotH;

    ctx.strokeStyle = "rgba(17,17,17,0.06)";
    ctx.lineWidth = 1;
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#9a9a9a";
    for (let i = 0; i <= 3; i++) {
      const y = padTop + (plotH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      const p = pmax - ((pmax - pmin) * i) / 3;
      ctx.fillText("$" + p.toFixed(7), padLeft + 4, y - 4);
    }
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const t = state.viewStart + ((state.viewEnd - state.viewStart) * i) / tickCount;
      const x = mapT(t);
      ctx.fillText(fmtAxisTime(t), Math.min(Math.max(x - 24, 0), width - 60), height - 8);
    }

    ctx.beginPath();
    pts.forEach(([t, p], i) => {
      const x = mapT(t);
      const y = mapP(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    grad.addColorStop(0, "rgba(46,179,196,0.30)");
    grad.addColorStop(1, "rgba(46,179,196,0)");
    ctx.save();
    ctx.lineTo(mapT(lastPt[0]), height - padBottom);
    ctx.lineTo(mapT(firstPt[0]), height - padBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    ctx.beginPath();
    pts.forEach(([t, p], i) => {
      const x = mapT(t);
      const y = mapP(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    lastHunts = huntsInView();
    lastHunts.forEach((h) => {
      const x = mapT(h.atMs / 1000);
      const y = mapP(GOOB_DEMO.priceAt(h.atMs / 1000));
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(4,20,26,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, height - padBottom);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#04141a";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2eb3c4";
      ctx.stroke();
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔥", x, y + 1);
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";

      h._x = x;
      h._y = y;
    });

    if (state.following) {
      const x = mapT(lastPt[0]);
      const y = mapP(lastPt[1]);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#111111";
      ctx.fill();
    }
  }

  function fmtAxisTime(tSec) {
    const d = new Date(tSec * 1000);
    if (state.rangeKey === "15M" || state.rangeKey === "1H") {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }
    if (state.rangeKey === "6H" || state.rangeKey === "24H") {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  function nearestHunt(px, py) {
    let best = null,
      bestD = 12;
    lastHunts.forEach((h) => {
      if (h._x == null) return;
      const d = Math.hypot(h._x - px, (h._y ?? py) - py);
      if (d < bestD) {
        bestD = d;
        best = h;
      }
    });
    return best;
  }

  function showTooltip(x, y, html) {
    tooltip.innerHTML = html;
    tooltip.hidden = false;
    const tw = tooltip.offsetWidth,
      th = tooltip.offsetHeight;
    tooltip.style.left = Math.min(Math.max(x + 12, 4), width - tw - 4) + "px";
    tooltip.style.top = Math.min(Math.max(y - th - 12, 4), height - th - 4) + "px";
  }
  function hideTooltip() {
    tooltip.hidden = true;
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (state.dragging) {
      const dx = x - state.dragStartX;
      if (Math.abs(dx) > 3) state.dragMoved = true;
      const span = state.dragStartView.end - state.dragStartView.start;
      const dt = (dx / width) * span;
      state.viewStart = state.dragStartView.start - dt;
      state.viewEnd = state.dragStartView.end - dt;
      state.following = Math.abs(state.viewEnd - nowSec()) < span * 0.02;
      render();
      hideTooltip();
      return;
    }

    const hunt = nearestHunt(x, y);
    if (hunt) {
      canvas.style.cursor = "pointer";
      const d = new Date(hunt.atMs);
      showTooltip(
        x,
        y,
        `hunt #${hunt.id} · ${hunt.sol.toFixed(2)} SOL → ${GOOB_DEMO.formatStonk(hunt.stonk)} ${GOOB_CONFIG.huntTicker} · ${d.toLocaleTimeString()} · click for tx`
      );
    } else {
      canvas.style.cursor = "default";
      const t = mapX(x);
      const p = GOOB_DEMO.priceAt(t);
      showTooltip(x, y, `$${p.toFixed(7)} · ${new Date(t * 1000).toLocaleString()}`);
    }
  }

  function onLeave() {
    hideTooltip();
    canvas.style.cursor = "default";
  }

  function onDown(e) {
    state.dragging = true;
    state.dragMoved = false;
    state.dragStartX = e.clientX - canvas.getBoundingClientRect().left;
    state.dragStartView = { start: state.viewStart, end: state.viewEnd };
  }

  function onUp(e) {
    if (state.dragging && !state.dragMoved) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const hunt = nearestHunt(x, y);
      if (hunt) scrollToHunt(hunt.id);
    }
    state.dragging = false;
  }

  function scrollToHunt(id) {
    const row = document.querySelector(`[data-hunt="${id}"]`);
    if (!row) return;
    row.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    row.classList.add("hunt-row-hit");
    setTimeout(() => row.classList.remove("hunt-row-hit"), 1400);
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const tCursor = mapX(x);
    const span = state.viewEnd - state.viewStart;
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const maxSpan = nowSec() - genesisSec();
    const newSpan = Math.min(maxSpan, Math.max(45, span * factor));
    state.viewStart = tCursor - (tCursor - state.viewStart) * (newSpan / span);
    state.viewEnd = state.viewStart + newSpan;
    state.following = Math.abs(state.viewEnd - nowSec()) < newSpan * 0.02;
    render();
  }

  function niceMilestone(x) {
    for (const m of MILESTONES) if (m > x) return m;
    return MILESTONES[MILESTONES.length - 1] * 2;
  }

  function cumulativeFed(nowMs) {
    const n = GOOB_DEMO.cycleAt(nowMs);
    let total = 0;
    for (let k = GOOB_DEMO.GENESIS_CYCLE; k < n; k++) {
      const h = GOOB_DEMO.getHunt(k);
      if (h && h.status === "done") total += h.stonk;
    }
    return total;
  }

  function updateHeaderAndBar() {
    const nowMs = Date.now();
    const price = GOOB_DEMO.priceAt(nowMs / 1000);
    const mcap = price * GOOB_CONFIG.supply;
    const mcapEl = document.getElementById("chart-mcap");
    if (mcapEl) mcapEl.textContent = GOOB_DEMO.formatMcap(mcap);
    const fallback = document.getElementById("chart-fallback-price");
    if (fallback) fallback.textContent = "$" + price.toFixed(7);

    const fed = cumulativeFed(nowMs);
    const milestone = niceMilestone(fed);
    const fill = document.getElementById("feed-bar-fill");
    if (fill) fill.style.width = Math.min(100, (fed / milestone) * 100) + "%";
    const caption = document.getElementById("feed-bar-caption");
    if (caption) {
      caption.textContent = `${Math.round(fed).toLocaleString()} / ${milestone.toLocaleString()} ${GOOB_CONFIG.huntTicker} fed to holders`;
    }
  }

  function attachEvents() {
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    document.querySelectorAll(".pill-range").forEach((btn) => {
      btn.addEventListener("click", () => setRange(btn.dataset.range));
    });
    if (window.ResizeObserver) {
      new ResizeObserver(resizeCanvas).observe(wrap);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }
  }

  function init() {
    canvas = document.getElementById("chart-canvas");
    if (!canvas) return;
    wrap = canvas.parentElement;
    ctx = canvas.getContext("2d");
    tooltip = document.getElementById("chart-tooltip");
    attachEvents();
    resizeCanvas();
    setRange("6H");
    updateHeaderAndBar();
    setInterval(() => {
      followLive();
      updateHeaderAndBar();
      render();
    }, GOOB_CONFIG.poll.chartMs);
  }

  return { init };
})();
