# StellarKiosk 🏛️

> **Autonomous On-Chain Asset Vault & Policy Engine on Stellar & Soroban**  
> Non-custodial kiosk standard enforcing creator royalties, multi-recipient upstream revenue splits, floor prices, and atomic settlement escrow.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.org)
[![Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20v21-purple.svg)](https://soroban.stellar.org)
[![Settlement](https://img.shields.io/badge/Settlement-Atomic%20On--Chain%20Escrow-cyan.svg)](https://soroban.stellar.org)
[![Zero-Config](https://img.shields.io/badge/Zero--Config-No%20.env%20Required-emerald.svg)](https://stellar.expert)

---

## 📌 Executive Summary

Traditional Web3 digital commerce forces creators and platforms into a custodial compromise: to list or monetize an asset, creators must surrender ownership to centralized or opaque marketplace contracts. If the intermediary halts operations, gets exploited, or ignores royalty standards, creators lose both custody and revenue.

**StellarKiosk** adapts the **Kiosk Commerce Primitive** to Stellar and Soroban. Assets remain protected in a sovereign on-chain vault, governed by modular **Transfer Policies**:
- **Creator Royalties:** Guaranteed basis-point enforcement on every sale.
- **Upstream Splits:** Multi-recipient revenue routing (e.g., protocol treasuries, ecosystem DAOs, affiliate partners).
- **Floor Price Guardrails:** Programmatic minimum prices preventing undervaluation exploits.
- **Atomic Settlement Escrow:** Payments and payouts execute simultaneously in a single transaction envelope—if any payment leg fails, the entire transaction reverts.

The protocol operates as a **100% decentralized Web3 system** directly against Stellar Testnet with **zero centralized backends or databases** (no Supabase, Firebase, or private API keys). The Stellar ledger and Soroban persistent instance storage serve as the single source of truth.

---

## 🌐 Live On-Chain Testnet Deployment

| Parameter | Value |
| :--- | :--- |
| **Network** | Stellar Testnet (`Passphrase: Test SDF Network ; September 2015`) |
| **Showcase Kiosk Contract ID** | [`CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R`](https://stellar.expert/explorer/testnet/contract/CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R) |
| **WASM Hash** | `9cb249d2d00ab4fa84af0dc096a7504988d00b0649fa142bd82cd84e91f29e52` |
| **Native SAC (XLM)** | [`CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Protocol Treasury** | `GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO` |
| **Soroban RPC Endpoint** | `https://soroban-testnet.stellar.org` |
| **Horizon RPC Endpoint** | `https://horizon-testnet.stellar.org` |

---

## 🏛️ Core Protocol Architecture & Atomic Escrow

```
                    ┌────────────────────────┐
                    │     Freighter Wallet   │
                    └───────────┬────────────┘
                                │ Signs Invocation
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               Soroban Smart Contract (KioskContract)            │
│                 CDRKM3ZZ...SI224T4R (Testnet)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Buyer Authorization: buyer.require_auth()                   │
│  2. Policy Validation: is_listed == true && price >= floor      │
│  3. Bound Payment Routing via Stellar Asset Contract (SAC):    │
│     ├── Seller Net Payout (Net %)    ───► Seller Wallet         │
│     ├── Creator Royalty (BPS %)      ───► Royalty Recipient     │
│     └── Upstream Protocol Split (%)  ───► Protocol Treasury    │
│  4. Custody Settlement: Contract Transfers Escrowed Asset       │
│     └── token::Client::transfer(Contract ──► Buyer, amount)    │
│  5. State Transition: item.is_listed = false, status = Sold     │
│  6. Event Emitted: (KIOSK, "bought", [item_id, buyer, price])   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sui Kiosk Functional Equivalence & Stellar Semantics
- **Non-Custodial Escrow Vault:** Like Sui Kiosk, assets deposited via `place()` enter the contract vault custody. Sellers retain full ownership and can withdraw placed items at any time via `withdraw()`, provided they are unlisted.
- **Creator Transfer Policies:** Collections register customizable `TransferPolicy` rules specifying royalty basis points, payout addresses, and floor prices.
- **Bound Payment Security:** To prevent token arbitrage attacks, listings bind the accepted `payment_token: Address` at listing time. `purchase(buyer, item_id)` executes exclusively in the seller's chosen asset.
- **Architectural Boundary:** Stellar/Soroban operates an account-based state model rather than Sui's object-centric Move linear types ("Hot Potatoes"). Kiosk enforces all transfer policies and royalties on every trade through the Kiosk contract; direct SAC peer-to-peer transfers that bypass Kiosk cannot be intercepted.

---

## 💻 Application Features & Deep Linking

The frontend is built with an **Axon-inspired Dark Luxury** aesthetic, featuring obsidian glassmorphism, double-bezel card architecture, interactive telemetry, and full deep-link routing:

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Protocol Overview** | Hero showcase, live telemetry bar, interactive policy simulator, and contract preview. |
| `/marketplace` | **Live Marketplace** | Browse on-chain items with category filtering (Licenses, Passes, Credentials, Collectibles), real-time search, and on-chain checkout modal. |
| `/vault` | **Kiosk Vault** | Non-custodial asset manager. Deposit/place assets into escrow, list them with bound payment tokens, or withdraw unlisted items back to your wallet. |
| `/policy` | **Policy Engine** | Audit and update on-chain transfer policies: creator royalty BPS, minimum floor prices, and multi-recipient upstream revenue splits. |
| `/embed` | **Widget Embed & SDK** | Plug-and-play React and Vanilla JS code snippets for developers to embed kiosk checkouts directly into third-party dApps. |

> **State Persistence:** All routes use the HTML5 History API (`window.history.pushState`). Refreshing from any page (e.g. `/vault` or `/marketplace`) persists the active view, and browser Back/Forward navigation operates seamlessly.

---

## 🦀 Soroban Smart Contract Reference (`contracts/kiosk`)

The core Rust contract implements the following entry points:

```rust
// Initialize kiosk with admin owner, default policy, and upstream split recipients
pub fn initialize(
    env: Env,
    owner: Address,
    royalty_bps: u32,
    royalty_recipient: Address,
    min_floor_price: i128,
    upstream_splits: Vec<UpstreamSplit>,
) -> Result<(), KioskError>;

// Place an asset into Kiosk custody vault (unlisted state)
pub fn place(
    env: Env,
    seller: Address,
    asset_contract: Address,
    asset_amount: i128,
    title: String,
    description: String,
    asset_type: String,
) -> Result<u32, KioskError>;

// List an already placed asset with bound price and payment token
pub fn list(
    env: Env,
    seller: Address,
    item_id: u32,
    price: i128,
    payment_token: Address,
) -> Result<(), KioskError>;

// Atomic convenience entrypoint: deposit asset into custody AND list it
pub fn place_and_list(
    env: Env,
    seller: Address,
    asset_contract: Address,
    asset_amount: i128,
    payment_token: Address,
    price: i128,
    title: String,
    description: String,
    asset_type: String,
) -> Result<u32, KioskError>;

// Withdraw an unlisted asset from escrow back to seller's wallet
pub fn withdraw(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError>;

// Delist an active listing back to Placed state
pub fn delist(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError>;

// Atomically execute purchase, payouts, royalties, and transfer escrowed asset to buyer
pub fn purchase(env: Env, buyer: Address, item_id: u32) -> Result<(), KioskError>;

// Multi-asset policy registry and getters
pub fn set_asset_policy(env: Env, caller: Address, asset_contract: Address, ...) -> Result<(), KioskError>;
pub fn get_default_policy(env: Env) -> Result<TransferPolicy, KioskError>;
pub fn get_asset_policy(env: Env, asset_contract: Address) -> Result<TransferPolicy, KioskError>;
pub fn get_item(env: Env, item_id: u32) -> Result<ListingItem, KioskError>;
pub fn get_item_count(env: Env) -> u32;
pub fn get_owner(env: Env) -> Result<Address, KioskError>;
```

---

## 🛠️ Tech Stack & Tooling

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Frontend Framework** | React + TypeScript + Vite | `18.3.1` / `5.4.2` |
| **Design Language** | Axon Dark Luxury / Plus Jakarta Sans | Tailwind CSS `3.4.1` |
| **Icons** | Lucide React | `0.344.0` |
| **Smart Contract** | Rust (`soroban-sdk`) | `21.7.7` |
| **Target Architecture** | WebAssembly | `wasm32-unknown-unknown` |
| **Wallet Connector** | `@stellar/freighter-api` | `6.0.1` |
| **Stellar SDK** | `@stellar/stellar-sdk` | `13.3.0` |
| **Network** | Stellar Testnet | Protocol 21 |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or later (`node -v`)
- **Rust Toolchain**: Latest stable Rust (`rustc --version`)
- **WebAssembly Target**:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### 1. Run Frontend Locally (Zero-Config)

```bash
git clone https://github.com/luxver/kiosk.git
cd kiosk

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build & Verify Frontend

```bash
npm run build
```

### 3. Run Soroban Smart Contract Verification

```bash
# Verify formatting
cargo fmt --check

# Run linter
cargo clippy --all-targets --all-features -- -D warnings

# Run contract unit and integration tests
cargo test --manifest-path contracts/kiosk/Cargo.toml

# Compile optimized WebAssembly contract
cargo build --manifest-path contracts/kiosk/Cargo.toml --target wasm32-unknown-unknown --release
```

---

## 🔒 Security & Verification Guarantees

1. **Non-Custodial Sovereignty:** Digital assets are never entrusted to a centralized third party. Only the seller can delist, and only the policy-compliant atomic checkout can transfer items.
2. **Atomic Upstream Splits:** Upstream splits (such as the protocol treasury or developer DAOs) are settled in the exact same transaction envelope as the seller and creator payouts. If any leg fails, the entire transaction reverts.
3. **Zero Hardcoded Secrets:** No private keys, secrets, or server-side credentials exist in the codebase. Transactions authenticate dynamically via connected Freighter wallet or an on-demand ephemeral browser session.
4. **Deterministic Token Standards:** Native Stellar Asset Contract (SAC) addresses for Testnet and Mainnet are derived directly from the protocol.
5. **On-Chain Audit Events:** All actions emit standard Soroban topics `(KIOSK, "placed")`, `(KIOSK, "listed")`, `(KIOSK, "bought")`, and `(KIOSK, "withdraw")`, verifiable on [Stellar.Expert](https://stellar.expert/explorer/testnet/contract/CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R).

---

## 🤝 Contributing

We welcome community contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for full setup instructions, architecture notes, and contribution guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
