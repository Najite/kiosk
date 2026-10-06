# StellarKiosk 🏛️

> A composable, non-custodial digital asset kiosk and policy engine for the Stellar & Soroban ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.org)
[![Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20v21-purple.svg)](https://soroban.stellar.org)
[![Settlement](https://img.shields.io/badge/Settlement-Atomic%20On--Chain%20Escrow-cyan.svg)](https://soroban.stellar.org)
[![Zero-Config](https://img.shields.io/badge/Zero--Config-No%20.env%20Required-emerald.svg)](https://stellar.expert)

---

## 📌 Executive Summary

Traditional Web3 commerce models force creators and developers into a custody compromise: to list or sell an asset, you must transfer custody to a third-party marketplace contract. If the marketplace is paused, compromised, or enforces zero royalties, creators lose both sovereignty and revenue.

**StellarKiosk** brings the **Kiosk Commerce Primitive** to Stellar and Soroban. Assets remain protected in a non-custodial kiosk vault, governed by modular on-chain **Transfer Policies** (guaranteed creator royalties, multi-recipient upstream revenue splits, floor prices, and timelocked escrows). When a purchase occurs, the Soroban smart contract atomically splits payments across the seller, creator, and upstream protocol treasuries in a single ledger transaction.

The project runs as a **100% decentralized Web3 protocol** on Stellar Testnet with **zero centralized backends or databases** (no Supabase, Firebase, or external API keys). The Stellar ledger and Soroban instance storage serve as the single source of truth.

---

## 🌐 Live On-Chain Testnet Deployment

| Parameter | Value |
| :--- | :--- |
| **Network** | Stellar Testnet (`Passphrase: Test SDF Network ; September 2015`) |
| **Showcase Kiosk Contract ID** | [`CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB`](https://stellar.expert/explorer/testnet/contract/CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB) |
| **WASM Hash** | `b6b584e187732e5d66807bc993d0c15feae17e22d33bd100897735ad70a9585a` |
| **Native SAC (XLM)** | [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Protocol Treasury** | `GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO` |
| **Soroban RPC Endpoint** | `https://soroban-testnet.stellar.org` |
| **Horizon RPC Endpoint** | `https://horizon-testnet.stellar.org` |

---

## 🏛️ Core Protocol Architecture

```
                    ┌────────────────────────┐
                    │     Freighter Wallet   │
                    └───────────┬────────────┘
                                │ Signs Transaction
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               Soroban Smart Contract (KioskContract)            │
│                 CB3AQGQ6...367CLQQB (Testnet)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Buyer Authorization: buyer.require_auth()                   │
│  2. Policy Validation: floor price & listed status checks       │
│  3. Atomic Payment Distribution via Stellar Asset Contract:     │
│     ├── Net Payout (90%)      ───► Seller                       │
│     ├── Creator Royalty (7.5%) ──► Royalty Recipient            │
│     └── Upstream Split (2.5%) ───► Protocol Treasury            │
│  4. State Transition: item.is_listed = false                    │
│  5. Event Emitted: (KIOSK, "bought", [item_id, buyer, price])   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Features & Modules

### 1. 🏠 Interactive Landing Page
* **Value Proposition:** Interactive comparison between traditional custody vs. the non-custodial Kiosk standard.
* **Architecture Flowchart:** Dynamic step-by-step visualization of buyer, seller, policy engine, and atomic settlement.
* **Interactive Checkout Sandbox:** Live checkout preview allowing users to inspect split calculations before buying.

### 2. 🏛️ Kiosk Manager (`KioskManager`)
* **Non-Custodial Vault:** Mint, list, or delist digital assets (Developer Passes, API Licenses, Badges, Collectibles).
* **On-Chain Listing:** Automatically calls `place_and_list` on Soroban with asset metadata (title, description, asset type, price).
* **Real-time Status Tracking:** Track asset status (`AVAILABLE`, `IN_ESCROW`, `SETTLED`).

### 3. 🛡️ Transfer Policy Engine (`PolicyEngine`)
* **Creator Royalty Enforcement:** Set minimum royalty percentages in basis points (e.g., `750 bps = 7.5%`).
* **Multi-Recipient Upstream Splits:** Configure atomic payouts for protocol treasuries, ecosystem DAOs, or affiliate partners (e.g., `250 bps = 2.5%`).
* **Floor Price Enforcement:** Prevents listing or purchasing below the minimum threshold on-chain.
* **Escrow Modes:** Supports `INSTANT` atomic settlements and `TIMELOCKED` dispute periods.

### 4. 🛒 Live Soroban Marketplace (`Marketplace`)
* **Live Catalog:** Fetches active listings directly from the deployed Soroban contract.
* **Multi-Step Atomic Checkout:**
  1. **Review:** Inspect price breakdown, seller payout, royalty fee, and upstream splits.
  2. **Sign:** Request transaction signature from Freighter.
  3. **Settle:** Submit atomic transaction envelope to Soroban Testnet RPC.
  4. **Receipt:** View real-time settlement status with direct clickable links to [StellarExpert Explorer](https://stellar.expert).
* **Zero Hardcoded Accounts:** Reads wallet addresses dynamically from the connected Freighter session.

### 5. 🧩 Embeddable Checkout Widget (`WidgetCustomizer`)
* **Customizer Interface:** Live preview with custom dark/light themes, accent colors, and custom button text.
* **Drop-in Embed Code:** Generates copy-paste code for:
  * **React Component:** `@stellarkiosk/widget`
  * **HTML Web Component:** `<stellar-kiosk-button>`
  * **Iframe Embed:** Standalone hosted iframe snippet.

---

## 🦀 Soroban Smart Contract Reference (`contracts/kiosk`)

The Rust smart contract implements the following entry points:

```rust
// Initialize kiosk with owner, royalty policy, and upstream split recipients
pub fn initialize(
    env: Env,
    owner: Address,
    royalty_bps: u32,
    royalty_recipient: Address,
    min_floor_price: i128,
    upstream_splits: Vec<UpstreamSplit>,
) -> Result<(), KioskError>;

// Update transfer policy with caller authentication
pub fn set_policy(
    env: Env,
    caller: Address,
    royalty_bps: u32,
    royalty_recipient: Address,
    min_floor_price: i128,
    upstream_splits: Vec<UpstreamSplit>,
) -> Result<(), KioskError>;

// Place and list asset into persistent storage with metadata
pub fn place_and_list(
    env: Env,
    seller: Address,
    title: String,
    description: String,
    asset_type: String,
    price: i128,
) -> Result<u32, KioskError>;

// Delist an item (requires seller auth)
pub fn delist(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError>;

// Atomically execute purchase, payouts, royalties, and upstream splits
pub fn purchase(
    env: Env,
    buyer: Address,
    item_id: u32,
    payment_token: Address,
) -> Result<(), KioskError>;

// Read-only getters
pub fn get_policy(env: Env) -> Result<TransferPolicy, KioskError>;
pub fn get_item(env: Env, item_id: u32) -> Result<ListingItem, KioskError>;
pub fn get_item_count(env: Env) -> u32;
pub fn get_owner(env: Env) -> Result<Address, KioskError>;
```

---

## 🛠️ Tech Stack & Tooling

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Smart Contract** | Rust (`soroban-sdk`) | `21.7.7` |
| **Target Architecture** | WebAssembly | `wasm32v1-none` |
| **Frontend Framework** | React + TypeScript + Vite | `18.3.1` / `5.4.2` |
| **Styling** | Tailwind CSS + Lucide Icons | `3.4.1` |
| **Stellar SDK** | `@stellar/stellar-sdk` | `17.2.1` |
| **Wallet Connector** | `@stellar/freighter-api` | `6.0.1` |
| **Unit & Integration Tests**| Vitest + Testing Library | `2.1.8` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or later
- **npm** or **pnpm**
- **Freighter Wallet Extension** configured to **Testnet**
- *(Optional for contract development)*: **Rust** with `wasm32-unknown-unknown` and `stellar-cli`

### 1. Clone & Run (Zero-Config Out of the Box)

No `.env` file or API keys are required. All network configurations and Stellar Asset Contract addresses are derived deterministically in-code.

```bash
git clone https://github.com/Najite/kiosk.git
cd kiosk

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build & Test

```bash
# Run unit & integration tests
npx vitest run

# Typecheck and build production bundle
npm run build
```

### 3. Build Soroban Smart Contracts (Rust)

```bash
# Compile contract WASM
cargo build --target wasm32-unknown-unknown --release

# Run Rust unit tests
cargo test -p kiosk
```

---

## 🔒 Security & Verification Guarantees

1. **Non-Custodial Invariants:** Digital assets are never entrusted to an intermediary third party; only the atomic settlement condition defined by the policy can unlock or transfer items.
2. **Atomic Upstream Splits:** Upstream recipients (e.g. Protocol Treasury) receive their programmed share in the exact same transaction envelope as the seller and creator. If any transfer fails, the entire transaction reverts.
3. **No Hardcoded Accounts:** All signatures and transactions dynamically identify the connected Freighter account.
4. **Deterministic Token Standards:** Native Stellar Asset Contract (SAC) addresses for Testnet and Mainnet are derived automatically from the network rather than brittle environment configurations.
5. **On-Chain Event Verification:** All listing and purchase actions emit standard Soroban events `(KIOSK, "listed")` and `(KIOSK, "bought")` indexed on Stellar block explorers.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
