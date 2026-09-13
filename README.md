# Chart Cat — site communautaire + bot de trading StonkFun

Site pour un memecoin Solana avec mascotte chat : mécanisme feed-the-mascot,
bannière live des top market cap StonkFun, et un dashboard qui affiche en direct
un bot de trading qui rachète le token quand il fait du profit.

## Structure

```
index.html            page unique
css/style.css          thème "terminal de trading"
js/config.js            toute l'identité (nom, ticker, couleurs, liens) — à éditer en premier
js/main.js               applique le branding au DOM, bouton copier CA
js/mascot.js             mécanique feed-the-cat (localStorage, niveaux)
js/ticker.js              bannière défilante StonkFun (fetch direct + fallback proxy)
js/dashboard.js           lit /api/balance et /api/trades pour animer le dashboard

api/stonkfun.js           proxy serverless vers l'API publique StonkFun (contourne le CORS)
api/balance.js             lecture seule : état du bot (solde, dry-run ou live)
api/trades.js               lecture seule : historique des trades/buybacks
api/cron-tick.js             déclenché par Vercel Cron, fait tourner un tick du bot

bot/constants.js           tous les paramètres de la stratégie
bot/strategy.js              orchestration d'un tick (sorties -> entrées -> buyback)
bot/execute.js                achat/vente/buyback, bascule dry-run vs transaction réelle
bot/jupiter.js                 quote + swap via l'API Jupiter, signature @solana/web3.js
bot/stonkfun.js                 récupère les tokens tendance StonkFun côté serveur
bot/price.js                     prix SOL / tokens via l'API prix Jupiter
bot/wallet.js                     charge la clé privée du bot depuis l'env
bot/store.js                       petit client REST Upstash Redis (état + logs de trades)
```

## Décisions prises pendant le build (et pourquoi)

**Pas de freqtrade, pas de CEX.** freqtrade est bâti sur CCXT, qui cible les
exchanges centralisés à carnet d'ordres — il n'a pas de support natif pour les
AMM Solana (Jupiter/Raydium). Trader du SOL/BTC "façon freqtrade" aurait voulu
dire soit un compte CEX (custodie de clés API + retrait/pont vers Solana pour
faire le buyback), soit renoncer à freqtrade. Le bot ici est 100% Solana
on-chain : il trade les tokens tendance StonkFun contre SOL via Jupiter, avec
les primitives de gestion du risque de freqtrade (stoploss, trailing stop,
table ROI, taille de position max) réimplémentées dans `bot/constants.js` et
`bot/strategy.js`.

**Double verrou avant tout trade réel.** `bot/constants.js` `isDryRun()` exige
`DRY_RUN=false` **et** `LIVE_TRADING_CONFIRMED=yes-i-understand-the-risk` pour
qu'une seule transaction réelle parte. Par défaut (aucune variable définie), le
bot est en simulation totale, aucune clé privée n'est même nécessaire.

**L'API publique StonkFun n'a pas pu être testée en direct.** Mon environnement
de build a un accès réseau sortant bloqué vers stonkfun.xyz (proxy sandbox).
Le endpoint et les noms de champs (`marketCap`, `symbol`, `priceChange24h`...)
viennent de recherches web, pas d'un appel réel vérifié. `js/ticker.js` et
`bot/stonkfun.js` parsent plusieurs noms de champs possibles par tolérance,
mais **teste une fois déployé** (voir section Vérifications ci-dessous) et
ajuste `pick(...)` dans ces deux fichiers si les vrais noms diffèrent.

## Déploiement (Vercel)

1. `vercel link` puis `vercel deploy` — Vercel détecte le site statique + le
   dossier `/api` automatiquement, pas de build step nécessaire.
2. Crée une base Redis (Vercel Storage → KV, ou un compte Upstash gratuit) et
   renseigne `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` dans les
   variables d'environnement du projet Vercel. Sans ça, le dashboard tourne
   mais reste bloqué sur l'état par défaut ("en attente de déploiement").
3. Renseigne `CRON_SECRET` (une string aléatoire) pour protéger
   `/api/cron-tick`.
4. **Plan Hobby de Vercel : les Cron Jobs sont limités à une exécution par
   jour.** Pour un tick toutes les 5 minutes comme configuré dans
   `vercel.json`, il faut soit passer sur Vercel Pro, soit déclencher
   `/api/cron-tick` depuis un service externe gratuit (cron-job.org, ou un
   GitHub Actions `schedule` qui fait juste un `curl` avec le header
   `Authorization: Bearer $CRON_SECRET`).

## Vérifications à faire une fois en ligne

- Ouvrir `/api/stonkfun` dans le navigateur : si ça renvoie une erreur 502 ou
  un JSON dont la forme ne correspond pas à ce qu'attend `normalizeToken()`
  dans `js/ticker.js`, ajuste les noms de champs.
- Vérifier que le fetch direct côté navigateur vers stonkfun.xyz n'est pas
  bloqué par CORS (ouvre la console du site) — si si, le fallback vers
  `/api/stonkfun` doit prendre le relai automatiquement.
- Confirmer les endpoints Jupiter (`lite-api.jup.ag`) sont bien ceux en
  vigueur au moment du déploiement — l'API Jupiter a changé de domaine par le
  passé (`quote-api.jup.ag` → `lite-api.jup.ag`).

## Passer le bot en live (checklist)

Ne fais ça qu'après avoir laissé tourner le dry-run plusieurs jours et vérifié
les logs de trades dans le dashboard.

1. Crée un wallet Solana **dédié** au bot (jamais ton wallet principal).
2. Transfère l'équivalent de $100 en SOL dessus.
3. Exporte la clé privée (base58) et mets-la dans `BOT_PRIVATE_KEY` côté
   Vercel — jamais dans un fichier committé.
4. Renseigne `TOKEN_MINT` avec le contract address de $CHART une fois mint.
5. Passe `DRY_RUN=false` et `LIVE_TRADING_CONFIRMED=yes-i-understand-the-risk`.
6. Regarde le premier tick live de près (logs Vercel + dashboard).

## Ce qu'il reste à me donner

Dans `js/config.js` (et `bot/constants.js` pour `TOKEN_MINT`) : nom du token,
ticker, palette de couleurs si tu veux changer le vert néon par défaut, liens
X/Telegram/StonkFun, contract address une fois mint, et l'artwork de la
mascotte si tu en as un (le SVG actuel est un placeholder dessiné à la main).

## Limites connues / ce qui n'est pas fait

- Pas de compteur de feed partagé entre visiteurs — actuellement en
  `localStorage`, donc par navigateur. Nécessite une route API + le même
  Redis pour devenir un vrai compteur communautaire.
- Aucun mécanisme de kill-switch d'urgence exposé (ex: endpoint pour stopper
  le bot instantanément) — à ajouter avant de laisser tourner du capital réel
  sans supervision.
