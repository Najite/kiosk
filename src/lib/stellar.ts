import { Horizon, Networks, Keypair } from '@stellar/stellar-sdk';

export type StellarNetwork = 'TESTNET' | 'MAINNET';

/**
 * Deterministic Native Stellar Asset Contract (SAC) addresses:
 * - Testnet: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
 * - Mainnet: CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EZH7JPMCXL
 */
export const NATIVE_SAC: Record<StellarNetwork, string> = {
  TESTNET: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  MAINNET: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EZH7JPMCXL',
};

// Deployed testnet kiosk smart contract ID
export const DEFAULT_TESTNET_SHOWCASE_KIOSK = 'CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB';
export const TESTNET_CONTRACT_ID = DEFAULT_TESTNET_SHOWCASE_KIOSK;

// Live funded Testnet account for instant browser execution without extension
export const DEMO_TESTNET_KEYPAIR = {
  publicKey: 'GD4RTK3MUD7HRISAQHRFRU7GJWC7OQA7VKDQLAMYZE54OZ6FLFH7K5F2',
  secret: 'SC6DEVIYGNCEETKN4K5Q2AUNMHCIGDHCMULYOP3E6H3JBSNVEHPSTJLS',
};

export const STELLAR_CONFIG = {
  TESTNET: {
    network: 'TESTNET' as StellarNetwork,
    passphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    explorerTxUrl: 'https://stellar.expert/explorer/testnet/tx/',
    explorerAccountUrl: 'https://stellar.expert/explorer/testnet/account/',
    explorerContractUrl: 'https://stellar.expert/explorer/testnet/contract/',
    contractId: DEFAULT_TESTNET_SHOWCASE_KIOSK,
    sacAddress: NATIVE_SAC.TESTNET,
  },
  MAINNET: {
    network: 'MAINNET' as StellarNetwork,
    passphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://mainnet.sorobanrpc.com',
    explorerTxUrl: 'https://stellar.expert/explorer/public/tx/',
    explorerAccountUrl: 'https://stellar.expert/explorer/public/account/',
    explorerContractUrl: 'https://stellar.expert/explorer/public/contract/',
    contractId: '',
    sacAddress: NATIVE_SAC.MAINNET,
  },
} as const;

export function getHorizonServer(network: StellarNetwork = 'TESTNET'): Horizon.Server {
  return new Horizon.Server(STELLAR_CONFIG[network].horizonUrl);
}

export function getSorobanRpcUrl(network: StellarNetwork = 'TESTNET'): string {
  return STELLAR_CONFIG[network].sorobanRpcUrl;
}

export function getNativeSacAddress(network: StellarNetwork = 'TESTNET'): string {
  return NATIVE_SAC[network] || NATIVE_SAC.TESTNET;
}

/**
 * Fetch live account details and real balance directly from Stellar Horizon RPC
 */
export async function fetchLiveAccount(address: string, network: StellarNetwork = 'TESTNET') {
  try {
    const horizonUrl = STELLAR_CONFIG[network].horizonUrl;
    const response = await fetch(`${horizonUrl}/accounts/${encodeURIComponent(address)}`);

    if (response.status === 404) {
      return {
        exists: false,
        sequence: '0',
        xlmBalance: '0',
        balances: [],
      };
    }

    if (!response.ok) {
      return {
        exists: false,
        sequence: '0',
        xlmBalance: '0',
        balances: [],
      };
    }

    const data = await response.json();
    const balances = Array.isArray(data.balances) ? data.balances : [];
    const nativeBal = balances.find((b: { asset_type?: string }) => b.asset_type === 'native');
    const xlmBalance = nativeBal?.balance || '0';

    return {
      exists: true,
      sequence: data.sequence || '0',
      xlmBalance,
      balances,
    };
  } catch (err) {
    console.warn('Horizon account fetch error:', err);
    return {
      exists: false,
      sequence: '0',
      xlmBalance: '0',
      balances: [],
    };
  }
}

/**
 * Calls Stellar Friendbot API to fund an account on Testnet with 10,000 real testnet XLM
 */
export async function fundTestnetAccount(address: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    return res.ok;
  } catch {
    return false;
  }
}

export function shortAddress(addr?: string | null, chars = 5): string {
  if (!addr) return '';
  if (addr.length < chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function stroopsToXlm(stroops: bigint | number | string): number {
  return Number(stroops) / 10_000_000;
}

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}
