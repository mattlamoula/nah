// Shared UI chrome used by every page (index.html and feed/index.html):
// copy binding, toasts, copy-CA, buy/social soon-toasts, reduced motion, and
// same-page nav scroll-spy. Page-specific bootstrapping (hero, ticker,
// live strip, feed list) lives in that page's own script.
const GOOB_CHROME = (() => {
  const CFG = GOOB_CONFIG;
  const COPY = GOOB_COPY;

  function getByPath(obj, path) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function applyCopy() {
    document.querySelectorAll("[data-copy]").forEach((el) => {
      const val = getByPath(COPY, el.dataset.copy);
      if (typeof val === "string") el.textContent = val;
    });
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function fallbackCopyText(text) {
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
        .catch(() => toast(fallbackCopyText(text) ? COPY.copiedToast : text));
    } else {
      toast(fallbackCopyText(text) ? COPY.copiedToast : text);
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
    document.querySelectorAll("[data-stat-tax]").forEach((el) => (el.textContent = COPY.stats.tax(CFG.taxPct)));
    document.querySelectorAll("[data-live-tax]").forEach((el) => (el.textContent = `${CFG.taxPct}%`));
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
      targets.forEach((t) => t.tab.classList.remove("on"));
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

  function initReducedMotion() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("reduced-motion");
    }
  }

  function init() {
    initReducedMotion();
    applyCopy();
    initStaticContent();
    initGlobalClicks();
    initScrollspy();
  }

  return { init, applyCopy, toast, copyCA };
})();
