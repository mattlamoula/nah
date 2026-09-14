function shortAddr(addr) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function applyBranding() {
  const c = SITE_CONFIG;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };
  const setSrc = (id, val) => { const el = document.getElementById(id); if (el) el.src = val; };

  document.title = `${c.tokenTicker} — paired to ${c.pairTicker} on StonkFun`;

  document.querySelectorAll("[data-token-name]").forEach(el => el.textContent = c.tokenName);
  document.querySelectorAll("[data-token-ticker]").forEach(el => el.textContent = c.tokenTicker);
  document.querySelectorAll("[data-pair-ticker]").forEach(el => el.textContent = c.pairTicker);

  setText("pair-ca", shortAddr(c.pairContractAddress));
  setHref("pair-ca-link", `https://solscan.io/token/${c.pairContractAddress}`);

  const hasCA = Boolean(c.contractAddress);
  setText("contract-address", hasCA ? c.contractAddress : "not minted yet");
  document.querySelectorAll("[data-buy-btn]").forEach(el => {
    el.href = hasCA ? c.launchUrl : c.socials.stonkfun;
    el.textContent = hasCA ? `Buy ${c.tokenTicker}` : "Launching on StonkFun";
  });

  setSrc("hero-mascot", c.mascot.hero);
  setSrc("about-mascot", c.mascot.wave);
  setSrc("pairing-mascot", c.mascot.point);
  setSrc("howtobuy-mascot", c.mascot.walk);
  setSrc("community-mascot", c.mascot.front);
  setSrc("footer-mascot", c.mascot.front);
  setSrc("favicon", c.mascot.front);

  document.querySelectorAll(".mascot-peek").forEach(el => el.src = c.mascot.peek);

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
      const value = btn.getAttribute("data-copy") === "pair"
        ? SITE_CONFIG.pairContractAddress
        : SITE_CONFIG.contractAddress;
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
