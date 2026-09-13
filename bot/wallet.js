const { Keypair } = require("@solana/web3.js");
// bs58@6 est un module ESM : require() le renvoie sous `.default` en CommonJS.
// Le fallback `|| bs58Module` garde la compat si une version CJS classique est installée un jour.
const bs58Module = require("bs58");
const bs58 = bs58Module.default || bs58Module;

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
