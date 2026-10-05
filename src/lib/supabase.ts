import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawKey &&
    !rawUrl.includes('placeholder') &&
    rawUrl.startsWith('https://')
);

// Fallback client (only queries if configured)
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://example.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Seed defaults
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

// Safe Local Storage Store to eliminate ERR_NAME_NOT_RESOLVED
const STORE_KEY_KIOSK = 'stellarkiosk_kiosk';
const STORE_KEY_ITEMS = 'stellarkiosk_items';
const STORE_KEY_POLICIES = 'stellarkiosk_policies';
const STORE_KEY_WIDGET = 'stellarkiosk_widget';
const STORE_KEY_TXS = 'stellarkiosk_txs';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage quota
  }
}

export const kioskStorage = {
  async getKiosk(): Promise<Kiosk> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('kiosks').select('*').order('created_at').limit(1).maybeSingle();
      if (data) return data as Kiosk;
    }
    return loadFromStorage<Kiosk>(STORE_KEY_KIOSK, SEED_KIOSK);
  },

  async updateKiosk(patch: Partial<Kiosk>): Promise<Kiosk> {
    const current = await this.getKiosk();
    const updated = { ...current, ...patch };
    if (isSupabaseConfigured) {
      await supabase.from('kiosks').update(patch).eq('id', current.id);
    }
    saveToStorage(STORE_KEY_KIOSK, updated);
    return updated;
  },

  async getItems(kioskId: string): Promise<KioskItem[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('kiosk_items').select('*').eq('kiosk_id', kioskId).order('created_at', { ascending: false });
      if (data) return data as KioskItem[];
    }
    return loadFromStorage<KioskItem[]>(STORE_KEY_ITEMS, SEED_ITEMS);
  },

  async addItem(item: Omit<KioskItem, 'id' | 'created_at'>): Promise<KioskItem> {
    const newItem: KioskItem = {
      ...item,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('kiosk_items').insert(item).select().maybeSingle();
      if (data) return data as KioskItem;
    }
    const current = await this.getItems(item.kiosk_id);
    const updated = [newItem, ...current];
    saveToStorage(STORE_KEY_ITEMS, updated);
    return newItem;
  },

  async deleteItem(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('kiosk_items').delete().eq('id', id);
    }
    const current = loadFromStorage<KioskItem[]>(STORE_KEY_ITEMS, SEED_ITEMS);
    saveToStorage(STORE_KEY_ITEMS, current.filter((i) => i.id !== id));
  },

  async getPolicies(): Promise<Record<string, TransferPolicy>> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('transfer_policies').select('*');
      if (data) {
        const pm: Record<string, TransferPolicy> = {};
        (data as TransferPolicy[]).forEach((p) => { pm[p.item_id] = p; });
        return pm;
      }
    }
    return loadFromStorage<Record<string, TransferPolicy>>(STORE_KEY_POLICIES, SEED_POLICIES);
  },

  async savePolicy(policy: Omit<TransferPolicy, 'id' | 'created_at'> & { id?: string }): Promise<TransferPolicy> {
    const savedPolicy: TransferPolicy = {
      ...policy,
      id: policy.id || `pol-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      if (policy.id) {
        await supabase.from('transfer_policies').update(policy).eq('id', policy.id);
      } else {
        await supabase.from('transfer_policies').insert(policy);
      }
    }
    const all = await this.getPolicies();
    all[policy.item_id] = savedPolicy;
    saveToStorage(STORE_KEY_POLICIES, all);
    return savedPolicy;
  },

  async getWidgetConfig(kioskId: string): Promise<WidgetConfig> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('widget_configs').select('*').eq('kiosk_id', kioskId).maybeSingle();
      if (data) return data as WidgetConfig;
    }
    return loadFromStorage<WidgetConfig>(STORE_KEY_WIDGET, SEED_WIDGET);
  },

  async updateWidgetConfig(patch: Partial<WidgetConfig>): Promise<WidgetConfig> {
    const current = await this.getWidgetConfig(patch.kiosk_id || SEED_KIOSK.id);
    const updated = { ...current, ...patch };
    if (isSupabaseConfigured && current.id) {
      await supabase.from('widget_configs').update(patch).eq('id', current.id);
    }
    saveToStorage(STORE_KEY_WIDGET, updated);
    return updated;
  },

  async getTransactions(kioskId: string): Promise<EscrowTransaction[]> {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('escrow_transactions').select('*').eq('kiosk_id', kioskId).order('created_at', { ascending: false }).limit(20);
      if (data) return data as EscrowTransaction[];
    }
    return loadFromStorage<EscrowTransaction[]>(STORE_KEY_TXS, []);
  },

  async recordTransaction(tx: Omit<EscrowTransaction, 'id' | 'created_at'>): Promise<EscrowTransaction> {
    const newTx: EscrowTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      await supabase.from('escrow_transactions').insert(tx);
    }
    const all = await this.getTransactions(tx.kiosk_id);
    const updated = [newTx, ...all];
    saveToStorage(STORE_KEY_TXS, updated);
    return newTx;
  },
};
