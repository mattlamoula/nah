const { runTick } = require("../bot/strategy");

// Déclenché par Vercel Cron (voir vercel.json). Quand CRON_SECRET est défini,
// Vercel ajoute automatiquement "Authorization: Bearer <CRON_SECRET>" à ses propres
// appels cron — ça empêche n'importe qui de déclencher un tick de trading en visitant l'URL.
module.exports = async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (req.headers.authorization !== expected) {
      return res.status(401).json({ error: "unauthorized" });
    }
  }

  try {
    const { state, events } = await runTick();
    res.status(200).json({ ok: true, dryRun: state.dryRun, balanceUsd: state.balanceUsd, events: events.length });
  } catch (err) {
    console.error("cron-tick failed", err);
    res.status(500).json({ ok: false, error: String(err && err.message || err) });
  }
};
