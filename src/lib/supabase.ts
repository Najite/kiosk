import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
