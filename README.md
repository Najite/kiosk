# StellarKiosk

> **Non-Custodial Asset Vault, Transfer Policy Engine & Atomic Marketplace on Stellar (Soroban)**  
> An open implementation of the Kiosk digital commerce primitive for Soroban smart contracts, featuring creator royalty enforcement, multi-recipient revenue splits, floor prices, and atomic settlement escrow.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.expert/explorer/testnet)
[![Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20v21-purple.svg)](https://soroban.stellar.org)
[![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passing-brightgreen.svg)](cargo-test)
[![Zero-Config](https://img.shields.io/badge/Zero--Config-No%20.env%20Required-emerald.svg)](src/lib/stellar.ts)

---

## What This Codebase Is

This repository contains a full-stack, decentralized digital asset marketplace and custodial escrow protocol built for the **Stellar** network using **Soroban** smart contracts (Rust) and a **React + TypeScript** web application.

It adapts the core ideas of the **Sui Kiosk** standard into Stellar's account-based and smart contract architecture:

1. **Non-Custodial Escrow Vault:** Sellers deposit assets (any SEP-0041 smart contract token or Stellar Asset Contract / SAC) directly into the Kiosk contract storage. Assets stay safely in contract custody until sold or explicitly withdrawn by the owner.
2. **Transfer Policies & Creator Royalties:** Collections enforce programmatic transfer policies on trade:
   - Creator royalty percentage (defined in basis points, up to 10,000 BPS = 100%).
   - Multi-recipient upstream splits (e.g., protocol treasuries, ecosystem DAOs, affiliate partners).
   - Minimum floor price guardrails.
   - Policies can be configured globally (default fallback) or overridden per-collection contract (`set_asset_policy`).
3. **Atomic Settlement Escrow:** When a buyer calls `purchase`, the smart contract executes every payment leg (creator royalties, upstream splits, and net seller payout) and delivers the escrowed asset to the buyer in a **single atomic transaction envelope**. If any payment transfer fails (e.g., insufficient balance or unauthorized token), the entire invocation aborts and reverts.
4. **Zero-Backend Architecture:** The web application communicates **directly** with the Stellar Horizon RPC and Soroban RPC nodes (`https://soroban-testnet.stellar.org`). There are no centralized databases (no Supabase, Firebase, or MongoDB) and no private `.env` API keys. The Stellar ledger is the single source of truth.

---

## Live On-Chain Deployments (Stellar Testnet)

All smart contracts are compiled, deployed, initialized, and operational on Stellar Testnet:

| Contract / Entity | Address / Identifier | Explorer Link |
| :--- | :--- | :--- |
| **Kiosk Protocol Contract** | `CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R) |
| **Kiosk Asset Token (SEP-0041)** | `CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA) |
| **Native XLM SAC Contract** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Protocol Admin / Deployer** | `GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X` | [View on StellarExpert](https://stellar.expert/explorer/testnet/account/GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X) |
| **Protocol Treasury Recipient** | `GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO` | [View on StellarExpert](https://stellar.expert/explorer/testnet/account/GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO) |
| **WASM Hash** | `9cb249d2d00ab4fa84af0dc096a7504988d00b0649fa142bd82cd84e91f29e52` | — |

---

## How It Works: Sui Kiosk vs. Stellar Soroban

| Feature | Sui Kiosk (Move) | StellarKiosk (Soroban / Rust) |
| :--- | :--- | :--- |
| **Object Model** | Object-centric: Assets and Kiosks are typed on-chain objects with unique IDs. | Account & Contract storage: Assets are token balances (SEP-0041 / SAC) escrowed in the Kiosk contract's persistent storage. |
| **Custody Mechanics** | Assets are placed in the Kiosk object; `KioskOwnerCap` authorizes actions. | Seller calls `place()`, transferring tokens from their wallet to the Kiosk contract address. Seller's address is recorded in persistent state. |
| **Enforcement Primitive** | Linear "Hot Potato" types (`TransferRequest`) requiring resolving rules before destruction. | Single atomic invocation `purchase()`: The contract computes royalties, splits, and payouts, executing transfers via `token::Client` and updating status to `Sold`. |
| **Withdrawal Safety** | Only the owner cap can withdraw items from the Kiosk. | Calling `withdraw()` requires `caller.require_auth()`, checks that `caller == seller`, verifies the item is neither listed nor sold (`ItemAlreadySold`), and returns tokens. |
| **Payment Binding** | Handled via Sui `Coin<T>`. | The listing binds an explicit `payment_token: Address` (e.g. Native XLM SAC). Purchases are strictly settled in the bound token. |

---

## Smart Contract Specification

The Cargo workspace (`Cargo.toml`) contains two Soroban contracts:

### 1. `contracts/kiosk` (Core Protocol)
The main contract handling asset deposits, listings, policies, and purchases:

* **State Storage:**
  - `DataKey::Owner`: Address of the protocol administrator.
  - `DataKey::DefaultPolicy`: Default fallback `TransferPolicy`.
  - `DataKey::AssetPolicy(Address)`: Collection-specific `TransferPolicy` override.
  - `DataKey::Item(u32)`: Persistent `ListingItem` struct holding seller, asset contract, escrow amount, bound payment token, price, status, and metadata.
  - `DataKey::ItemCount`: Instance counter for items created.

* **Entry Points:**
  ```rust
  // Initialize the protocol with owner, default royalty, and upstream splits
  pub fn initialize(env: Env, owner: Address, royalty_bps: u32, royalty_recipient: Address, min_floor_price: i128, upstream_splits: Vec<UpstreamSplit>) -> Result<(), KioskError>;

  // Deposit an asset into Kiosk custody without listing it (Placed state)
  pub fn place(env: Env, seller: Address, asset_contract: Address, asset_amount: i128, title: String, description: String, asset_type: String) -> Result<u32, KioskError>;

  // List an already placed asset with an explicit price and payment token
  pub fn list(env: Env, seller: Address, item_id: u32, price: i128, payment_token: Address) -> Result<(), KioskError>;

  // Atomic deposit + list in a single transaction
  pub fn place_and_list(env: Env, seller: Address, asset_contract: Address, asset_amount: i128, payment_token: Address, price: i128, title: String, description: String, asset_type: String) -> Result<u32, KioskError>;

  // Delist an active listing back to unlisted Placed state
  pub fn delist(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError>;

  // Update listing price (enforces min floor price)
  pub fn update_price(env: Env, caller: Address, item_id: u32, new_price: i128) -> Result<(), KioskError>;

  // Withdraw unlisted asset from escrow back to seller wallet
  pub fn withdraw(env: Env, caller: Address, item_id: u32) -> Result<(), KioskError>;

  // Atomically purchase: routes royalty, upstream splits, seller payout, and transfers escrowed asset to buyer
  pub fn purchase(env: Env, buyer: Address, item_id: u32) -> Result<(), KioskError>;

  // Transfer policy administration
  pub fn set_policy(env: Env, caller: Address, royalty_bps: u32, royalty_recipient: Address, min_floor_price: i128, upstream_splits: Vec<UpstreamSplit>) -> Result<(), KioskError>;
  pub fn set_asset_policy(env: Env, creator: Address, asset_contract: Address, royalty_bps: u32, royalty_recipient: Address, min_floor_price: i128, upstream_splits: Vec<UpstreamSplit>) -> Result<(), KioskError>;

  // Read-only getters
  pub fn get_default_policy(env: Env) -> Result<TransferPolicy, KioskError>;
  pub fn get_asset_policy(env: Env, asset_contract: Address) -> Result<TransferPolicy, KioskError>;
  pub fn get_policy(env: Env, asset_contract: Option<Address>) -> Result<TransferPolicy, KioskError>;
  pub fn get_item(env: Env, item_id: u32) -> Result<ListingItem, KioskError>;
  pub fn get_item_count(env: Env) -> u32;
  pub fn get_owner(env: Env) -> Result<Address, KioskError>;
  ```

### 2. `contracts/kiosk_asset` (SEP-0041 Standard Asset Token)
An implementation of Stellar's **SEP-0041** token interface used for minting and escrowing reference digital assets:
* Implements `name`, `symbol`, `decimals`, `balance`, `spendable_balance`, `authorized`, `transfer`, `transfer_from`, `mint`, `burn`, and `burn_from`.
* Unit tested for allowance checks, balance tracking, and authorization verification.

---

## Repository Structure

```
kiosk/
├── contracts/
│   ├── kiosk/                       # Main Kiosk marketplace smart contract
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs               # Kiosk contract implementation & entry points
│   │       ├── types.rs             # DataKey, ListingItem, TransferPolicy, ItemStatus
│   │       └── test.rs              # 17 comprehensive unit & integration tests
│   └── kiosk_asset/                 # SEP-0041 standard asset token contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs               # Token implementation (SEP-0041 interface)
│           ├── types.rs             # DataKey storage keys
│           └── test.rs              # 4 token tests (mint, transfer, allowance)
├── src/
│   ├── App.tsx                      # Main application routing and navigation
│   ├── main.tsx                     # React entrypoint
│   ├── index.css                    # Obsidian glassmorphic styling & design tokens
│   ├── context/
│   │   └── WalletContext.tsx        # Freighter wallet connector & Ephemeral burner session
│   ├── lib/
│   │   ├── stellar.ts               # Network constants, SAC addresses, Horizon RPC client
│   │   └── soroban.ts               # Soroban RPC transaction builders, simulations & Freighter tracking
│   ├── types/
│   │   └── index.ts                 # TypeScript types for listings, policies, and contracts
│   └── components/
│       ├── Navbar.tsx               # Top navigation bar with live network badges
│       ├── Footer.tsx               # Footer with explorer links and contract telemetry
│       ├── Hero.tsx                 # Protocol hero showcase and architecture diagram
│       ├── TelemetryBar.tsx         # Live protocol metrics & Soroban RPC cluster telemetry
│       ├── InteractiveSandbox.tsx   # Interactive transfer policy visualizer and sandbox
│       ├── CheckoutModal.tsx        # Live atomic checkout modal with fee breakdown
│       ├── ConnectModal.tsx         # Wallet connection modal (Freighter / Ephemeral testnet)
│       └── views/
│           ├── MarketplaceView.tsx  # Catalog of on-chain listings with search & filters
│           ├── KioskManagerView.tsx # Vault management: deposit, list, withdraw & Freighter tracking
│           ├── PolicyEngineView.tsx # Transfer policy viewer and administrator
│           └── WidgetEmbedView.tsx  # Embeddable SDK and code generator for external dApps
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI pipeline: Frontend build & Cargo tests
├── Cargo.toml                       # Workspace root for Soroban contracts
├── package.json                     # Frontend dependencies & scripts
├── tailwind.config.js               # Tailwind CSS theme configuration
└── tsconfig.json                    # TypeScript compiler configuration
```

---

## Frontend & Wallet Mechanics

The frontend connects directly to Stellar Testnet with no intermediary backend:

1. **Freighter Wallet Integration:**
   - Detects the installed Freighter extension via `@stellar/freighter-api`.
   - Prompts for transaction signatures on every state-changing call (`place`, `list`, `delist`, `withdraw`, `purchase`).
   - Supports 1-click **Add Token to Freighter** via `addToken({ contractId, networkPassphrase })` so users can track custom Soroban tokens in their wallet extension.

2. **Ephemeral Burner Wallet (Fallback):**
   - If the user doesn't have Freighter installed or wants to test immediately, the app generates an in-session ephemeral keypair stored in `sessionStorage`.
   - The app automatically requests funding from the Stellar **Friendbot** API to provide real Testnet XLM without manual setup.

3. **Wallet Balance Auto-Detection:**
   - In **Kiosk Vault** (`/vault`), the deposit modal scans both Horizon (for Native XLM SAC and classic assets) and Soroban RPC (for custom SEP-0041 tokens).
   - Shows real available balances so sellers can deposit their existing wallet assets into vault custody without copy-pasting contract IDs.

4. **Universal Contract Inspector:**
   - Allows pasting any 56-character Soroban contract address starting with `C` to simulate `name()`, `symbol()`, and `balance()` live from on-chain storage.

---

## Testing & Verification

The codebase includes an exhaustive test suite covering both the smart contracts and the frontend:

### 1. Smart Contract Test Suite (21 Tests)
Run all contract tests across the workspace:
```bash
cargo test --all
```

**What the tests verify:**
- `test_initialize_and_default_policy`: Contract initialization and storage verification.
- `test_already_initialized_fails`: Re-initialization protection.
- `test_invalid_bps_fails`: Validation that royalties + splits do not exceed 100% (10,000 BPS).
- `test_place_and_vault_custody`: Custodial token escrow into the contract address.
- `test_invalid_place_amount_fails`: Rejection of zero or negative escrow quantities.
- `test_list_and_update_price`: Listing placed assets and dynamic repricing.
- `test_place_below_floor_fails`: Rejection of listing prices below the policy floor price.
- `test_place_and_list_atomic`: Single-transaction place-and-list execution.
- `test_delist_and_withdraw_escrow`: Reverting to unlisted state and returning tokens to seller.
- `test_unauthorized_delist_fails`: Protection against non-seller delisting.
- `test_unauthorized_withdraw_fails`: Protection against non-seller withdrawals.
- `test_purchase_splits_and_asset_delivery`: End-to-end atomic settlement: creator royalty payout, upstream split payout, net seller payout, asset delivery to buyer, and status transition to `Sold`.
- `test_purchase_already_sold_or_delisted_fails`: Invariant check that sold items cannot be repurchased.
- `test_kiosk_custom_asset_deposit_and_withdrawal`: Multi-asset validation with arbitrary custom SEP-0041 tokens.
- `test_kiosk_custom_asset_purchase_delivery`: Complete custom token escrow delivery on purchase.
- `test_set_asset_policy_override`: Per-collection policy override verification.
- `test_unauthorized_set_policy_fails`: Admin access control verification.
- 4 unit tests in `contracts/kiosk_asset`: Minting, burning, allowances, and metadata.

### 2. Contract Code Quality & Formatting
```bash
# Check formatting
cargo fmt --check

# Check linter (zero warnings)
cargo clippy --all-targets --all-features -- -D warnings
```

### 3. Frontend Typecheck & Build
```bash
# Verify TypeScript compilation (0 errors)
npm run lint

# Build production bundle
npm run build
```

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.x or later (`node -v`)
- **Rust**: Latest stable toolchain (`rustc --version`)
- **WebAssembly target**:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
- **Stellar CLI** (optional, for CLI contract interaction):
  ```bash
  cargo install --locked stellar-cli
  ```

### 1. Clone & Install
```bash
git clone https://github.com/luxver/kiosk.git
cd kiosk

npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app connects directly to Stellar Testnet.

### 3. Compile Contracts to WebAssembly
```bash
# Build optimized release WASM for the Kiosk contract
cargo build --manifest-path contracts/kiosk/Cargo.toml --target wasm32-unknown-unknown --release

# Build optimized release WASM for the Asset Token contract
cargo build --manifest-path contracts/kiosk_asset/Cargo.toml --target wasm32-unknown-unknown --release
```

Compiled WASM artifacts will be generated in `target/wasm32-unknown-unknown/release/`.

---

## Interacting via Stellar CLI (Testnet)

You can inspect or invoke the live testnet contracts directly using the Stellar CLI:

### Query Protocol Item Count
```bash
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- get_item_count
```

### Query Item Details (e.g. Item #8)
```bash
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- get_item \
  --item_id 8
```

### Query Active Default Transfer Policy
```bash
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- get_default_policy
```

### Query Token Balance (e.g. Reference AXON Asset)
```bash
stellar contract invoke \
  --id CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- balance \
  --id <ACCOUNT_PUBLIC_KEY>
```

---

## License

This project is open source and licensed under the [MIT License](LICENSE).
