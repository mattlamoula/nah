function applyBranding() {
  const c = SITE_CONFIG;
  const setSrc = (id, val) => { const el = document.getElementById(id); if (el) el.src = val; };

  document.title = `${c.tokenTicker} — paired to ${c.pairTicker} on StonkFun`;

  document.querySelectorAll("[data-token-name]").forEach(el => el.textContent = c.tokenName);
  document.querySelectorAll("[data-token-ticker]").forEach(el => el.textContent = c.tokenTicker);
  document.querySelectorAll("[data-pair-ticker]").forEach(el => el.textContent = c.pairTicker);
  document.querySelectorAll("[data-reward-tax]").forEach(el => el.textContent = `${c.rewardTaxPercent}%`);

  const hasCA = Boolean(c.contractAddress);
  document.querySelectorAll("[data-contract-address]").forEach(el => {
    el.textContent = hasCA ? c.contractAddress : "DROPPING AT LAUNCH";
  });

  // Button labels are fixed per section (BUY $GOOB / APE IN ON STONKFUN / nav BUY) —
  // only the destination changes once $GOOB is actually minted.
  document.querySelectorAll("[data-buy-btn]").forEach(el => {
    el.href = hasCA ? c.launchUrl : c.socials.stonkfun;
  });

  setSrc("hero-mascot", c.mascot.hero);
  setSrc("about-mascot", c.mascot.about);
  setSrc("buy-mascot", c.mascot.buy);
  setSrc("howtobuy-mascot", c.mascot.howtobuy);
  setSrc("tokenomics-peek", c.mascot.peek);
  setSrc("nav-badge", c.mascot.badge);
  setSrc("footer-mascot", c.mascot.badge);
  setSrc("favicon", c.mascot.badge);

  const socialUrls = { x: c.socials.x, telegram: c.socials.telegram, stonkfun: c.socials.stonkfun };
  document.querySelectorAll("[data-social]").forEach(el => {
    const url = socialUrls[el.getAttribute("data-social")];
    if (url) {
      el.href = url;
    } else {
      el.href = "#";
      el.classList.add("soon");
      el.setAttribute("aria-disabled", "true");
      el.title = "Coming soon";
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setupCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const value = SITE_CONFIG.contractAddress;
      if (!value) { showToast("No contract address yet"); return; }
      try {
        await navigator.clipboard.writeText(value);
        showToast("Address copied");
      } catch {
        showToast("Copy isn't supported in this browser");
      }
    });
  });
}

function setupNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav-links");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}

document.addEventListener("DOMContentLoaded", () => {
  applyBranding();
  setupCopyButtons();
  setupNavToggle();
});
