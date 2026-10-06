import { Horizon, Networks } from '@stellar/stellar-sdk';

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

// Default featured showcase kiosk on Stellar Testnet
export const DEFAULT_TESTNET_SHOWCASE_KIOSK = 'CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB';

export function getNativeSacAddress(network: StellarNetwork = 'TESTNET'): string {
  return NATIVE_SAC[network] || NATIVE_SAC.TESTNET;
}

export const TESTNET_CONTRACT_ID = DEFAULT_TESTNET_SHOWCASE_KIOSK;
export const TESTNET_SAC_XLM = NATIVE_SAC.TESTNET;

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

export function getHorizonServer(network: StellarNetwork): Horizon.Server {
  return new Horizon.Server(STELLAR_CONFIG[network].horizonUrl);
}

export function getSorobanRpcUrl(network: StellarNetwork): string {
  return STELLAR_CONFIG[network].sorobanRpcUrl;
}

export async function fetchLiveAccount(address: string, network: StellarNetwork) {
  try {
    const horizonUrl = STELLAR_CONFIG[network].horizonUrl;
    // Perform standard fetch first to gracefully check status without triggering unhandled SDK exceptions
    const response = await fetch(`${horizonUrl}/accounts/${encodeURIComponent(address)}`);
    
    if (response.status === 404) {
      // Account exists as a valid Stellar public key, but has not yet received base reserve on this network
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
  } catch {
    return {
      exists: false,
      sequence: '0',
      xlmBalance: '0',
      balances: [],
    };
  }
}

export async function fundTestnetAccount(address: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(address)}`);
    return res.ok;
  } catch {
    return false;
  }
}

// Stellar address + transaction simulation utilities
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateStellarAddress(): string {
  let addr = 'G';
  for (let i = 0; i < 55; i++) {
    addr += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return addr;
}

export function generateTxHash(): string {
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  return hash;
}

export function generateContractId(): string {
  return TESTNET_CONTRACT_ID;
}

export function shortAddress(addr: string, chars = 6): string {
  if (!addr || addr.length < chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

export function formatTokenAmount(amount: number, token: string): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${token}`;
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Instant';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export type PayoutSplit = {
  sellerPayout: number;
  royaltyPayout: number;
  upstreamPayout: number;
};

export function calculatePayouts(
  amount: number,
  royaltyBps: number,
  upstreamBps: number
): PayoutSplit {
  const royaltyPayout = (amount * royaltyBps) / 10000;
  const upstreamPayout = (amount * upstreamBps) / 10000;
  const sellerPayout = amount - royaltyPayout - upstreamPayout;
  return { sellerPayout, royaltyPayout, upstreamPayout };
}
