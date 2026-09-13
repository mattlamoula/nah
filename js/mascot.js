const MASCOT_STORAGE_KEY = "chartcat_mascot_state_v1";
const FOOD_EMOJIS = ["🍣", "🐟", "🍤", "🥩", "🍗"];
const PET_EMOJIS = ["💗", "✨"];
const PLAY_EMOJIS = ["⭐", "🎾", "✨"];
const PURR_EMOJIS = ["🎵", "♪", "💤"];

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

function renderStageTimeline(state) {
  const stepsEl = document.getElementById("stage-steps");
  const barEl = document.getElementById("stage-bar-inner");
  if (!stepsEl || !barEl) return;

  const level = levelForFeeds(state.feeds);

  stepsEl.innerHTML = LEVELS.map(l => `
    <div class="stage-step ${state.feeds >= l.minFeeds ? "reached" : ""}">
      <div class="num">0${l.level - 1}</div>
      <div class="name">${l.name}</div>
      <div class="thresh">${l.minFeeds === 0 ? "0 feeds" : `${l.minFeeds}+ feeds`}</div>
    </div>
  `).join("");

  const lastLevel = LEVELS[LEVELS.length - 1];
  const progressPct = Math.min(100, (state.feeds / lastLevel.minFeeds) * 100);
  barEl.style.width = `${progressPct}%`;
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

  renderStageTimeline(state);
}

function spawnParticles(emojiSet, count = 1) {
  const stage = document.querySelector(".mascot-stage");
  if (!stage) return;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "food-pop";
    particle.textContent = emojiSet[Math.floor(Math.random() * emojiSet.length)];
    particle.style.left = "50%";
    particle.style.top = "60%";
    particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 80}px`);
    stage.appendChild(particle);
    setTimeout(() => particle.remove(), 900);
  }
}

function playAnimation(svg, className, durationMs) {
  if (!svg) return;
  svg.classList.add(className);
  setTimeout(() => svg.classList.remove(className), durationMs);
}

function initMascotFeeding() {
  let state = loadMascotState();
  renderMascot(state);

  const svg = document.getElementById("mascot-svg");

  const doFeed = () => {
    state.feeds += 1;
    state.hunger = Math.min(100, state.hunger + 8);
    state.lastFedAt = Date.now();
    saveMascotState(state);
    renderMascot(state);
    spawnParticles(FOOD_EMOJIS, 1);
    playAnimation(svg, "cat-eating", 500);

    const level = levelForFeeds(state.feeds);
    const prevLevel = levelForFeeds(state.feeds - 1);
    if (level.level > prevLevel.level) {
      showToast(`🎉 ${SITE_CONFIG.mascotName} leveled up to ${level.level} — ${level.name}!`);
    }
  };

  const doPet = () => {
    state.hunger = Math.min(100, state.hunger + 2);
    saveMascotState(state);
    renderMascot(state);
    spawnParticles(PET_EMOJIS, 2);
    playAnimation(svg, "cat-petted", 500);
    showToast(`💗 ${SITE_CONFIG.mascotName} nuzzles into your hand.`);
  };

  const doPlay = () => {
    state.hunger = Math.max(0, state.hunger - 3);
    saveMascotState(state);
    renderMascot(state);
    spawnParticles(PLAY_EMOJIS, 3);
    playAnimation(svg, "cat-playing", 700);
    showToast(`⚡ ${SITE_CONFIG.mascotName} does a little zoomie.`);
  };

  const doPurr = () => {
    spawnParticles(PURR_EMOJIS, 2);
    playAnimation(svg, "cat-purring", 450);
    showToast(`♪ ${SITE_CONFIG.mascotName} purrs contentedly.`);
  };

  document.getElementById("feed-btn")?.addEventListener("click", doFeed);
  document.getElementById("action-feed")?.addEventListener("click", doFeed);
  document.getElementById("action-pet")?.addEventListener("click", doPet);
  document.getElementById("action-play")?.addEventListener("click", doPlay);
  document.getElementById("action-purr")?.addEventListener("click", doPurr);

  setInterval(() => {
    state.hunger = Math.max(0, state.hunger - 1);
    saveMascotState(state);
    renderMascot(state);
  }, 60000);
}

document.addEventListener("DOMContentLoaded", initMascotFeeding);
