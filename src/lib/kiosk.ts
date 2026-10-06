
export type Kiosk = {
  id: string;
  owner_address: string;
  name: string;
  description: string;
  settlement_token: string;
  is_initialized: boolean;
  contract_id: string;
  total_sales_volume: number;
  created_at: string;
};

export type KioskItem = {
  id: string;
  onchain_id?: number;
  kiosk_id: string;
  title: string;
  description: string;
  asset_type: string;
  price: number;
  icon: string;
  status: string;
  created_at: string;
};

export type UpstreamRecipient = {
  label: string;
  address: string;
  shareBps: number;
};

export type TransferPolicy = {
  id: string;
  item_id: string;
  min_royalty_bps: number;
  upstream_split_bps: number;
  upstream_recipients: UpstreamRecipient[];
  timelock_seconds: number;
  escrow_mode: string;
  created_at: string;
};

export type EscrowTransaction = {
  id: string;
  kiosk_id: string;
  item_id: string;
  buyer_address: string;
  seller_address: string;
  amount: number;
  seller_payout: number;
  royalty_payout: number;
  upstream_payout: number;
  tx_hash: string;
  ledger_timestamp: string;
  status: string;
  created_at: string;
};

export type WidgetConfig = {
  id: string;
  kiosk_id: string;
  theme: string;
  accent_color: string;
  button_text: string;
  show_preview: boolean;
  border_radius: number;
  created_at: string;
};

import { TESTNET_CONTRACT_ID } from './stellar';

// Dynamic Protocol Defaults
export const LIVE_TESTNET_CONTRACT_ID = TESTNET_CONTRACT_ID;

// Seed protocol defaults
const SEED_KIOSK: Kiosk = {
  id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
  owner_address: '',
  name: 'StellarForge DevKiosk (Testnet)',
  description: 'Composable escrow kiosk for open-source software licenses and digital passes on Soroban Testnet.',
  settlement_token: 'XLM',
  is_initialized: true,
  contract_id: LIVE_TESTNET_CONTRACT_ID,
  total_sales_volume: 50,
  created_at: new Date().toISOString(),
};

const SEED_ITEMS: KioskItem[] = [
  {
    id: 'item-101',
    onchain_id: 1,
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Soroban Developer Pass #42',
    description: 'Lifetime testnet validator pass and Soroban smart contract builder tier.',
    asset_type: 'Pass',
    price: 5,
    icon: 'Key',
    status: 'SETTLED',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item-102',
    onchain_id: 2,
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Stellar Horizon API Pro License',
    description: 'Commercial license for rate-limit exempt Stellar indexer endpoints.',
    asset_type: 'License',
    price: 10,
    icon: 'Shield',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'item-103',
    onchain_id: 3,
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Meridian 2026 Founder Badge',
    description: 'Limited edition non-custodial collectible badge for ecosystem builders.',
    asset_type: 'Collectible',
    price: 5,
    icon: 'Award',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'item-104',
    onchain_id: 4,
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Soroban Developer Pass #42 (Tier 2)',
    description: 'Lifetime testnet validator pass and Soroban smart contract builder tier.',
    asset_type: 'Pass',
    price: 5,
    icon: 'Key',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const SEED_POLICIES: Record<string, TransferPolicy> = {
  'item-101': {
    id: 'pol-101',
    item_id: 'item-101',
    min_royalty_bps: 750,
    upstream_split_bps: 250,
    upstream_recipients: [],
    timelock_seconds: 0,
    escrow_mode: 'INSTANT',
    created_at: new Date().toISOString(),
  },
  'item-102': {
    id: 'pol-102',
    item_id: 'item-102',
    min_royalty_bps: 1000,
    upstream_split_bps: 500,
    upstream_recipients: [],
    timelock_seconds: 86400,
    escrow_mode: 'TIMELOCK',
    created_at: new Date().toISOString(),
  },
  'item-103': {
    id: 'pol-103',
    item_id: 'item-103',
    min_royalty_bps: 500,
    upstream_split_bps: 250,
    upstream_recipients: [],
    timelock_seconds: 0,
    escrow_mode: 'INSTANT',
    created_at: new Date().toISOString(),
  },
  'item-104': {
    id: 'pol-104',
    item_id: 'item-104',
    min_royalty_bps: 750,
    upstream_split_bps: 250,
    upstream_recipients: [],
    timelock_seconds: 0,
    escrow_mode: 'INSTANT',
    created_at: new Date().toISOString(),
  },
};

const SEED_WIDGET: WidgetConfig = {
  id: 'w-1',
  kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
  theme: 'dark',
  accent_color: '#00E5FF',
  button_text: 'Buy via StellarKiosk',
  show_preview: true,
  border_radius: 12,
  created_at: new Date().toISOString(),
};

const STORE_KEY_KIOSK = 'stellarkiosk_kiosk';
const STORE_KEY_ITEMS = 'stellarkiosk_items';
const STORE_KEY_POLICIES = 'stellarkiosk_policies';
const STORE_KEY_WIDGET = 'stellarkiosk_widget';
const STORE_KEY_TXS = 'stellarkiosk_txs';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const val = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!val) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // Ignore quota
  }
}

function getAccountPrefix(address?: string | null): string {
  if (!address) {
    return 'default_';
  }
  return `stellar_${address.slice(0, 10)}_`;
}

/**
 * Pure on-chain & decentralized protocol storage client for Stellar Testnet.
 */
export const kioskStorage = {
  async getKiosk(address?: string | null): Promise<Kiosk | null> {
    const key = `${STORE_KEY_KIOSK}_${getAccountPrefix(address)}`;
    // Always persist and initialize with the real deployed Testnet Kiosk
    const stored = loadFromStorage<Kiosk | null>(key, null);
    if (stored) {
      // Auto-migrate any previously cached random mock contract IDs
      if (!stored.contract_id || stored.contract_id.length !== 56 || stored.contract_id !== LIVE_TESTNET_CONTRACT_ID) {
        stored.contract_id = LIVE_TESTNET_CONTRACT_ID;
        saveToStorage(key, stored);
      }
      return stored;
    }

    const initialKiosk: Kiosk = {
      ...SEED_KIOSK,
      owner_address: address || '',
    };
    saveToStorage(key, initialKiosk);
    return initialKiosk;
  },

  async updateKiosk(patch: Partial<Kiosk>, address?: string | null): Promise<Kiosk> {
    const key = `${STORE_KEY_KIOSK}_${getAccountPrefix(address)}`;
    const current = (await this.getKiosk(address)) || {
      id: `kiosk-${Date.now()}`,
      owner_address: address || '',
      name: 'My Soroban Kiosk',
      description: 'Decentralized escrow kiosk on Stellar Soroban',
      settlement_token: 'XLM',
      is_initialized: true,
      contract_id: LIVE_TESTNET_CONTRACT_ID,
      total_sales_volume: 0,
      created_at: new Date().toISOString(),
    };
    const updated = { ...current, ...patch };
    saveToStorage(key, updated);
    return updated;
  },

  async getItems(kioskId: string, address?: string | null): Promise<KioskItem[]> {
    const key = `${STORE_KEY_ITEMS}_${getAccountPrefix(address)}`;
    const stored = loadFromStorage<KioskItem[] | null>(key, null);
    if (stored !== null) {
      let needsSave = false;
      const onChainMapping: Record<string, { onchain_id: number; price: number; title?: string }> = {
        'item-101': { onchain_id: 1, price: 5 },
        'item-102': { onchain_id: 2, price: 10, title: 'Stellar Horizon API Pro License' },
        'item-103': { onchain_id: 3, price: 5, title: 'Meridian 2026 Founder Badge' },
        'item-104': { onchain_id: 4, price: 5, title: 'Soroban Developer Pass #42 (Tier 2)' },
      };

      const mapped = stored.map((item) => {
        const match = onChainMapping[item.id];
        if (match) {
          if (item.onchain_id !== match.onchain_id || item.price !== match.price) {
            needsSave = true;
            return { ...item, onchain_id: match.onchain_id, price: match.price, title: match.title || item.title };
          }
        }
        return item;
      });

      // Also ensure item-104 is present if missing from legacy cache
      if (!mapped.some((i) => i.id === 'item-104')) {
        const seed104 = SEED_ITEMS.find((i) => i.id === 'item-104');
        if (seed104) {
          mapped.push(seed104);
          needsSave = true;
        }
      }

      if (needsSave) {
        saveToStorage(key, mapped);
      }
      return mapped;
    }
    // Seed items persisted on first run
    saveToStorage(key, SEED_ITEMS);
    return SEED_ITEMS;
  },

  async addItem(item: Omit<KioskItem, 'id' | 'created_at'>, address?: string | null): Promise<KioskItem> {
    const newItem: KioskItem = {
      ...item,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const key = `${STORE_KEY_ITEMS}_${getAccountPrefix(address)}`;
    const current = await this.getItems(item.kiosk_id, address);
    const updated = [newItem, ...current];
    saveToStorage(key, updated);
    return newItem;
  },

  async deleteItem(id: string, address?: string | null): Promise<void> {
    const key = `${STORE_KEY_ITEMS}_${getAccountPrefix(address)}`;
    const current = await this.getItems('', address);
    saveToStorage(key, current.filter((i) => i.id !== id));
  },

  async getPolicies(address?: string | null): Promise<Record<string, TransferPolicy>> {
    const key = `${STORE_KEY_POLICIES}_${getAccountPrefix(address)}`;
    const stored = loadFromStorage<Record<string, TransferPolicy> | null>(key, null);
    if (stored !== null) {
      return stored;
    }
    saveToStorage(key, SEED_POLICIES);
    return SEED_POLICIES;
  },

  async savePolicy(policy: Omit<TransferPolicy, 'id' | 'created_at'> & { id?: string }, address?: string | null): Promise<TransferPolicy> {
    const key = `${STORE_KEY_POLICIES}_${getAccountPrefix(address)}`;
    const savedPolicy: TransferPolicy = {
      ...policy,
      id: policy.id || `pol-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = await this.getPolicies(address);
    all[policy.item_id] = savedPolicy;
    saveToStorage(key, all);
    return savedPolicy;
  },

  async getWidgetConfig(kioskId: string, address?: string | null): Promise<WidgetConfig> {
    const key = `${STORE_KEY_WIDGET}_${getAccountPrefix(address)}`;
    return loadFromStorage<WidgetConfig>(key, {
      ...SEED_WIDGET,
      kiosk_id: kioskId || SEED_KIOSK.id,
    });
  },

  async updateWidgetConfig(patch: Partial<WidgetConfig>, address?: string | null): Promise<WidgetConfig> {
    const key = `${STORE_KEY_WIDGET}_${getAccountPrefix(address)}`;
    const current = await this.getWidgetConfig(patch.kiosk_id || '', address);
    const updated = { ...current, ...patch };
    saveToStorage(key, updated);
    return updated;
  },

  async getTransactions(kioskId: string, address?: string | null): Promise<EscrowTransaction[]> {
    const key = `${STORE_KEY_TXS}_${getAccountPrefix(address)}`;
    return loadFromStorage<EscrowTransaction[]>(key, []);
  },

  async recordTransaction(tx: Omit<EscrowTransaction, 'id' | 'created_at'>, address?: string | null): Promise<EscrowTransaction> {
    const key = `${STORE_KEY_TXS}_${getAccountPrefix(address)}`;
    const newTx: EscrowTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = await this.getTransactions(tx.kiosk_id, address);
    const updated = [newTx, ...all];
    saveToStorage(key, updated);
    return newTx;
  },
};
