function applyBranding() {
  const c = SITE_CONFIG;
  document.title = `${c.tokenName} — ${c.tagline}`;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };

  ["brand-name", "tagline-name", "feed-name", "bot-name", "footer-name"].forEach(id => setText(id, c.tokenName));
  setText("ticker-name", c.tokenTicker);
  setText("bot-ticker", c.tokenTicker);
  setText("seed-amount", `$${c.bot.seedUsd}`);
  setText("threshold-amount", `$${c.bot.buybackThresholdUsd}`);
  setText("contract-address", c.contractAddress || "bientôt disponible");
  setText("stat-wallet", c.botWalletAddress ? `${c.botWalletAddress.slice(0, 4)}…${c.botWalletAddress.slice(-4)}` : "non déployé");

  document.documentElement.style.setProperty("--primary", c.colors.primary);
  document.documentElement.style.setProperty("--primary-dim", c.colors.primaryDim);
  document.documentElement.style.setProperty("--accent", c.colors.accent);
  document.documentElement.style.setProperty("--bg", c.colors.bg);
  document.documentElement.style.setProperty("--bg-panel", c.colors.bgPanel);
  document.documentElement.style.setProperty("--warn", c.colors.warn);
  document.documentElement.style.setProperty("--gain", c.colors.gain);

  setHref("buy-btn", c.socials.stonkfun || "#");
  setHref("buy-btn-2", c.socials.stonkfun || "#");
  setHref("social-x", c.socials.x || "#");
  setHref("social-tg", c.socials.telegram || "#");
  setHref("social-stonkfun", c.socials.stonkfun || "#");
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setupCopyCA() {
  const btn = document.getElementById("copy-ca");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const ca = SITE_CONFIG.contractAddress;
    if (!ca) { showToast("Pas encore de contract address"); return; }
    try {
      await navigator.clipboard.writeText(ca);
      showToast("Adresse copiée");
    } catch {
      showToast("Copie impossible sur ce navigateur");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyBranding();
  setupCopyCA();
});
