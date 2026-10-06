import {
  rpc,
  Contract,
  TransactionBuilder,
  Account,
  Networks,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import {
  STELLAR_CONFIG,
  TESTNET_CONTRACT_ID,
  type StellarNetwork,
} from './stellar';

export type OnChainPolicy = {
  minFloorPrice: bigint;
  royaltyBps: number;
  royaltyRecipient: string;
};

export type OnChainItem = {
  id: number;
  title: string;
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
  network: StellarNetwork = 'TESTNET'
): Promise<OnChainPolicy | null> {
  try {
    const server = getSorobanRpc(network);
    const contract = new Contract(contractId);
    const dummyAccount = new Account(
      'GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X',
      '0'
    );

    const tx = new TransactionBuilder(dummyAccount, {
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
    return {
      minFloorPrice: BigInt(val.min_floor_price ?? 0),
      royaltyBps: Number(val.royalty_bps ?? 0),
      royaltyRecipient: String(val.royalty_recipient ?? ''),
    };
  } catch (err) {
    console.warn('Failed to query on-chain policy:', err);
    return null;
  }
}

/**
 * Read specific item from Soroban on-chain storage
 */
export async function fetchContractItem(
  itemId: number,
  contractId: string = TESTNET_CONTRACT_ID,
  network: StellarNetwork = 'TESTNET'
): Promise<OnChainItem | null> {
  try {
    const server = getSorobanRpc(network);
    const contract = new Contract(contractId);
    const dummyAccount = new Account(
      'GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X',
      '0'
    );

    const tx = new TransactionBuilder(dummyAccount, {
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
      title: String(val.title),
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
  maxItems: number = 20
): Promise<OnChainItem[]> {
  const items: OnChainItem[] = [];
  for (let i = 1; i <= maxItems; i++) {
    const item = await fetchContractItem(i, contractId, network);
    if (!item) break;
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
    // Look back up to 10,000 ledgers
    const startLedger = Math.max(1, latestLedger - 10000);

    const eventsRes = await server.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
        },
      ],
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
