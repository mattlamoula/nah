#!/usr/bin/env bash
set -euo pipefail

# Génère le wallet du bot Skity et met sa clé privée DIRECTEMENT dans les secrets
# Vercel, sans jamais l'afficher ni l'écrire sur disque.
#
# A EXÉCUTER SUR TA PROPRE MACHINE, PAS DANS UNE SESSION CLOUD/PARTAGÉE.
# Toute machine qui affiche ou enregistre la clé privée est une machine qui peut
# vider le wallet plus tard. Le seul moyen que "même le fondateur n'a pas accès"
# soit vrai, c'est que la clé ne transite JAMAIS par un terminal, un fichier,
# un historique de commandes ou une conversation — y compris celle-ci.
#
# Prérequis :
#   - node + npm installés
#   - `npm install` déjà fait dans ce repo (pour @solana/web3.js et bs58)
#   - Vercel CLI connecté à ton projet : `npm i -g vercel && vercel login && vercel link`
#
# Ce script :
#   1. Génère un keypair Solana.
#   2. Affiche UNIQUEMENT l'adresse publique (safe à partager, à coller dans
#      js/config.js -> botWalletAddress et bot/constants.js si besoin).
#   3. Pipe la clé privée (base58) directement dans `vercel env add`, sans
#      jamais la faire transiter par une variable de shell ni un fichier.

node -e "
const { Keypair } = require('@solana/web3.js');
const bs58Module = require('bs58');
const bs58 = bs58Module.default || bs58Module;
const kp = Keypair.generate();
process.stderr.write('Wallet public (à partager, à coller dans js/config.js -> botWalletAddress) :\n' + kp.publicKey.toBase58() + '\n\n');
process.stdout.write(bs58.encode(kp.secretKey));
" | vercel env add BOT_PRIVATE_KEY production

echo ""
echo "Clé privée envoyée à Vercel (environnement production uniquement). Elle n'a été affichée nulle part."
echo "Si tu veux le même wallet visible en preview/dev pour tester le dry-run, coche ces"
echo "environnements dans l'UI Vercel (Settings -> Environment Variables) plutôt que de"
echo "relancer ce script, qui générerait une NOUVELLE adresse à chaque exécution."
