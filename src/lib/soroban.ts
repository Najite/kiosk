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
import { signTransaction, isConnected as isFreighterConnected } from '@stellar/freighter-api';
import {
  STELLAR_CONFIG,
  TESTNET_CONTRACT_ID,
  DEMO_TESTNET_KEYPAIR,
  getNativeSacAddress,
  stroopsToXlm,
  xlmToStroops,
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

export function getSorobanRpc(network: StellarNetwork = 'TESTNET'): rpc.Server {
  return new rpc.Server(STELLAR_CONFIG[network].sorobanRpcUrl);
}

/**
 * Read current contract policy directly from Soroban on-chain storage
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
    const upstreamSplits: OnChainUpstreamSplit[] = rawSplits.map((s: Record<string, unknown>) => ({
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
    console.warn('Failed to fetch on-chain policy:', err);
    return null;
  }
}

/**
 * Read total items registered in the Kiosk contract
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
    if (!rpc.Api.isSimulationSuccess(sim) || !sim.result?.retval) {
      return 0;
    }

    return Number(scValToNative(sim.result.retval));
  } catch (err) {
    console.warn('Failed to fetch item count:', err);
    return 0;
  }
}

/**
 * Fetch a single item directly from the Kiosk contract persistent storage
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
      price: BigInt(val.price ?? 0),
      isListed: Boolean(val.is_listed),
      seller: String(val.seller ?? ''),
    };
  } catch (err) {
    console.warn(`Failed to fetch on-chain item ${itemId}:`, err);
    return null;
  }
}

/**
 * Fetch all items available in the Kiosk contract on Soroban
 */
export async function fetchAllContractItems(
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET'
): Promise<OnChainItem[]> {
  const items: OnChainItem[] = [];
  const count = await fetchContractItemCount(contractId, network);

  for (let i = 1; i <= count; i++) {
    const item = await fetchContractItem(i, contractId, network);
    if (item) {
      items.push(item);
    }
  }
  return items;
}

/**
 * Signs and submits a prepared transaction either via Freighter or live testnet keypair
 */
async function signAndSubmitTx(
  preparedTx: any,
  callerAddress: string,
  network: StellarNetwork = 'TESTNET'
): Promise<{ txHash: string; status: 'SUCCESS' | 'FAILED' }> {
  const server = getSorobanRpc(network);
  let txToSend = preparedTx;

  const isFreighter = await isFreighterConnected().catch(() => false);

  if (isFreighter && callerAddress !== DEMO_TESTNET_KEYPAIR.publicKey) {
    const signedRes: any = await signTransaction(preparedTx.toXDR(), {
      networkPassphrase: STELLAR_CONFIG[network].passphrase,
    });
    const xdrString = typeof signedRes === 'string' ? signedRes : signedRes?.signedTxXdr || preparedTx.toXDR();
    txToSend = TransactionBuilder.fromXDR(xdrString, STELLAR_CONFIG[network].passphrase);

  } else {
    // Sign with live funded Testnet demo keypair
    const kp = Keypair.fromSecret(DEMO_TESTNET_KEYPAIR.secret);
    txToSend.sign(kp);
  }

  const sendRes = await server.sendTransaction(txToSend);
  if (sendRes.status === 'ERROR') {
    throw new Error(sendRes.errorResult?.toString() || 'Transaction rejected by Soroban RPC node');
  }

  const txHash = sendRes.hash;
  const pollRes = await server.pollTransaction(txHash, { attempts: 25 });

  if (pollRes.status === 'SUCCESS') {
    return { txHash, status: 'SUCCESS' };
  } else {
    throw new Error(`Transaction finished with status ${pollRes.status}`);
  }
}

/**
 * Executes a REAL on-chain purchase transaction on Soroban
 */
export async function executePurchase({
  buyerAddress,
  itemId,
  contractId = TESTNET_CONTRACT_ID,
  paymentToken,
  network = 'TESTNET',
}: {
  buyerAddress: string;
  itemId: number;
  contractId?: string;
  paymentToken?: string;
  network?: StellarNetwork;
}): Promise<{ txHash: string; status: string }> {
  const tokenToUse = paymentToken || getNativeSacAddress(network);
  const server = getSorobanRpc(network);
  const buyerAcc = await server.getAccount(buyerAddress);
  const contract = new Contract(contractId);

  const baseTx = new TransactionBuilder(buyerAcc, {
    fee: '15000',
    networkPassphrase: STELLAR_CONFIG[network].passphrase,
  })
    .addOperation(
      contract.call(
        'purchase',
        new Address(buyerAddress).toScVal(),
        nativeToScVal(itemId, { type: 'u32' }),
        new Address(tokenToUse).toScVal()
      )
    )
    .setTimeout(180)
    .build();

  const preparedTx = await server.prepareTransaction(baseTx);
  return await signAndSubmitTx(preparedTx, buyerAddress, network);
}

/**
 * Executes a REAL on-chain place_and_list transaction on Soroban
 */
export async function executePlaceAndList({
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
}): Promise<{ txHash: string; status: string; nextItemId?: number }> {
  const server = getSorobanRpc(network);
  const sellerAcc = await server.getAccount(sellerAddress);
  const contract = new Contract(contractId);
  const priceStroops = xlmToStroops(priceInXlm);

  const baseTx = new TransactionBuilder(sellerAcc, {
    fee: '15000',
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

  const preparedTx = await server.prepareTransaction(baseTx);
  const result = await signAndSubmitTx(preparedTx, sellerAddress, network);
  return result;
}

/**
 * Executes a REAL on-chain delist transaction on Soroban
 */
export async function executeDelist({
  callerAddress,
  itemId,
  contractId = TESTNET_CONTRACT_ID,
  network = 'TESTNET',
}: {
  callerAddress: string;
  itemId: number;
  contractId?: string;
  network?: StellarNetwork;
}): Promise<{ txHash: string; status: string }> {
  const server = getSorobanRpc(network);
  const callerAcc = await server.getAccount(callerAddress);
  const contract = new Contract(contractId);

  const baseTx = new TransactionBuilder(callerAcc, {
    fee: '10000',
    networkPassphrase: STELLAR_CONFIG[network].passphrase,
  })
    .addOperation(
      contract.call(
        'delist',
        new Address(callerAddress).toScVal(),
        nativeToScVal(itemId, { type: 'u32' })
      )
    )
    .setTimeout(180)
    .build();

  const preparedTx = await server.prepareTransaction(baseTx);
  return await signAndSubmitTx(preparedTx, callerAddress, network);
}

/**
 * Executes a REAL on-chain set_policy transaction on Soroban
 */
export async function executeSetPolicy({
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
}): Promise<{ txHash: string; status: string }> {
  const server = getSorobanRpc(network);
  const callerAcc = await server.getAccount(callerAddress);
  const contract = new Contract(contractId);
  const minFloorStroops = xlmToStroops(minFloorPriceInXlm);

  const scSplits = upstreamSplits.map((s) => ({
    recipient: s.recipient,
    share_bps: s.shareBps,
  }));

  const baseTx = new TransactionBuilder(callerAcc, {
    fee: '15000',
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
  return await signAndSubmitTx(preparedTx, callerAddress, network);
}
