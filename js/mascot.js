const MASCOT_STORAGE_KEY = "chartcat_mascot_state_v1";
const FOOD_EMOJIS = ["🍣", "🐟", "🍤", "🥩", "🍗"];

const LEVELS = [
  { level: 1, minFeeds: 0, name: "Kitten" },
  { level: 2, minFeeds: 5, name: "Curious Cat" },
  { level: 3, minFeeds: 15, name: "Trader Cat" },
  { level: 4, minFeeds: 35, name: "Degen Cat" },
  { level: 5, minFeeds: 75, name: "Diamond Cat" },
];

function loadMascotState() {
  try {
    const raw = localStorage.getItem(MASCOT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { feeds: 0, hunger: 40, lastFedAt: null };
}

function saveMascotState(state) {
  try { localStorage.setItem(MASCOT_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function levelForFeeds(feeds) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (feeds >= l.minFeeds) current = l;
  return current;
}

function renderMascot(state) {
  const level = levelForFeeds(state.feeds);
  const nextLevel = LEVELS.find(l => l.minFeeds > state.feeds);

  const levelBadge = document.getElementById("hero-badge");
  if (levelBadge) levelBadge.textContent = `Level ${level.level} · ${level.name}`;

  const statLevel = document.getElementById("stat-level");
  if (statLevel) statLevel.textContent = String(level.level);

  const statFed = document.getElementById("stat-fed");
  if (statFed) statFed.textContent = String(state.feeds);

  const hungerPct = Math.max(0, Math.min(100, Math.round(state.hunger)));
  const statHunger = document.getElementById("stat-hunger");
  if (statHunger) statHunger.textContent = `${hungerPct}%`;
  const hungerBar = document.getElementById("hunger-bar");
  if (hungerBar) hungerBar.style.width = `${hungerPct}%`;
  const hungerLabel = document.getElementById("hunger-pct");
  if (hungerLabel) hungerLabel.textContent = `${hungerPct}%`;

  const globalFeeds = document.getElementById("global-feeds");
  if (globalFeeds) globalFeeds.textContent = String(state.feeds);

  const feedBtn = document.getElementById("feed-btn");
  if (feedBtn) {
    feedBtn.textContent = nextLevel
      ? `🍣 Feed (${nextLevel.minFeeds - state.feeds} to level ${nextLevel.level})`
      : "🍣 Feed (max level reached)";
  }
}

function spawnFoodParticle(originEl) {
  const stage = document.querySelector(".mascot-stage");
  if (!stage || !originEl) return;
  const particle = document.createElement("div");
  particle.className = "food-pop";
  particle.textContent = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
  particle.style.left = "50%";
  particle.style.top = "70%";
  particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 60}px`);
  stage.appendChild(particle);
  setTimeout(() => particle.remove(), 900);
}

function initMascotFeeding() {
  let state = loadMascotState();
  renderMascot(state);

  const feedBtn = document.getElementById("feed-btn");
  const svg = document.getElementById("mascot-svg");
  if (!feedBtn) return;

  feedBtn.addEventListener("click", () => {
    state.feeds += 1;
    state.hunger = Math.min(100, state.hunger + 8);
    state.lastFedAt = Date.now();
    saveMascotState(state);
    renderMascot(state);
    spawnFoodParticle(feedBtn);

    if (svg) {
      svg.classList.add("cat-eating");
      setTimeout(() => svg.classList.remove("cat-eating"), 500);
    }

    const level = levelForFeeds(state.feeds);
    const prevLevel = levelForFeeds(state.feeds - 1);
    if (level.level > prevLevel.level) {
      showToast(`🎉 ${SITE_CONFIG.mascotName} leveled up to ${level.level} — ${level.name}!`);
    }
  });

  setInterval(() => {
    state.hunger = Math.max(0, state.hunger - 1);
    saveMascotState(state);
    renderMascot(state);
  }, 60000);
}

document.addEventListener("DOMContentLoaded", initMascotFeeding);
