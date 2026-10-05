import { Horizon, Networks } from '@stellar/stellar-sdk';

export type StellarNetwork = 'TESTNET' | 'MAINNET';

export const STELLAR_CONFIG = {
  TESTNET: {
    network: 'TESTNET' as StellarNetwork,
    passphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    explorerTxUrl: 'https://stellar.expert/explorer/testnet/tx/',
    explorerAccountUrl: 'https://stellar.expert/explorer/testnet/account/',
  },
  MAINNET: {
    network: 'MAINNET' as StellarNetwork,
    passphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    sorobanRpcUrl: 'https://mainnet.sorobanrpc.com',
    explorerTxUrl: 'https://stellar.expert/explorer/public/tx/',
    explorerAccountUrl: 'https://stellar.expert/explorer/public/account/',
  },
} as const;

export function getHorizonServer(network: StellarNetwork): Horizon.Server {
  return new Horizon.Server(STELLAR_CONFIG[network].horizonUrl);
}

export async function fetchLiveAccount(address: string, network: StellarNetwork) {
  try {
    const server = getHorizonServer(network);
    const account = await server.loadAccount(address);
    const xlmBalance = account.balances.find((b) => b.asset_type === 'native')?.balance || '0';
    return {
      exists: true,
      sequence: account.sequence,
      xlmBalance,
      balances: account.balances,
    };
  } catch (err: unknown) {
    // 404 means unfunded/new account on this network
    return {
      exists: false,
      sequence: '0',
      xlmBalance: '0',
      balances: [],
    };
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
  let id = 'C';
  for (let i = 0; i < 55; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
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
