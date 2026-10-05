/*
# StellarKiosk Protocol Schema

## Overview
Creates the core data model for the StellarKiosk decentralized commerce and escrow protocol dashboard.
This is a single-tenant app (no auth/sign-in screen) — all data is intentionally shared and editable
through the dashboard for demonstration and SCF grant review purposes.

## New Tables

1. `kiosks` — A Kiosk is a Soroban smart contract escrow that holds digital items.
   - id (uuid, PK)
   - owner_address (text) — Stellar public key (G...) of the kiosk owner
   - name (text) — display name of the kiosk
   - description (text)
   - settlement_token (text) — 'XLM' or 'USDC'
   - is_initialized (boolean) — whether the Soroban contract has been initialized
   - contract_id (text) — simulated Soroban contract ID
   - total_sales_volume (numeric) — cumulative sales in settlement token
   - created_at (timestamptz)

2. `kiosk_items` — Digital assets listed inside a kiosk.
   - id (uuid, PK)
   - kiosk_id (uuid, FK -> kiosks)
   - title (text)
   - description (text)
   - asset_type (text) — 'License', 'Pass', 'Token', 'Collectible'
   - price (numeric) — base price in settlement token units
   - icon (text) — lucide icon name for visual representation
   - status (text) — 'AVAILABLE', 'IN_ESCROW', 'SETTLED'
   - created_at (timestamptz)

3. `transfer_policies` — Composable transfer policy attached to a kiosk item.
   - id (uuid, PK)
   - item_id (uuid, FK -> kiosk_items)
   - min_royalty_bps (integer) — basis points for creator royalty (e.g. 1000 = 10%)
   - upstream_split_bps (integer) — basis points for upstream dependency split
   - upstream_recipients (jsonb) — array of { label, address, shareBps }
   - timelock_seconds (integer) — escrow timelock duration
   - escrow_mode (text) — 'INSTANT', 'TIMELOCK', 'MULTISIG'
   - created_at (timestamptz)

4. `escrow_transactions` — Records of buyer checkout / escrow settlement events.
   - id (uuid, PK)
   - kiosk_id (uuid, FK -> kiosks)
   - item_id (uuid, FK -> kiosk_items)
   - buyer_address (text)
   - seller_address (text)
   - amount (numeric) — total amount paid
   - seller_payout (numeric)
   - royalty_payout (numeric)
   - upstream_payout (numeric)
   - tx_hash (text) — simulated Stellar transaction hash
   - ledger_timestamp (timestamptz)
   - status (text) — 'PENDING', 'SETTLED', 'RELEASED'
   - created_at (timestamptz)

5. `widget_configs` — Embeddable web widget customization for a kiosk.
   - id (uuid, PK)
   - kiosk_id (uuid, FK -> kiosks)
   - theme (text) — 'dark' or 'light'
   - accent_color (text) — hex color
   - button_text (text)
   - show_preview (boolean)
   - border_radius (integer) — px
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD (single-tenant, no-auth, intentionally shared data).
*/

CREATE TABLE IF NOT EXISTS kiosks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_address text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  settlement_token text NOT NULL DEFAULT 'XLM',
  is_initialized boolean NOT NULL DEFAULT false,
  contract_id text DEFAULT '',
  total_sales_volume numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kiosk_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_id uuid NOT NULL REFERENCES kiosks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  asset_type text NOT NULL DEFAULT 'License',
  price numeric NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT 'Package',
  status text NOT NULL DEFAULT 'AVAILABLE',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transfer_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES kiosk_items(id) ON DELETE CASCADE,
  min_royalty_bps integer NOT NULL DEFAULT 0,
  upstream_split_bps integer NOT NULL DEFAULT 0,
  upstream_recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  timelock_seconds integer NOT NULL DEFAULT 0,
  escrow_mode text NOT NULL DEFAULT 'INSTANT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_id uuid NOT NULL REFERENCES kiosks(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES kiosk_items(id) ON DELETE CASCADE,
  buyer_address text NOT NULL,
  seller_address text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  seller_payout numeric NOT NULL DEFAULT 0,
  royalty_payout numeric NOT NULL DEFAULT 0,
  upstream_payout numeric NOT NULL DEFAULT 0,
  tx_hash text NOT NULL DEFAULT '',
  ledger_timestamp timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'SETTLED',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS widget_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kiosk_id uuid NOT NULL REFERENCES kiosks(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'dark',
  accent_color text NOT NULL DEFAULT '#00E5FF',
  button_text text NOT NULL DEFAULT 'Buy via StellarKiosk',
  show_preview boolean NOT NULL DEFAULT true,
  border_radius integer NOT NULL DEFAULT 12,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kiosks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosk_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

-- kiosks policies
DROP POLICY IF EXISTS "anon_select_kiosks" ON kiosks;
CREATE POLICY "anon_select_kiosks" ON kiosks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_kiosks" ON kiosks;
CREATE POLICY "anon_insert_kiosks" ON kiosks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_kiosks" ON kiosks;
CREATE POLICY "anon_update_kiosks" ON kiosks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_kiosks" ON kiosks;
CREATE POLICY "anon_delete_kiosks" ON kiosks FOR DELETE TO anon, authenticated USING (true);

-- kiosk_items policies
DROP POLICY IF EXISTS "anon_select_items" ON kiosk_items;
CREATE POLICY "anon_select_items" ON kiosk_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_items" ON kiosk_items;
CREATE POLICY "anon_insert_items" ON kiosk_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_items" ON kiosk_items;
CREATE POLICY "anon_update_items" ON kiosk_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_items" ON kiosk_items;
CREATE POLICY "anon_delete_items" ON kiosk_items FOR DELETE TO anon, authenticated USING (true);

-- transfer_policies policies
DROP POLICY IF EXISTS "anon_select_policies" ON transfer_policies;
CREATE POLICY "anon_select_policies" ON transfer_policies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_policies" ON transfer_policies;
CREATE POLICY "anon_insert_policies" ON transfer_policies FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_policies" ON transfer_policies;
CREATE POLICY "anon_update_policies" ON transfer_policies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_policies" ON transfer_policies;
CREATE POLICY "anon_delete_policies" ON transfer_policies FOR DELETE TO anon, authenticated USING (true);

-- escrow_transactions policies
DROP POLICY IF EXISTS "anon_select_tx" ON escrow_transactions;
CREATE POLICY "anon_select_tx" ON escrow_transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tx" ON escrow_transactions;
CREATE POLICY "anon_insert_tx" ON escrow_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tx" ON escrow_transactions;
CREATE POLICY "anon_update_tx" ON escrow_transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tx" ON escrow_transactions;
CREATE POLICY "anon_delete_tx" ON escrow_transactions FOR DELETE TO anon, authenticated USING (true);

-- widget_configs policies
DROP POLICY IF EXISTS "anon_select_widgets" ON widget_configs;
CREATE POLICY "anon_select_widgets" ON widget_configs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_widgets" ON widget_configs;
CREATE POLICY "anon_insert_widgets" ON widget_configs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_widgets" ON widget_configs;
CREATE POLICY "anon_update_widgets" ON widget_configs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_widgets" ON widget_configs;
CREATE POLICY "anon_delete_widgets" ON widget_configs FOR DELETE TO anon, authenticated USING (true);

-- Seed a demo kiosk with items, policy, widget config, and transactions
INSERT INTO kiosks (owner_address, name, description, settlement_token, is_initialized, contract_id, total_sales_volume)
SELECT 'GDMX7A2QZ54V4QBTQRMZKAY3UGZ7JZ5YGP7ZU4F4ZZJ7K3KQM4X6Q3AL', 'StellarForge DevKiosk', 'Composable escrow kiosk for open-source software licenses and digital passes on Soroban.', 'XLM', true, 'CA3D5KRYM6CB7EFQKPTX3X4D5J7YZKQXKL5Q6Q3HOKFD4A2JFZ4S2C5Y', 4850
WHERE NOT EXISTS (SELECT 1 FROM kiosks WHERE name = 'StellarForge DevKiosk');