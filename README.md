# $GOOB — showcase site

Site vitrine statique pour $GOOB, un memecoin Solana lancé sur StonkFun et
appairé directement à $STONK (au lieu de SOL). Pas de backend, pas de bot,
pas de wallet à gérer — uniquement du HTML/CSS/JS statique.

## Structure

```
index.html            page unique
css/style.css          styles (palette StonkFun + accents mascotte)
js/config.js             toute l'identité (ticker, CA, socials, images) — à éditer en premier
js/main.js                applique le branding au DOM, boutons copier CA, reveal au scroll
assets/mascot/            les 6 visuels de la mascotte (PNG, fond transparent)
```

## Avant le lancement, mets à jour `js/config.js`

- `contractAddress` : CA de $GOOB une fois miné sur StonkFun (déclenche le
  bouton "Buy $GOOB" à la place de "Launching on StonkFun")
- `socials.x` / `socials.telegram` : liens une fois les comptes créés
- `launchUrl` : lien direct vers la page StonkFun du token une fois lancé

## Déploiement

Site 100% statique — aucun build, aucune variable d'environnement requise.
Déployable sur Vercel, Netlify, GitHub Pages ou n'importe quel hébergeur
statique en pointant simplement sur la racine du repo.

## À confirmer avant mise en ligne

- Chiffres de tokenomics exacts (supply totale, allocation) — la section
  Tokenomics reste volontairement vague ("TBA") tant que ces chiffres ne
  sont pas confirmés, pour ne rien afficher d'inexact.
- Le flux exact "how to buy" (section How to buy) décrit l'achat via SOL
  routé par StonkFun à travers la paire $STONK — à vérifier une fois le
  token live, StonkFun peut exposer un flux différent (ex: achat direct en
  $STONK).
