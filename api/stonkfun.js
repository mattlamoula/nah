// Proxy serverless vers l'API publique StonkFun. Existe pour contourner un éventuel
// blocage CORS côté navigateur (js/ticker.js tente un fetch direct d'abord, et ne
// retombe ici que si ça échoue). Voir bot/constants.js pour l'URL upstream.
module.exports = async function handler(req, res) {
  try {
    const upstream = await fetch("https://www.stonkfun.xyz/api/public/v1/tokens?sort=newest", {
      headers: { Accept: "application/json" },
    });
    if (!upstream.ok) throw new Error(`HTTP ${upstream.status}`);
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    res.status(200).json(data);
  } catch (err) {
    console.error("api/stonkfun proxy failed", err);
    res.status(502).json({ error: "stonkfun_unavailable" });
  }
};
