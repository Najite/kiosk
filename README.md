# StellarKiosk

> Composable Escrow & Digital Asset Protocol on the Stellar Network and Soroban smart contract ecosystem.

StellarKiosk ports Sui's flagship **Kiosk** architecture to Stellar/Soroban — providing open-source maintainers and dApp developers with composable on-chain escrows, programmable transfer policies (royalties, dependency revenue splits, time-locks), and an embeddable web widget for seamless web2/web3 commerce.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Views & Screens](#views--screens)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Building the Embeddable Widget](#building-the-embeddable-widget)
- [Stellar Community Fund](#stellar-community-fund)
- [License](#license)

---

## Overview

The Stellar ecosystem lacks a composable, developer-friendly on-chain commerce layer. While Sui revolutionized decentralized commerce with Kiosk — providing escrow accounts that enforce transfer policies without opaque custodial contracts — Stellar developers have no equivalent. StellarKiosk fills this gap.

### What It Does

StellarKiosk allows any developer or open-source maintainer on Stellar to:

1. **Deploy / Initialize a Kiosk** — A Soroban smart contract escrow that holds digital items (software licenses, passes, compute vouchers, digital collectibles).
2. **Define Composable Transfer Policies** — Set minimum prices in XLM/USDC, enforce creator royalties, and set automated dependency splits (e.g. 5% forwarded to upstream open-source crates).
3. **Generate Embeddable Web Checkout** — A sleek checkout button and modal that works with Freighter wallet, Albedo, or testnet keypairs.
4. **Manage Orders & Escrows** — Real-time inspection of active listings, locked escrows, completed transfers, and royalty payouts.

### Target Audience

- Soroban dApp builders
- Open-source maintainers selling software licenses or support tiers
- Web3 artists and digital collectible creators
- The Stellar Community Fund review committee

---

## Key Features

### Composable Transfer Policies

Set minimum prices, enforce creator royalties (in basis points), and configure automated upstream dependency revenue splits. All policies are validated on-chain via Soroban smart contracts — no custom contract code required.

### Upstream Dependency Drips

Every sale automatically routes a percentage to upstream open-source crates and libraries. This brings Drips-style dependency splitting into the Kiosk policy engine, creating a standout value proposition for funding open-source sustainably.

### Three Escrow Release Modes

| Mode | Description |
|------|-------------|
| **Instant** | Funds settle immediately upon transaction confirmation |
| **Timelock** | Funds locked for a configurable duration (1h–7d) before release |
| **Multi-sig** | Funds require multi-sig confirmation to release |

### Embeddable Web Widget

A self-contained, themeable Web Component (`<stellar-kiosk-button>`) that runs inside an iframe or native React/HTML page without external bundler lock-in. Works on Docusaurus, Next.js, or static GitHub Pages sites in under 60 seconds.

Three embed variants are generated:
- **React Component** — `<StellarKioskButton />` import
- **HTML Web Component** — `<stellar-kiosk-button>` custom element
- **iframe Embed** — drop-in `<iframe>` with hosted checkout

### Multi-Wallet Support

Built for Freighter, Albedo, and testnet keypairs. Buyers sign a single atomic transaction — funds split in real time to seller, creator, and upstream recipients at settlement.

### XLM & USDC Settlement

Native Stellar Lumens (XLM) or Stellar USDC as settlement tokens. Switch per-kiosk with a single click. Stellar's low transaction fees (~0.00001 XLM) make micro-sales and micro-royalties economically viable.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        StellarKiosk Protocol                           │
├────────────────────────────────────────────────────────────────────────┤
│  Landing Page → Top Navigation (Brand — View Switcher — Wallet)        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────┐  ┌────────────────────────────────────┐   │
│   │   Kiosk Manager        │  │    Policy & Royalty Engine         │   │
│   │   • Personal Kiosk ID  │  │    • Base Price (XLM/USDC)         │   │
│   │   • Stored Assets      │  │    • Creator Royalties             │   │
│   │   • Active Escrows     │  │    • Upstream Dependency Splitting │   │
│   └───────────┬────────────┘  └─────────────────┬──────────────────┘   │
│               │                                 │                      │
│               ▼                                 ▼                      │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               Interactive Embeddable Web Widget                │   │
│   │       • Live Preview Sandbox · Code Generator (React/HTML)     │   │
│   │       • Atomic Checkout Flow (Wallet Sign ──> Escrow Release)  │   │
│   └───────────────────────────┬────────────────────────────────────┘   │
│                               │                                        │
│   ┌───────────────────────────┴────────────────────────────────────┐   │
│   │   Stellar Community Fund (SCF) Grant Proposal & Documentation  │   │
│   │   • Architecture Specs · Soroban Rust Interfaces · Roadmap     │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Layers

**Layer 1: Soroban Smart Contracts (Rust)**
- Kiosk escrow contract with atomic fund splitting
- Transfer policy engine with on-chain validation
- Cross-contract calls for royalty distribution

**Layer 2: TypeScript SDK + Dashboard**
- Deterministic in-browser escrow simulator
- Real Stellar Testnet Horizon/RPC connectivity
- Supabase-backed state persistence

**Layer 3: Embeddable Web Widget**
- Zero-dependency Web Component (`<stellar-kiosk-button>`)
- React/HTML/iframe embed variants
- Freighter + Albedo wallet integration

### Data Persistence

Off-chain metadata (kiosk names, descriptions, widget configs, transaction records) is stored in **Supabase** (PostgreSQL). All financial state and ownership logic is designed to live on-chain in Soroban contracts. The current dashboard prototype uses Supabase for the full state while the production Soroban contracts are under development.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans + JetBrains Mono |
| Database / Backend | Supabase (PostgreSQL + RLS) |
| Smart Contracts | Soroban (Rust) — in development |
| Wallet Integration | Freighter / Albedo (simulated in prototype) |
| Design System | Custom dark fintech (obsidian + electric cyan) |

---

## Project Structure

```
project/
├── src/
│   ├── App.tsx                      # Root component — routes between landing & dashboard
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Global styles, Tailwind directives, custom CSS
│   ├── components/
│   │   ├── TopBar.tsx               # Dashboard top bar (brand, view switcher, wallet, network)
│   │   └── ui.tsx                   # Shared UI primitives (Badge, Button, Modal, Panel, etc.)
│   ├── context/
│   │   └── WalletContext.tsx        # Simulated Stellar wallet provider
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client + TypeScript types
│   │   └── stellar.ts               # Stellar address/tx simulation + payout calculations
│   └── views/
│       ├── LandingPage.tsx          # Marketing landing page
│       ├── KioskManager.tsx         # Kiosk identity, assets, initialization
│       ├── PolicyEngine.tsx         # Transfer policy & royalty configuration
│       ├── WidgetCustomizer.tsx     # Embeddable widget visual editor + code gen
│       ├── Marketplace.tsx          # Live marketplace + buyer checkout flow
│       └── GrantProposal.tsx        # SCF grant application export
├── supabase/
│   └── migrations/
│       └── 20261005125129_create_stellarkiosk_schema.sql
├── tailwind.config.js               # Theme: colors, fonts, animations
├── vite.config.ts                   # Vite config with @/ path alias
├── package.json
└── README.md
```

---

## Database Schema

Five tables with Row Level Security enabled on all of them. The app is single-tenant (no auth screen), so policies allow `anon` + `authenticated` full CRUD — the data is intentionally shared for demonstration and SCF review.

### `kiosks`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Kiosk unique ID |
| `owner_address` | text | Stellar public key (G...) of the kiosk owner |
| `name` | text | Display name |
| `description` | text | Kiosk description |
| `settlement_token` | text | `'XLM'` or `'USDC'` |
| `is_initialized` | boolean | Whether the Soroban contract has been initialized |
| `contract_id` | text | Simulated Soroban contract ID |
| `total_sales_volume` | numeric | Cumulative sales in settlement token |
| `created_at` | timestamptz | Creation timestamp |

### `kiosk_items`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Item unique ID |
| `kiosk_id` | uuid (FK) | References `kiosks(id)` |
| `title` | text | Asset title |
| `description` | text | Asset description |
| `asset_type` | text | `'License'`, `'Pass'`, `'Token'`, `'Collectible'` |
| `price` | numeric | Base price in settlement token units |
| `icon` | text | Lucide icon name for visual representation |
| `status` | text | `'AVAILABLE'`, `'IN_ESCROW'`, `'SETTLED'` |
| `created_at` | timestamptz | Creation timestamp |

### `transfer_policies`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Policy unique ID |
| `item_id` | uuid (FK) | References `kiosk_items(id)` |
| `min_royalty_bps` | integer | Creator royalty in basis points (1000 = 10%) |
| `upstream_split_bps` | integer | Upstream dependency split in basis points |
| `upstream_recipients` | jsonb | Array of `{ label, address, shareBps }` |
| `timelock_seconds` | integer | Escrow timelock duration |
| `escrow_mode` | text | `'INSTANT'`, `'TIMELOCK'`, `'MULTISIG'` |
| `created_at` | timestamptz | Creation timestamp |

### `escrow_transactions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Transaction unique ID |
| `kiosk_id` | uuid (FK) | References `kiosks(id)` |
| `item_id` | uuid (FK) | References `kiosk_items(id)` |
| `buyer_address` | text | Buyer's Stellar address |
| `seller_address` | text | Seller's Stellar address |
| `amount` | numeric | Total amount paid |
| `seller_payout` | numeric | Amount routed to seller |
| `royalty_payout` | numeric | Amount routed to creator royalty |
| `upstream_payout` | numeric | Amount routed to upstream recipients |
| `tx_hash` | text | Simulated Stellar transaction hash |
| `ledger_timestamp` | timestamptz | Ledger close time |
| `status` | text | `'PENDING'`, `'SETTLED'`, `'RELEASED'` |
| `created_at` | timestamptz | Creation timestamp |

### `widget_configs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Config unique ID |
| `kiosk_id` | uuid (FK) | References `kiosks(id)` |
| `theme` | text | `'dark'` or `'light'` |
| `accent_color` | text | Hex color string |
| `button_text` | text | Checkout button label |
| `show_preview` | boolean | Whether to show asset preview in widget |
| `border_radius` | integer | Button border radius in px |
| `created_at` | timestamptz | Creation timestamp |

### Seed Data

The migration pre-seeds a demo kiosk (`StellarForge DevKiosk`) with:
- 3 listed items (a software license, a developer pass, and a compute voucher)
- 1 configured transfer policy (10% royalty, 15% upstream split, 24h timelock)
- 1 widget config (dark theme, cyan accent)
- 1 settled transaction

---

## Views & Screens

### Landing Page

A full marketing page that introduces the protocol before entering the dashboard. Includes:
- **Hero** with animated Soroban escrow terminal mockup and live fund-split visualization
- **Trust bar** with scrolling technology ticker
- **Protocol diagram** showing the Kiosk architecture with animated connections
- **Features grid** — six capability cards
- **How it works** — four-step flow (initialize → configure → embed → settle)
- **Comparison table** — Sui Kiosk vs. StellarKiosk
- **Interactive widget demo** — live customizer with code generation
- **Ecosystem stats** and dashboard view cards
- **CTA** and footer

### 1. Kiosk Manager

View your Soroban Kiosk identity, deploy/initialize the contract, list new digital assets (licenses, passes, tokens, collectibles), and track sales volume with live stat cards. Copy the contract ID, manage items, and see real-time status indicators.

### 2. Escrow Policies

A composable policy engine where you select an asset and configure:
- **Creator royalty** (0–25% via slider, displayed in basis points)
- **Upstream dependency split** (0–30% via slider)
- **Upstream recipients** — add multiple Stellar addresses with individual share allocations
- **Escrow release mode** — Instant, Timelock (1h–7d slider), or Multi-sig
- **Live payout simulation** — see exactly how funds split on a purchase

### 3. Embed Widget

A visual customizer for the embeddable checkout button:
- **Theme** — dark or light
- **Accent color** — color picker + preset swatches
- **Button text** — custom label
- **Border radius** — 0–24px slider
- **Asset preview toggle** — show/hide item thumbnail in widget
- **Live preview** — real-time button rendering with desktop/mobile views
- **Code generator** — production-ready React, HTML Web Component, and iframe snippets with copy-to-clipboard

### 4. Live Marketplace

Browse all listed assets with policy tags and status indicators. Execute a full buyer checkout flow:
- Click **Buy** on any available item
- Review the atomic fund split breakdown (seller, royalty, upstream)
- See the escrow mode notice (instant / timelock / multi-sig)
- Connect wallet (simulated Freighter session)
- Sign → Settle → Success confirmation with transaction hash
- View the real-time escrow transaction ledger with full payout details

### 5. SCF Grant Proposal

A structured, publication-ready Stellar Community Fund grant application with six sections:
- **Problem & Overview** — the gap StellarKiosk fills
- **Soroban Architecture** — smart contract Rust interfaces
- **Competitive Analysis** — Sui vs. StellarKiosk feature matrix
- **Implementation Roadmap** — 12-week, 6-milestone delivery plan
- **Funding Budget** — 45,000 XLM across 6 categories
- **Open Source & License** — MIT licensing, repo structure, team

All sections are exportable to clipboard with a single click.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (already provisioned in the Bolt environment)

### Environment Variables

The following are pre-populated in the Bolt environment. If running locally outside Bolt, set them in a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Preview the production build
npm run preview
```

The app runs on Vite's default dev server. The Supabase database connection is automatic — no manual configuration needed in the Bolt environment.

---

## Building the Embeddable Widget

The widget customizer in the dashboard generates three embed variants:

### React Component

```tsx
import { StellarKioskButton } from '@stellarkiosk/widget';

export default function DocsPage() {
  return (
    <StellarKioskButton
      kioskId="kx7f2a..."
      itemId="im3b9c..."
      theme="dark"
      accentColor="#00E5FF"
      buttonText="Buy via StellarKiosk"
      borderRadius={12}
      showPreview={true}
    />
  );
}
```

### HTML Web Component

```html
<script src="https://cdn.stellarkiosk.io/widget.js"></script>
<stellar-kiosk-button
  kiosk-id="kx7f2a..."
  item-id="im3b9c..."
  theme="dark"
  accent-color="#00E5FF"
  button-text="Buy via StellarKiosk"
  border-radius="12"
  show-preview
></stellar-kiosk-button>
```

### iframe Embed

```html
<iframe
  src="https://widget.stellarkiosk.io/embed?kiosk=kx7f2a...&item=im3b9c...&theme=dark&accent=%2300E5FF"
  width="100%"
  height="120"
  frameborder="0"
  style="border:none; border-radius:12px;"
></iframe>
```

---

## Stellar Community Fund

StellarKiosk is designed specifically for the **Stellar Community Fund (SCF) Season 23**. The in-app SCF Grant Proposal view provides a complete, exportable grant application including:

- **Problem statement** — the lack of a composable commerce layer on Stellar
- **Soroban architecture** — Rust contract interfaces for Kiosk and TransferPolicy
- **Competitive analysis** — Sui Kiosk vs. StellarKiosk feature matrix
- **12-week roadmap** — 6 milestones with deliverables and budget allocations
- **Budget** — 45,000 XLM total across development, audit, widget, docs, and community
- **Open source** — MIT licensed, fully open repository structure

### Soroban Contract Interfaces (Planned)

```rust
// kiosk.rs — Core Kiosk escrow contract
pub trait KioskTrait {
    fn initialize(env: Env, owner: Address, name: String, settlement_token: Token) -> Kiosk;
    fn list_item(env: Env, kiosk_id: BytesN<32>, item: Item) -> ItemId;
    fn purchase(env: Env, kiosk_id: BytesN<32>, item_id: ItemId, buyer: Address) -> EscrowTx;
    fn release_escrow(env: Env, escrow_id: BytesN<32>) -> void;
}

// transfer_policy.rs — Composable policy engine
pub trait TransferPolicyTrait {
    fn set_policy(env: Env, item_id: ItemId, policy: TransferPolicy) -> void;
    fn validate_transfer(env: Env, item_id: ItemId, amount: i128) -> PayoutSplit;
    fn distribute_funds(env: Env, tx: EscrowTx, split: PayoutSplit) -> void;
}

pub struct TransferPolicy {
    min_royalty_bps: u32,
    upstream_split_bps: u32,
    upstream_recipients: Vec<Recipient>,
    timelock_seconds: u32,
    escrow_mode: EscrowMode,
}
```

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Obsidian | `#0A0D14` | Background canvas |
| Obsidian Light | `#0E121B` | Elevated surfaces |
| Slate Panel | `#111827` | Cards & panels |
| Cyan | `#00E5FF` | Primary accent, Stellar electric cyan |
| Cyan Dim | `#38BDF8` | Hover states |
| Emerald | `#10B981` | Escrow & success states |
| Amber | `#F59E0B` | Timelock & notice states |
| Rose | `#F43F5E` | Error & danger states |

### Typography

- **Brand & Navigation:** Plus Jakarta Sans (400, 500, 600, 700, 800)
- **Values, Stellar Public Keys, Code:** JetBrains Mono with `tabular-nums` (400, 500, 600, 700)

### Spacing & Layout

- 8px spacing system
- Max content width: `max-w-7xl` (1280px)
- Hairline borders: `rgba(255,255,255,0.08)`
- Responsive breakpoints: mobile-first, with `sm`, `md`, `lg` breakpoints

---

## License

MIT License. All StellarKiosk code — Soroban contracts, TypeScript SDK, dashboard, and web widget — is open-sourced under MIT.

---

*Built for the Stellar Community Fund · Season 23*
