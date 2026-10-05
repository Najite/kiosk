import {
  formatTokenAmount,
  shortAddress,
  type StellarNetwork,
} from '@/lib/stellar';

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

// Seed protocol defaults
const SEED_KIOSK: Kiosk = {
  id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
  owner_address: 'GDMX7A2QZ54V4QBTQRMZKAY3UGZ7JZ5YGP7ZU4F4ZZJ7K3KQM4X6Q3AL',
  name: 'StellarForge DevKiosk',
  description: 'Composable escrow kiosk for open-source software licenses and digital passes on Soroban.',
  settlement_token: 'XLM',
  is_initialized: true,
  contract_id: 'CA3D5KRYM6CB7EFQKPTX3X4D5J7YZKQXKL5Q6Q3HOKFD4A2JFZ4S2C5Y',
  total_sales_volume: 4850,
  created_at: new Date().toISOString(),
};

const SEED_ITEMS: KioskItem[] = [
  {
    id: 'item-101',
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Soroban Developer Pass #42',
    description: 'Lifetime testnet validator pass and Soroban smart contract builder tier.',
    asset_type: 'Pass',
    price: 350,
    icon: 'Key',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'item-102',
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Stellar Horizon API Pro License',
    description: 'Commercial license for rate-limit exempt Stellar indexer endpoints.',
    asset_type: 'License',
    price: 1200,
    icon: 'Shield',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'item-103',
    kiosk_id: '3f6c8270-17e9-4e7a-9a99-b1d7d825c7e1',
    title: 'Meridian 2026 Founder Badge',
    description: 'Limited edition non-custodial collectible badge for ecosystem builders.',
    asset_type: 'Collectible',
    price: 500,
    icon: 'Award',
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

const SEED_POLICIES: Record<string, TransferPolicy> = {
  'item-101': {
    id: 'pol-101',
    item_id: 'item-101',
    min_royalty_bps: 750,
    upstream_split_bps: 250,
    upstream_recipients: [
      {
        label: 'Protocol Treasury',
        address: 'GCK62D5A46GJZC2QG3XPL3WNZJ7K4L7M2N3P4Q5R6S7T8U9V0W1X2Y3Z',
        shareBps: 250,
      },
    ],
    timelock_seconds: 0,
    escrow_mode: 'INSTANT',
    created_at: new Date().toISOString(),
  },
  'item-102': {
    id: 'pol-102',
    item_id: 'item-102',
    min_royalty_bps: 1000,
    upstream_split_bps: 500,
    upstream_recipients: [
      {
        label: 'Stellar Community Fund',
        address: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVWGS',
        shareBps: 500,
      },
    ],
    timelock_seconds: 86400,
    escrow_mode: 'TIMELOCK',
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

function getAccountPrefix(address?: string | null, isSimulated?: boolean): string {
  if (isSimulated || !address) {
    return 'demo_';
  }
  return `live_${address.slice(0, 10)}_`;
}

/**
 * Pure on-chain & decentralized protocol storage client.
 * Supports:
 * 1. Demo Sandbox mode: pre-seeded interactive demo for reviewers and visitors.
 * 2. Live Wallet mode: cleanly isolated to the connected Stellar account with real empty-states.
 */
export const kioskStorage = {
  async getKiosk(address?: string | null, isSimulated?: boolean): Promise<Kiosk | null> {
    const isLive = !isSimulated && Boolean(address);
    const key = `${STORE_KEY_KIOSK}_${getAccountPrefix(address, isSimulated)}`;
    
    if (isLive) {
      // In live mode, only return if the user has actually initialized one for their address
      return loadFromStorage<Kiosk | null>(key, null);
    }
    // In demo / preview mode, return interactive seed kiosk
    return loadFromStorage<Kiosk>(key, SEED_KIOSK);
  },

  async updateKiosk(patch: Partial<Kiosk>, address?: string | null, isSimulated?: boolean): Promise<Kiosk> {
    const key = `${STORE_KEY_KIOSK}_${getAccountPrefix(address, isSimulated)}`;
    const current = (await this.getKiosk(address, isSimulated)) || {
      id: `kiosk-${Date.now()}`,
      owner_address: address || SEED_KIOSK.owner_address,
      name: 'My Soroban Kiosk',
      description: 'Decentralized escrow kiosk on Stellar Soroban',
      settlement_token: 'XLM',
      is_initialized: true,
      contract_id: 'PENDING',
      total_sales_volume: 0,
      created_at: new Date().toISOString(),
    };
    const updated = { ...current, ...patch };
    saveToStorage(key, updated);
    return updated;
  },

  async getItems(kioskId: string, address?: string | null, isSimulated?: boolean): Promise<KioskItem[]> {
    const isLive = !isSimulated && Boolean(address);
    const key = `${STORE_KEY_ITEMS}_${getAccountPrefix(address, isSimulated)}`;
    
    if (isLive) {
      // Live wallet starts with honest 0 items until user creates them
      return loadFromStorage<KioskItem[]>(key, []);
    }
    return loadFromStorage<KioskItem[]>(key, SEED_ITEMS);
  },

  async addItem(item: Omit<KioskItem, 'id' | 'created_at'>, address?: string | null, isSimulated?: boolean): Promise<KioskItem> {
    const newItem: KioskItem = {
      ...item,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const key = `${STORE_KEY_ITEMS}_${getAccountPrefix(address, isSimulated)}`;
    const current = await this.getItems(item.kiosk_id, address, isSimulated);
    const updated = [newItem, ...current];
    saveToStorage(key, updated);
    return newItem;
  },

  async deleteItem(id: string, address?: string | null, isSimulated?: boolean): Promise<void> {
    const key = `${STORE_KEY_ITEMS}_${getAccountPrefix(address, isSimulated)}`;
    const current = await this.getItems('', address, isSimulated);
    saveToStorage(key, current.filter((i) => i.id !== id));
  },

  async getPolicies(address?: string | null, isSimulated?: boolean): Promise<Record<string, TransferPolicy>> {
    const isLive = !isSimulated && Boolean(address);
    const key = `${STORE_KEY_POLICIES}_${getAccountPrefix(address, isSimulated)}`;
    if (isLive) {
      return loadFromStorage<Record<string, TransferPolicy>>(key, {});
    }
    return loadFromStorage<Record<string, TransferPolicy>>(key, SEED_POLICIES);
  },

  async savePolicy(policy: Omit<TransferPolicy, 'id' | 'created_at'> & { id?: string }, address?: string | null, isSimulated?: boolean): Promise<TransferPolicy> {
    const key = `${STORE_KEY_POLICIES}_${getAccountPrefix(address, isSimulated)}`;
    const savedPolicy: TransferPolicy = {
      ...policy,
      id: policy.id || `pol-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = await this.getPolicies(address, isSimulated);
    all[policy.item_id] = savedPolicy;
    saveToStorage(key, all);
    return savedPolicy;
  },

  async getWidgetConfig(kioskId: string, address?: string | null, isSimulated?: boolean): Promise<WidgetConfig> {
    const key = `${STORE_KEY_WIDGET}_${getAccountPrefix(address, isSimulated)}`;
    return loadFromStorage<WidgetConfig>(key, {
      ...SEED_WIDGET,
      kiosk_id: kioskId || SEED_KIOSK.id,
    });
  },

  async updateWidgetConfig(patch: Partial<WidgetConfig>, address?: string | null, isSimulated?: boolean): Promise<WidgetConfig> {
    const key = `${STORE_KEY_WIDGET}_${getAccountPrefix(address, isSimulated)}`;
    const current = await this.getWidgetConfig(patch.kiosk_id || '', address, isSimulated);
    const updated = { ...current, ...patch };
    saveToStorage(key, updated);
    return updated;
  },

  async getTransactions(kioskId: string, address?: string | null, isSimulated?: boolean): Promise<EscrowTransaction[]> {
    const key = `${STORE_KEY_TXS}_${getAccountPrefix(address, isSimulated)}`;
    return loadFromStorage<EscrowTransaction[]>(key, []);
  },

  async recordTransaction(tx: Omit<EscrowTransaction, 'id' | 'created_at'>, address?: string | null, isSimulated?: boolean): Promise<EscrowTransaction> {
    const key = `${STORE_KEY_TXS}_${getAccountPrefix(address, isSimulated)}`;
    const newTx: EscrowTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const all = await this.getTransactions(tx.kiosk_id, address, isSimulated);
    const updated = [newTx, ...all];
    saveToStorage(key, updated);
    return newTx;
  },
};
