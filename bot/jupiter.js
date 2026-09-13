const { Connection, VersionedTransaction, PublicKey } = require("@solana/web3.js");
const C = require("./constants");

async function getMintDecimals(connection, mint) {
  const info = await connection.getParsedAccountInfo(new PublicKey(mint));
  return info.value?.data?.parsed?.info?.decimals ?? 6;
}

async function getDecimalsForMint(mint) {
  const connection = new Connection(C.RPC_URL, "confirmed");
  return getMintDecimals(connection, mint);
}

async function getQuote(inputMint, outputMint, amountLamports, slippageBps = C.SLIPPAGE_BPS) {
  const url = `${C.JUPITER_QUOTE_URL}?inputMint=${inputMint}&outputMint=${outputMint}&amount=${Math.floor(amountLamports)}&slippageBps=${slippageBps}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jupiter quote failed: HTTP ${res.status}`);
  return res.json();
}

async function getSwapTransaction(quoteResponse, userPublicKey) {
  const res = await fetch(C.JUPITER_SWAP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });
  if (!res.ok) throw new Error(`Jupiter swap build failed: HTTP ${res.status}`);
  const { swapTransaction } = await res.json();
  return swapTransaction;
}

// Exécution réelle on-chain. N'est appelée que si constants.isDryRun() === false
// (voir bot/execute.js) — jamais depuis le chemin de simulation.
async function executeSwap({ inputMint, outputMint, amountLamports, keypair }) {
  const quote = await getQuote(inputMint, outputMint, amountLamports);
  const swapTxBase64 = await getSwapTransaction(quote, keypair.publicKey.toBase58());

  const tx = VersionedTransaction.deserialize(Buffer.from(swapTxBase64, "base64"));
  tx.sign([keypair]);

  const connection = new Connection(C.RPC_URL, "confirmed");
  const signature = await connection.sendRawTransaction(tx.serialize(), { maxRetries: 3 });
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

  const outputDecimals = await getMintDecimals(connection, outputMint);
  return { signature, quote, outputDecimals };
}

module.exports = { getQuote, getSwapTransaction, executeSwap, getMintDecimals, getDecimalsForMint };
