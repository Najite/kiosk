import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  Account,
  Keypair,
  xdr,
} from '@stellar/stellar-sdk';
import {
  STELLAR_CONFIG,
  TESTNET_CONTRACT_ID,
  TESTNET_SAC_XLM,
  type StellarNetwork,
} from './stellar';

function getSimulationCaller(callerAddress?: string): Account {
  const pubKey = callerAddress && callerAddress.startsWith('G')
    ? callerAddress
    : Keypair.random().publicKey();
  return new Account(pubKey, '0');
}

export type OnChainUpstreamSplit = {
  recipient: string;
  shareBps: number;
};

export type OnChainPolicy = {
  minFloorPrice: bigint;
  royaltyBps: number;
  royaltyRecipient: string;
  upstreamSplits: OnChainUpstreamSplit[];
};

export type OnChainItem = {
  id: number;
  title: string;
  description: string;
  assetType: string;
  price: bigint;
  isListed: boolean;
  seller: string;
};

export type OnChainEvent = {
  id: string;
  topic: string[];
  data: any;
  ledger: number;
  ledgerClosedAt: string;
};

export function getSorobanRpc(network: StellarNetwork = 'TESTNET'): rpc.Server {
  return new rpc.Server(STELLAR_CONFIG[network].sorobanRpcUrl);
}

/**
 * Read current contract policy from Soroban on-chain state
 */
export async function fetchContractPolicy(
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET',
  callerAddress?: string
): Promise<OnChainPolicy | null> {
  try {
    const server = getSorobanRpc(network);
    const contract = new Contract(contractId);
    const simAccount = getSimulationCaller(callerAddress);

    const tx = new TransactionBuilder(simAccount, {
      fee: '100',
      networkPassphrase: STELLAR_CONFIG[network].passphrase,
    })
      .addOperation(contract.call('get_policy'))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
      return null;
    }

    const val = scValToNative(sim.result.retval);
    const rawSplits = Array.isArray(val.upstream_splits) ? val.upstream_splits : [];
    const upstreamSplits: OnChainUpstreamSplit[] = rawSplits.map((s: any) => ({
      recipient: String(s.recipient ?? ''),
      shareBps: Number(s.share_bps ?? 0),
    }));

    return {
      minFloorPrice: BigInt(val.min_floor_price ?? 0),
      royaltyBps: Number(val.royalty_bps ?? 0),
      royaltyRecipient: String(val.royalty_recipient ?? ''),
      upstreamSplits,
    };
  } catch (err) {
    console.warn('Failed to query on-chain policy:', err);
    return null;
  }
}

/**
 * Read total items registered on-chain
 */
export async function fetchContractItemCount(
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET',
  callerAddress?: string
): Promise<number> {
  try {
    const server = getSorobanRpc(network);
    const contract = new Contract(contractId);
    const simAccount = getSimulationCaller(callerAddress);

    const tx = new TransactionBuilder(simAccount, {
      fee: '100',
      networkPassphrase: STELLAR_CONFIG[network].passphrase,
    })
      .addOperation(contract.call('get_item_count'))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
      return Number(scValToNative(sim.result.retval));
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Read specific item from Soroban on-chain storage
 */
export async function fetchContractItem(
  itemId: number,
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET',
  callerAddress?: string
): Promise<OnChainItem | null> {
  try {
    const server = getSorobanRpc(network);
    const contract = new Contract(contractId);
    const simAccount = getSimulationCaller(callerAddress);

    const tx = new TransactionBuilder(simAccount, {
      fee: '100',
      networkPassphrase: STELLAR_CONFIG[network].passphrase,
    })
      .addOperation(contract.call('get_item', nativeToScVal(itemId, { type: 'u32' })))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
      return null;
    }

    const val = scValToNative(sim.result.retval);
    return {
      id: Number(val.id),
      title: String(val.title ?? ''),
      description: String(val.description ?? ''),
      assetType: String(val.asset_type ?? 'License'),
      price: BigInt(val.price),
      isListed: Boolean(val.is_listed),
      seller: String(val.seller),
    };
  } catch (err) {
    console.warn(`Failed to fetch on-chain item ${itemId}:`, err);
    return null;
  }
}

/**
 * Fetch all items available in the Kiosk contract by sequential query
 */
export async function fetchAllContractItems(
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET',
  maxItems: number = 30
): Promise<OnChainItem[]> {
  const items: OnChainItem[] = [];
  const count = await fetchContractItemCount(contractId, network);
  const limit = count > 0 ? count : maxItems;

  for (let i = 1; i <= limit; i++) {
    const item = await fetchContractItem(i, contractId, network);
    if (!item) {
      if (count === 0) break;
      continue;
    }
    items.push(item);
  }
  return items;
}

/**
 * Fetch live contract events published by Kiosk on Soroban ledger
 */
export async function fetchContractEvents(
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET'
): Promise<OnChainEvent[]> {
  try {
    const server = getSorobanRpc(network);
    const latestLedgerRes = await server.getLatestLedger();
    const latestLedger = latestLedgerRes.sequence;
    const startLedger = Math.max(1, latestLedger - 10000);

    const eventsRes = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
      limit: 15,
    });

    const parsed: OnChainEvent[] = (eventsRes.events || []).map((e) => {
      const topic = (e.topic || []).map((t) => {
        try {
          return String(scValToNative(t as unknown as xdr.ScVal));
        } catch {
          return String(t);
        }
      });

      let data: any = null;
      try {
        data = scValToNative(e.value as unknown as xdr.ScVal);
      } catch {
        data = e.value;
      }

      return {
        id: e.id,
        topic,
        data,
        ledger: e.ledger,
        ledgerClosedAt: e.ledgerClosedAt,
      };
    });

    return parsed;
  } catch (err) {
    console.warn('Failed to fetch Soroban contract events:', err);
    return [];
  }
}

/**
 * Builds and prepares a live on-chain purchase transaction ready for Freighter signing
 */
export async function buildPurchaseTx({
  buyerAddress,
  itemId,
  contractId = TESTNET_CONTRACT_ID,
  paymentToken = TESTNET_SAC_XLM,
  network = 'TESTNET',
}: {
  buyerAddress: string;
  itemId: number;
  contractId?: string;
  paymentToken?: string;
  network?: StellarNetwork;
}): Promise<{ xdrBase64: string }> {
  const server = getSorobanRpc(network);
  const buyerAcc = await server.getAccount(buyerAddress);
  const contract = new Contract(contractId);

  const baseTx = new TransactionBuilder(buyerAcc, {
    fee: '2000',
    networkPassphrase: STELLAR_CONFIG[network].passphrase,
  })
    .addOperation(
      contract.call(
        'purchase',
        new Address(buyerAddress).toScVal(),
        nativeToScVal(itemId, { type: 'u32' }),
        new Address(paymentToken).toScVal()
      )
    )
    .setTimeout(180)
    .build();

  const preparedTx = await server.prepareTransaction(baseTx);
  return { xdrBase64: preparedTx.toXDR() };
}

/**
 * Builds and prepares a live on-chain place_and_list transaction ready for Freighter signing
 */
export async function buildPlaceAndListTx({
  sellerAddress,
  title,
  description = '',
  assetType = 'License',
  priceInXlm,
  contractId = TESTNET_CONTRACT_ID,
  network = 'TESTNET',
}: {
  sellerAddress: string;
  title: string;
  description?: string;
  assetType?: string;
  priceInXlm: number;
  contractId?: string;
  network?: StellarNetwork;
}): Promise<{ xdrBase64: string; nextItemId?: number }> {
  const server = getSorobanRpc(network);
  const sellerAcc = await server.getAccount(sellerAddress);
  const contract = new Contract(contractId);

  const priceStroops = BigInt(Math.round(priceInXlm * 10_000_000));

  const baseTx = new TransactionBuilder(sellerAcc, {
    fee: '2000',
    networkPassphrase: STELLAR_CONFIG[network].passphrase,
  })
    .addOperation(
      contract.call(
        'place_and_list',
        new Address(sellerAddress).toScVal(),
        nativeToScVal(title, { type: 'string' }),
        nativeToScVal(description, { type: 'string' }),
        nativeToScVal(assetType, { type: 'string' }),
        nativeToScVal(priceStroops, { type: 'i128' })
      )
    )
    .setTimeout(180)
    .build();

  const sim = await server.simulateTransaction(baseTx);
  let nextItemId: number | undefined;
  if (rpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
    try {
      nextItemId = Number(scValToNative(sim.result.retval));
    } catch {
      // Ignore conversion
    }
  }

  const preparedTx = await server.prepareTransaction(baseTx);
  return { xdrBase64: preparedTx.toXDR(), nextItemId };
}

/**
 * Builds and prepares a live on-chain set_policy transaction ready for Freighter signing
 */
export async function buildSetPolicyTx({
  callerAddress,
  royaltyBps,
  royaltyRecipient,
  minFloorPriceInXlm,
  upstreamSplits = [],
  contractId = TESTNET_CONTRACT_ID,
  network = 'TESTNET',
}: {
  callerAddress: string;
  royaltyBps: number;
  royaltyRecipient: string;
  minFloorPriceInXlm: number;
  upstreamSplits?: { recipient: string; shareBps: number }[];
  contractId?: string;
  network?: StellarNetwork;
}): Promise<{ xdrBase64: string }> {
  const server = getSorobanRpc(network);
  const callerAcc = await server.getAccount(callerAddress);
  const contract = new Contract(contractId);

  const minFloorStroops = BigInt(Math.round(minFloorPriceInXlm * 10_000_000));

  const scSplits = upstreamSplits.map((s) => ({
    recipient: s.recipient,
    share_bps: s.shareBps,
  }));

  const baseTx = new TransactionBuilder(callerAcc, {
    fee: '2000',
    networkPassphrase: STELLAR_CONFIG[network].passphrase,
  })
    .addOperation(
      contract.call(
        'set_policy',
        new Address(callerAddress).toScVal(),
        nativeToScVal(royaltyBps, { type: 'u32' }),
        new Address(royaltyRecipient).toScVal(),
        nativeToScVal(minFloorStroops, { type: 'i128' }),
        nativeToScVal(scSplits)
      )
    )
    .setTimeout(180)
    .build();

  const preparedTx = await server.prepareTransaction(baseTx);
  return { xdrBase64: preparedTx.toXDR() };
}

/**
 * Submits a signed Soroban transaction to Stellar Testnet RPC and awaits confirmation
 */
export async function submitSignedTx(
  signedXdrBase64: string,
  network: StellarNetwork = 'TESTNET'
): Promise<{ txHash: string; status: 'SUCCESS' | 'FAILED'; error?: string }> {
  const server = getSorobanRpc(network);
  const tx = TransactionBuilder.fromXDR(signedXdrBase64, STELLAR_CONFIG[network].passphrase);

  const sendRes = await server.sendTransaction(tx);
  if (sendRes.status === 'ERROR') {
    throw new Error(sendRes.errorResult?.toString() || 'Transaction rejected by Soroban RPC node');
  }

  const txHash = sendRes.hash;

  // Poll for completion (up to 40 seconds)
  const pollRes = await server.pollTransaction(txHash, { attempts: 25 });
  if (pollRes.status === 'SUCCESS') {
    return { txHash, status: 'SUCCESS' };
  } else {
    throw new Error(`Transaction finished with status ${pollRes.status}`);
  }
}
