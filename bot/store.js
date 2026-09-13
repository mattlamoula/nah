// Petit wrapper REST pour Upstash Redis (compatible Vercel KV), sans dépendance npm.
// Env requis : UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN.
// Si non configuré, toutes les fonctions retournent des valeurs par défaut sûres
// au lieu de planter — le site doit rester utilisable avant que l'infra du bot existe.

const BASE_URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function isConfigured() {
  return Boolean(BASE_URL && TOKEN);
}

async function upstash(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${TOKEN}`, ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`Upstash error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.result;
}

const STATE_KEY = "chartcat:bot:state";
const TRADES_KEY = "chartcat:bot:trades";
const TRADES_MAX_LENGTH = 200;

async function getState(defaultState) {
  if (!isConfigured()) return defaultState;
  try {
    const raw = await upstash(`/get/${STATE_KEY}`);
    return raw ? JSON.parse(raw) : defaultState;
  } catch (err) {
    console.error("store.getState failed", err);
    return defaultState;
  }
}

async function setState(state) {
  if (!isConfigured()) return false;
  await upstash(`/set/${STATE_KEY}`, { method: "POST", body: JSON.stringify(state) });
  return true;
}

async function getTrades(limit = 50) {
  if (!isConfigured()) return [];
  try {
    const raw = await upstash(`/lrange/${TRADES_KEY}/0/${limit - 1}`);
    return (raw || []).map(item => { try { return JSON.parse(item); } catch { return null; } }).filter(Boolean);
  } catch (err) {
    console.error("store.getTrades failed", err);
    return [];
  }
}

async function appendTrade(trade) {
  if (!isConfigured()) return false;
  await upstash(`/lpush/${TRADES_KEY}`, { method: "POST", body: JSON.stringify(trade) });
  await upstash(`/ltrim/${TRADES_KEY}/0/${TRADES_MAX_LENGTH - 1}`);
  return true;
}

module.exports = { isConfigured, getState, setState, getTrades, appendTrade };
