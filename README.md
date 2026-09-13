# Skity — site communautaire + bot de trading StonkFun

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

scripts/generate-bot-wallet.sh   génère le wallet du bot, envoie la clé privée à Vercel sans jamais l'afficher
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

**Personne — pas même toi — ne voit la clé privée du bot.** C'est un choix
délibéré : la crédibilité de "le fondateur n'a pas accès au wallet" ne tient
que si la clé ne transite jamais par un terminal, un fichier ou une
conversation partagée, la tienne comprise. `scripts/generate-bot-wallet.sh`
génère le wallet et envoie la clé privée directement dans les secrets Vercel,
sans jamais l'afficher — seule l'adresse publique sort du script. Voir la
section "Passer le bot en live" plus bas. À dire clairement à ta commu : c'est
une garantie procédurale (personne n'a tapé la commande pour l'exporter), pas
une preuve cryptographique — un wallet PDA contrôlé par un programme on-chain
serait la version vérifiable par n'importe qui sans te faire confiance sur
parole, mais c'est un chantier séparé, plus gros, pas fait ici.

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

1. Sur ta machine (pas dans une session cloud/partagée) : `npm i -g vercel &&
   vercel login && vercel link`, puis `npm install` dans ce repo.
2. Lance `./scripts/generate-bot-wallet.sh`. Il génère le wallet, affiche
   uniquement l'adresse publique, et envoie la clé privée directement dans les
   secrets Vercel — personne ne la voit, toi compris.
3. Colle l'adresse publique affichée dans `js/config.js` -> `botWalletAddress`.
4. Transfère l'équivalent de $100 en SOL sur cette adresse.
5. Renseigne `TOKEN_MINT` avec le contract address de $SKITY une fois mint.
6. Passe `DRY_RUN=false` et `LIVE_TRADING_CONFIRMED=yes-i-understand-the-risk`
   dans les variables d'environnement Vercel.
7. Regarde le premier tick live de près (logs Vercel + dashboard).

## Ce qu'il reste à me donner

- La palette de couleurs officielle de stonkfun.xyz (je ne peux pas accéder au
  site depuis mon environnement — capture d'écran ou description des couleurs).
- Liens X/Telegram une fois créés, contract address une fois le token mint.
- Adresse publique du wallet bot une fois générée via le script ci-dessus.
- L'artwork final de la mascotte si tu en obtiens une version différente du
  badge SVG actuel (assets/mascot-badge.svg, redessiné à la main).

## Limites connues / ce qui n'est pas fait

- Pas de compteur de feed partagé entre visiteurs — actuellement en
  `localStorage`, donc par navigateur. Nécessite une route API + le même
  Redis pour devenir un vrai compteur communautaire.
- Aucun mécanisme de kill-switch d'urgence exposé (ex: endpoint pour stopper
  le bot instantanément) — à ajouter avant de laisser tourner du capital réel
  sans supervision.
