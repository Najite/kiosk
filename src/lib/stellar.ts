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

// Configurable testnet kiosk smart contract ID
export const DEFAULT_TESTNET_SHOWCASE_KIOSK =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_KIOSK_CONTRACT_ID) ||
  'CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R';
export const TESTNET_CONTRACT_ID = DEFAULT_TESTNET_SHOWCASE_KIOSK;

// Configurable standard SEP-0041 Soroban token asset contract ID
export const DEFAULT_TESTNET_ASSET_CONTRACT =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSET_CONTRACT_ID) ||
  'CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA';

/**
 * Format any Stellar public key or contract address into a clean shortened string
 */
export function formatAddress(address: string, prefixLen = 6, suffixLen = 6): string {
  if (!address || address.length <= prefixLen + suffixLen) return address || '';
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}

const EPHEMERAL_KEY_STORAGE = 'kiosk_ephemeral_testnet_secret';

/**
 * Retrieve ephemeral burner keypair stored in browser session (if any)
 */
export function getEphemeralKeypair(): Keypair | null {
  if (typeof window === 'undefined') return null;
  const secret = window.sessionStorage?.getItem(EPHEMERAL_KEY_STORAGE);
  if (!secret) return null;
  try {
    return Keypair.fromSecret(secret);
  } catch {
    return null;
  }
}

/**
 * Create or retrieve an ephemeral burner testnet keypair (generated client-side, never hardcoded)
 */
export function getOrCreateEphemeralKeypair(): Keypair {
  const existing = getEphemeralKeypair();
  if (existing) return existing;
  const created = Keypair.random();
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(EPHEMERAL_KEY_STORAGE, created.secret());
  }
  return created;
}

/**
 * Clear ephemeral burner testnet keypair
 */
export function clearEphemeralKeypair(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem(EPHEMERAL_KEY_STORAGE);
  }
}

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
