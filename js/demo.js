// Deterministic demo-tape engine: every value is a pure function of wall-clock
// time, so the live strip, chart, ticker and feed log all agree with each
// other and stay consistent across reloads without a backend. There is no
// countdown here on purpose — $GOOB's tax hunts $STONK on every trade, not on
// a clock, so the "tick" below is only internal pacing for the simulation,
// never surfaced as a product claim. Swap for real chain reads by keeping the
// same function names and return shapes.
const GOOB_DEMO = (() => {
  const CFG = GOOB_CONFIG;
  const TICK = CFG.demoTickSec;
  const GENESIS_CYCLE = Math.floor(CFG.demoGenesisMs / 1000 / TICK);
  const BASE_HOLDERS = 140;
  const HOLDER_GROWTH_PER_HOUR = 3.2;

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
    return Math.floor(ms / 1000 / TICK);
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

  function isFeedCycle(cycle) {
    return rnd(cycle, 3) < CFG.demoFeedChance;
  }

  function getFeed(cycle) {
    if (cycle < GENESIS_CYCLE || !isFeedCycle(cycle)) return null;
    const r1 = rnd(cycle, 1);
    const r2 = rnd(cycle, 2);
    const sol = +(0.05 + r1 * 0.55).toFixed(4);
    const stonk = Math.round(sol * CFG.demoStonkPerSol * (0.9 + r2 * 0.2));
    const usd = sol * CFG.demoSolUsd;
    const atMs = (cycle + 1) * TICK * 1000;
    return {
      id: cycle - GENESIS_CYCLE + 1,
      cycle,
      sol,
      stonk,
      usd,
      atMs,
      tx: { buy: txHash(cycle, 21), feed: txHash(cycle, 31) },
    };
  }

  function getLastFeed(nowMs) {
    const cur = cycleAt(nowMs);
    for (let c = cur; c >= GENESIS_CYCLE; c--) {
      const f = getFeed(c);
      if (f) return f;
    }
    return null;
  }

  function getFeedsList(nowMs, count) {
    const cur = cycleAt(nowMs);
    const out = [];
    for (let c = cur; c >= GENESIS_CYCLE && out.length < count; c--) {
      const f = getFeed(c);
      if (f) out.push(f);
    }
    return out;
  }

  // Cumulative $STONK fed is a step function: flat between feed events, so we
  // only need checkpoints at the events themselves, built incrementally and
  // cached, then binary-searched for any timestamp.
  let checkpoints = null;
  let checkpointsUpToCycle = null;

  function ensureCheckpoints(uptoCycle) {
    if (checkpoints === null) {
      checkpoints = [[GENESIS_CYCLE * TICK, 0]];
      checkpointsUpToCycle = GENESIS_CYCLE - 1;
    }
    if (uptoCycle <= checkpointsUpToCycle) return;
    let total = checkpoints[checkpoints.length - 1][1];
    for (let c = checkpointsUpToCycle + 1; c <= uptoCycle; c++) {
      const f = getFeed(c);
      if (f) {
        total += f.stonk;
        checkpoints.push([f.atMs / 1000, total]);
      }
    }
    checkpointsUpToCycle = uptoCycle;
  }

  function cumulativeFedAt(tSec) {
    ensureCheckpoints(cycleAt(tSec * 1000));
    let lo = 0,
      hi = checkpoints.length - 1,
      ans = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (checkpoints[mid][0] <= tSec) {
        ans = checkpoints[mid][1];
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ans;
  }

  function getHolderCount(nowMs) {
    const tSec = nowMs / 1000;
    const genesisSec = GENESIS_CYCLE * TICK;
    const hours = Math.max(0, (tSec - genesisSec) / 3600);
    const wiggle = (noise(tSec, 1800) - 0.5) * 14;
    return Math.max(1, Math.round(BASE_HOLDERS + hours * HOLDER_GROWTH_PER_HOUR + wiggle));
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
    const cur = cycleAt(nowMs);
    for (let c = cur; c >= GENESIS_CYCLE && c * TICK * 1000 >= oldestMs - TICK * 1000; c--) {
      const f = getFeed(c);
      if (f) out.push({ type: "feed", id: f.id, sol: f.sol, stonk: f.stonk, atMs: f.atMs });
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

  function formatBig(n) {
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(Math.round(n));
  }

  return {
    GENESIS_CYCLE,
    TICK_SEC: TICK,
    cycleAt,
    getFeed,
    getLastFeed,
    getFeedsList,
    getTicks,
    cumulativeFedAt,
    getHolderCount,
    formatAgo,
    formatStonk,
    formatBig,
  };
})();
