const DASHBOARD_REFRESH_MS = 30000;

function fmtUsd(n) {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function renderBotStatus(dryRun) {
  const pill = document.getElementById("bot-status-pill");
  const text = document.getElementById("bot-status-text");
  if (!pill || !text) return;
  pill.classList.toggle("dry", dryRun);
  pill.classList.toggle("live", !dryRun);
  text.textContent = dryRun ? "DRY-RUN (simulation)" : "LIVE (real capital)";
}

function renderBalance(data) {
  const balance = Number(data.balanceUsd);
  const seed = SITE_CONFIG.bot.seedUsd;
  const threshold = SITE_CONFIG.bot.buybackThresholdUsd;

  const statBalance = document.getElementById("stat-balance");
  if (statBalance && Number.isFinite(balance)) statBalance.textContent = `$${balance.toFixed(2)}`;

  const statPnl = document.getElementById("stat-pnl");
  if (statPnl && Number.isFinite(balance)) statPnl.textContent = fmtUsd(balance - seed);

  const progress = Number.isFinite(balance)
    ? Math.max(0, Math.min(100, ((balance - seed) / (threshold - seed)) * 100))
    : 0;
  const bar = document.getElementById("buyback-bar");
  const pct = document.getElementById("buyback-pct");
  if (bar) bar.style.width = `${progress}%`;
  if (pct) pct.textContent = `${Math.round(progress)}%`;

  const updated = document.getElementById("bot-updated");
  if (updated) updated.textContent = `updated ${new Date().toLocaleTimeString("en-US")}`;
}

function renderTrades(trades) {
  const list = document.getElementById("trade-feed");
  if (!list) return;
  if (!trades || trades.length === 0) {
    list.innerHTML = `<li><span>The bot hasn't traded yet — waiting on deployment</span></li>`;
    return;
  }
  list.innerHTML = trades.slice(0, 20).map(tr => {
    const cls = tr.side === "buyback" ? "buyback" : (tr.side === "buy" ? "buy" : "sell");
    const label = tr.side === "buyback" ? "BUYBACK" : tr.side.toUpperCase();
    const time = tr.timestamp ? new Date(tr.timestamp).toLocaleString("en-US") : "";
    return `<li>
      <span><span class="side ${cls}">${label}</span> ${tr.symbol || ""} ${tr.amountUsd ? `· $${Number(tr.amountUsd).toFixed(2)}` : ""}</span>
      <span class="t">${time}</span>
    </li>`;
  }).join("");
}

async function refreshDashboard() {
  try {
    const [balanceRes, tradesRes] = await Promise.all([
      fetch(SITE_CONFIG.api.balanceEndpoint),
      fetch(SITE_CONFIG.api.tradesEndpoint),
    ]);

    if (balanceRes.ok) {
      const balanceData = await balanceRes.json();
      renderBotStatus(balanceData.dryRun !== false);
      renderBalance(balanceData);
    }

    if (tradesRes.ok) {
      const tradesData = await tradesRes.json();
      renderTrades(tradesData.trades || tradesData);
    }
  } catch (err) {
    // Bot / API not deployed yet: keep the "waiting" state already present in the HTML.
    console.warn("Dashboard: bot not deployed yet", err);
    renderBotStatus(true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  refreshDashboard();
  setInterval(refreshDashboard, DASHBOARD_REFRESH_MS);
});
