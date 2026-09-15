// Deterministic demo-tape engine: every value is a pure function of wall-clock time,
// so the countdown, chart, ticker and hunts log all agree with each other and stay
// consistent across reloads/tabs without any shared backend. Swap for real chain
// reads by keeping the same function names and return shapes.
const GOOB_DEMO = (() => {
  const CFG = GOOB_CONFIG;
  const I = CFG.INTERVAL_SEC;
  const GENESIS_CYCLE = Math.floor(CFG.demoGenesisMs / 1000 / I);
  const BASE_PRICE = 0.0000340;

  function rnd(seed, salt) {
    const x = Math.sin((seed + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function noise(tSec, grid) {
    const g = tSec / grid;
    const i = Math.floor(g);
    const f = g - i;
    const a = rnd(i, 500);
    const b = rnd(i + 1, 500);
    const u = f * f * (3 - 2 * f);
    return a + (b - a) * u;
  }

  function cycleAt(ms) {
    return Math.floor(ms / 1000 / I);
  }

  function statusFor(cycle) {
    const r = rnd(cycle, 3);
    if (r < 0.03) return "failed";
    if (r < 0.1) return "rolled";
    return "done";
  }

  function walletStr(seed) {
    const chars = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    let start = "";
    for (let i = 0; i < 4; i++) start += chars[Math.floor(rnd(seed, 200 + i) * chars.length)];
    let end = "";
    for (let i = 0; i < 4; i++) end += chars[Math.floor(rnd(seed, 210 + i) * chars.length)];
    return `${start}…${end}`;
  }

  function txHash(seed, salt) {
    const a = Math.floor(rnd(seed, salt) * 0xffffffff).toString(36);
    const b = Math.floor(rnd(seed, salt + 1) * 0xffffffff).toString(36);
    return (a + b).padEnd(16, "0");
  }

  function getHunt(cycle) {
    const id = cycle - GENESIS_CYCLE + 1;
    if (id < 1) return null;
    const status = statusFor(cycle);
    const r1 = rnd(cycle, 1);
    const r2 = rnd(cycle, 2);
    const sol =
      status === "rolled"
        ? +(0.001 + r1 * 0.008).toFixed(4)
        : +(0.05 + r1 * 0.55).toFixed(4);
    const stonk = Math.round(sol * CFG.demoStonkPerSol * (0.9 + r2 * 0.2));
    const usd = sol * CFG.demoSolUsd;
    const atMs = (cycle + 1) * I * 1000;
    return {
      id,
      cycle,
      status,
      sol,
      stonk,
      usd,
      atMs,
      tx: { claim: txHash(cycle, 11), buy: txHash(cycle, 21), feed: txHash(cycle, 31) },
    };
  }

  function priceAt(tSec) {
    const slow = (noise(tSec, 900) - 0.5) * 0.5;
    const fast = (noise(tSec + 50000, 110) - 0.5) * 0.12;
    const k = Math.floor(tSec / I);
    let pulse = 0;
    for (let c = k - 1; c <= k; c++) {
      if (c < GENESIS_CYCLE) continue;
      const boundary = (c + 1) * I;
      if (boundary <= tSec && statusFor(c) === "done") {
        const amp = 0.01 + rnd(c, 4) * 0.045;
        pulse += amp * Math.exp(-(tSec - boundary) / 45);
      }
    }
    const mult = Math.max(0.15, 1 + slow + fast + pulse);
    return BASE_PRICE * mult;
  }

  function nextHuntAtMs(nowMs) {
    return (cycleAt(nowMs) + 1) * I * 1000;
  }

  function getFuel(nowMs) {
    const n = cycleAt(nowMs);
    const frac = nowMs / 1000 / I - n;
    const target = 0.05 + rnd(n, 1) * 0.55;
    return +(target * Math.min(1, Math.max(0, frac))).toFixed(4);
  }

  function getLastHunt(nowMs) {
    return getHunt(cycleAt(nowMs) - 1);
  }

  function getHuntsList(nowMs, count) {
    const n = cycleAt(nowMs);
    const out = [];
    for (let k = n - 1; k >= GENESIS_CYCLE && out.length < count; k--) {
      const h = getHunt(k);
      if (h) out.push(h);
    }
    return out;
  }

  function getTicks(nowMs, count) {
    const nowSec = Math.floor(nowMs / 1000);
    const out = [];
    let t = nowSec - (nowSec % 6);
    let guard = 0;
    while (out.length < count * 2 && guard < count * 8) {
      const slot = Math.floor(t / 6);
      if (rnd(slot, 100) < 0.55) {
        const isBuy = rnd(slot, 101) < 0.62;
        out.push({
          type: isBuy ? "buy" : "sell",
          wallet: walletStr(slot),
          sol: +(0.02 + rnd(slot, 102) * 0.5).toFixed(2),
          atMs: t * 1000,
        });
      }
      t -= 3 + Math.floor(rnd(slot, 103) * 4);
      guard++;
    }
    const oldestMs = out.length ? out[out.length - 1].atMs : nowMs;
    const n = cycleAt(nowMs);
    for (let k = n - 1; k >= GENESIS_CYCLE && (k + 1) * I * 1000 >= oldestMs; k--) {
      const h = getHunt(k);
      if (h && h.status === "done") {
        out.push({ type: "hunt", id: h.id, sol: h.sol, stonk: h.stonk, atMs: h.atMs });
      }
    }
    out.sort((a, b) => b.atMs - a.atMs);
    return out.slice(0, count);
  }

  function formatAgo(atMs, nowMs) {
    const s = Math.max(0, Math.round((nowMs - atMs) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  }

  function formatStonk(n) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  }

  function formatMcap(n) {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  }

  return {
    GENESIS_CYCLE,
    INTERVAL_SEC: I,
    cycleAt,
    priceAt,
    getHunt,
    getFuel,
    getLastHunt,
    getHuntsList,
    getTicks,
    nextHuntAtMs,
    formatAgo,
    formatStonk,
    formatMcap,
  };
})();
