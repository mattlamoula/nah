# $GOOB — showcase site

Site vitrine statique pour $GOOB, un memecoin Solana lancé sur StonkFun et
appairé directement à $STONK (au lieu de SOL). Pas de backend, pas de bot,
pas de wallet à gérer — uniquement du HTML/CSS/JS statique.

## Structure

```
index.html            page unique
css/style.css          styles (palette StonkFun + accents mascotte)
js/config.js             toute l'identité (ticker, CA, socials, images) — à éditer en premier
js/main.js                applique le branding au DOM, boutons copier CA, toggle nav mobile
assets/mascot/            les 6 visuels de la mascotte (PNG, fond transparent)
```

## Avant le lancement, mets à jour `js/config.js`

- `contractAddress` : CA de $GOOB une fois miné sur StonkFun (fait passer le
  placeholder "DROPPING AT LAUNCH" à la vraie adresse, et les boutons BUY
  vers `launchUrl` au lieu de la page StonkFun générique)
- `socials.x` / `socials.telegram` : liens une fois les comptes créés
- `launchUrl` : lien direct vers la page StonkFun du token une fois lancé

## Déploiement

Site 100% statique — aucun build, aucune variable d'environnement requise.
Déployable sur Vercel, Netlify, GitHub Pages ou n'importe quel hébergeur
statique en pointant simplement sur la racine du repo.

## À confirmer avant mise en ligne

- Le flux exact "how to buy" (section How to buy) décrit l'achat via SOL
  routé par StonkFun à travers la paire $STONK — non vérifié contre l'UI
  live de stonkfun.xyz (site injoignable depuis cet environnement au moment
  de la rédaction), à reconfirmer une fois le token live.
- Handles X / Telegram réels (`socials.x` / `socials.telegram` dans
  `js/config.js`, actuellement vides).
- Adresse de contrat $GOOB une fois le mint effectué sur StonkFun.
- Le reward tax reste à 1% par défaut (`rewardTaxPercent`) — à confirmer si
  le owner veut passer à 3%.
