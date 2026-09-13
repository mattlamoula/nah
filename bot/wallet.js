const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");

// BOT_PRIVATE_KEY : clé privée du wallet du bot, en base58 (format export Phantom)
// ou en JSON array (format solana-keygen). Ne JAMAIS committer cette valeur —
// elle vit uniquement dans les secrets d'environnement Vercel.
function loadKeypair() {
  const raw = process.env.BOT_PRIVATE_KEY;
  if (!raw) return null;
  try {
    if (raw.trim().startsWith("[")) {
      return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
    }
    return Keypair.fromSecretKey(bs58.decode(raw.trim()));
  } catch (err) {
    console.error("wallet.loadKeypair: clé invalide", err);
    return null;
  }
}

module.exports = { loadKeypair };
