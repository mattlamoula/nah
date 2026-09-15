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
  };
  let lastFeeds = [];

  function genesisSec() {
    return GOOB_DEMO.GENESIS_CYCLE * GOOB_DEMO.TICK_SEC;
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

  function feedsInView() {
    const startCycle = Math.floor(state.viewStart / GOOB_DEMO.TICK_SEC) - 1;
    const endCycle = Math.ceil(state.viewEnd / GOOB_DEMO.TICK_SEC) + 1;
    const out = [];
    for (let c = startCycle; c <= endCycle; c++) {
      const f = GOOB_DEMO.getFeed(c);
      if (f && f.atMs / 1000 >= state.viewStart && f.atMs / 1000 <= state.viewEnd) out.push(f);
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
      pts.push([t, GOOB_DEMO.cumulativeFedAt(t)]);
    }
    let pmin = Infinity,
      pmax = -Infinity;
    pts.forEach(([, p]) => {
      if (p < pmin) pmin = p;
      if (p > pmax) pmax = p;
    });
    if (pmax === pmin) pmax = pmin + 1;
    const padP = (pmax - pmin) * 0.15;
    pmin = Math.max(0, pmin - padP);
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
      ctx.fillText(GOOB_DEMO.formatBig(p) + " $STONK", padLeft + 4, y - 4);
    }
    const tickCount = 5;
    for (let i = 0; i <= tickCount; i++) {
      const t = state.viewStart + ((state.viewEnd - state.viewStart) * i) / tickCount;
      const x = mapT(t);
      ctx.fillText(fmtAxisTime(t), Math.min(Math.max(x - 24, 0), width - 60), height - 8);
    }

    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const grad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    grad.addColorStop(0, "rgba(46,179,196,0.30)");
    grad.addColorStop(1, "rgba(46,179,196,0)");
    ctx.beginPath();
    pts.forEach(([t, p], i) => {
      const x = mapT(t);
      const y = mapP(p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
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

    lastFeeds = feedsInView();
    lastFeeds.forEach((f) => {
      const x = mapT(f.atMs / 1000);
      const y = mapP(GOOB_DEMO.cumulativeFedAt(f.atMs / 1000));
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

      f._x = x;
      f._y = y;
    });

    if (state.following) {
      const x = mapT(lastPt[0]);
      const y = mapP(lastPt[1]);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#111111";
      ctx.fill();
    }

    drawNotLiveWatermark();
  }

  // Baked into the pixels (not a DOM overlay) so a cropped screenshot of just
  // the chart can't be passed off as real performance without this coming along.
  function drawNotLiveWatermark() {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-14 * Math.PI) / 180);
    ctx.font = "800 13px 'Inter', sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(4, 20, 26, 0.16)";
    const label = "NOT LIVE  ·  DEMO TAPE   ";
    const stepX = ctx.measureText(label).width + 8;
    const stepY = 42;
    const diag = Math.sqrt(width * width + height * height);
    for (let y = -diag; y <= diag; y += stepY) {
      for (let x = -diag; x <= diag; x += stepX) {
        ctx.fillText(label, x, y);
      }
    }
    ctx.restore();
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

  function nearestFeed(px, py) {
    let best = null,
      bestD = 12;
    lastFeeds.forEach((f) => {
      if (f._x == null) return;
      const d = Math.hypot(f._x - px, (f._y ?? py) - py);
      if (d < bestD) {
        bestD = d;
        best = f;
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

    const feed = nearestFeed(x, y);
    if (feed) {
      canvas.style.cursor = "pointer";
      const d = new Date(feed.atMs);
      showTooltip(x, y, GOOB_COPY.chart.huntTooltip(feed.id, feed.sol.toFixed(2), GOOB_DEMO.formatStonk(feed.stonk), d.toLocaleTimeString()));
    } else {
      canvas.style.cursor = "default";
      const t = mapX(x);
      const total = GOOB_DEMO.cumulativeFedAt(t);
      showTooltip(x, y, GOOB_COPY.chart.totalTooltip(GOOB_DEMO.formatBig(total), new Date(t * 1000).toLocaleString()));
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
      const feed = nearestFeed(x, y);
      if (feed) scrollToFeed(feed.id);
    }
    state.dragging = false;
  }

  function scrollToFeed(id) {
    const row = document.querySelector(`[data-hunt="${id}"]`);
    if (!row) return;
    row.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    row.classList.add("feed-row-hit");
    setTimeout(() => row.classList.remove("feed-row-hit"), 1400);
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

  function updateHeaderAndBar() {
    const nowMs = Date.now();
    const total = GOOB_DEMO.cumulativeFedAt(nowMs / 1000);
    const headerNum = document.getElementById("chart-header-num");
    if (headerNum) headerNum.textContent = `${GOOB_DEMO.formatBig(total)} $STONK`;
    const fallback = document.getElementById("chart-fallback-price");
    if (fallback) fallback.textContent = GOOB_COPY.chart.fallbackPrefix + Math.round(total).toLocaleString() + " $STONK";

    const milestone = niceMilestone(total);
    const fill = document.getElementById("feed-bar-fill");
    if (fill) fill.style.width = Math.min(100, (total / milestone) * 100) + "%";
    const caption = document.getElementById("feed-bar-caption");
    if (caption) {
      caption.textContent = GOOB_COPY.chart.feedBarCaption(Math.round(total).toLocaleString(), milestone.toLocaleString());
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
