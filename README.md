# StellarKiosk

> **A smart digital vending machine on Stellar with automatic creator royalties and instant, multi-party payouts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.expert/explorer/testnet)
[![Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20v21-purple.svg)](https://soroban.stellar.org)
[![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passing-brightgreen.svg)](.github/workflows/ci.yml)
[![Zero-Config](https://img.shields.io/badge/Zero--Config-Runs%20Locally-emerald.svg)](src/lib/stellar.ts)

---

## The Big Picture

Think of **StellarKiosk** like an automated, tamper-proof vending machine on the blockchain.

In the real world, a vending machine holds an item securely, clearly displays the price, and when you put money in, it gives you the product while collecting payment. Nobody has to trust a human cashier, and neither side can cheat the other.

**StellarKiosk brings that exact concept to the Stellar blockchain:**
* **For Sellers:** You can safely store digital assets (access passes, software licenses, memberships, or custom tokens) in an automated escrow box. You remain the owner and can withdraw your items whenever you want as long as they haven't been sold.
* **For Creators:** You can set rules on your assets—such as a guaranteed 5% royalty on every trade, or an automated 2.5% split sent to a community treasury.
* **For Buyers:** When you purchase an item, the smart contract handles everything in a single, instant transaction. The payment is split accurately to the creator, the treasury, and the seller, and the asset is delivered directly into your wallet. If any part of the payment fails, the transaction cancels and no money or assets move.

There are no middlemen, no private databases, and no off-chain servers holding your funds. The smart contracts run directly on Stellar's **Soroban** decentralized network.

---

## Core Capabilities

| Feature | What It Means | Why It Matters |
| :--- | :--- | :--- |
| **Non-Custodial Escrow** | Your assets are held in smart contract code, not in a company's private wallet. | The platform owner cannot steal your assets or freeze your balance. If an item is unlisted, you can withdraw it back to your wallet at any time. |
| **Guaranteed Creator Royalties** | Creators receive an automated percentage of every sale (e.g. 5% or 10%). | On traditional markets, royalties are often optional or ignored. Here, the smart contract mathematically enforces them before settling the trade. |
| **Upstream Revenue Splits** | A single sale can pay out multiple parties at once (e.g., protocol treasury, DAO, team members). | No manual accounting or secondary payout transactions needed. Revenue routes automatically in real time. |
| **Minimum Floor Prices** | Creators can set a minimum price guardrail below which items cannot be listed. | Prevents accidental listings, fat-finger errors, or predatory undercutting. |
| **Atomic Settlement** | All payments and the asset transfer happen in a single blockchain step. | Zero counterparty risk: either everyone gets paid and the buyer gets the asset, or nothing happens at all. |
| **Direct Blockchain Connection** | The web app connects straight to public Stellar nodes. | No private API keys, no passwords, and no central database that can go down. |

---

## Live Contracts on Stellar Testnet

All contracts are deployed, initialized, and actively verified on the Stellar Testnet:

| Contract / Account | On-Chain Address | Verified Explorer |
| :--- | :--- | :--- |
| **Kiosk Protocol Contract** | `CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R) |
| **Asset Token (SEP-0041)** | `CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA) |
| **Native XLM SAC Contract** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |
| **Protocol Admin / Deployer** | `GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X` | [View on StellarExpert](https://stellar.expert/explorer/testnet/account/GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X) |
| **Protocol Treasury** | `GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO` | [View on StellarExpert](https://stellar.expert/explorer/testnet/account/GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO) |

---

## How a Trade Works Step-by-Step

```
[Seller's Wallet]
       │
       ▼
 1. Deposit (`place` or `place_and_list`)
       │
       ▼
┌────────────────────────────────────────────────────────┐
│               StellarKiosk Smart Contract              │
│                 (Autonomous Escrow Vault)              │
│                                                        │
│  Asset is safely locked in custody.                    │
│  Seller can withdraw anytime if unlisted.              │
└───────────────────────────────────┬────────────────────┘
                                    │
                                    │ 2. Buyer clicks "Buy" (`purchase`)
                                    ▼
┌────────────────────────────────────────────────────────┐
│              Single Atomic Ledger Transaction          │
│                                                        │
│  • Creator Royalty %      ──► Sent to Creator Wallet   │
│  • Treasury Split %       ──► Sent to Treasury Address │
│  • Remaining Amount       ──► Sent to Seller Wallet    │
│  • Escrowed Asset Tokens  ──► Delivered to Buyer       │
│                                                        │
│  (If any payment fails, the whole transaction reverts) │
└────────────────────────────────────────────────────────┘
```

---

## Smart Contract Architecture

The project contains two Soroban smart contracts written in Rust:

### 1. `contracts/kiosk` (The Main Marketplace Contract)
Handles deposits, listings, policy enforcement, and atomic checkouts:

* **Key Functions:**
  - `place(seller, asset_contract, amount, title, description, asset_type)`: Deposits tokens into contract escrow without listing them.
  - `list(seller, item_id, price, payment_token)`: Puts an escrowed item up for sale with a specific price and accepted payment token (e.g. XLM).
  - `place_and_list(...)`: Convenience function that deposits and lists in a single click.
  - `delist(caller, item_id)`: Removes an item from the market back into your unlisted vault.
  - `withdraw(caller, item_id)`: Returns unlisted tokens from the escrow contract back to your wallet.
  - `purchase(buyer, item_id)`: Executes the atomic purchase: distributes payments to creator, treasury, and seller, and delivers the asset to the buyer.
  - `set_policy(...)` / `set_asset_policy(...)`: Configures royalty percentages, minimum floor prices, and split recipients.

### 2. `contracts/kiosk_asset` (Standard Asset Token Contract)
An implementation of Stellar's **SEP-0041** token standard. Used to mint, transfer, and hold reference assets (like developer passes, licenses, or tokens) that get escrowed inside the Kiosk.

---

## What's in the Web App (`src/`)

The frontend is built with React, TypeScript, Vite, and Tailwind CSS. It communicates directly with Stellar Testnet:

1. **Marketplace (`/marketplace`):**
   Browse active listings directly from Soroban on-chain storage. Search by title, filter by category (Licenses, Passes, Badges, Collectibles), and buy with 1 click.
2. **Kiosk Vault (`/vault`):**
   Your personal management screen. Shows items currently in escrow and items you have purchased.
   - **Automatic Wallet Detection:** Scans your connected wallet for tokens you actually own (like XLM or custom assets) so you can deposit them easily.
   - **Contract Inspector:** Paste any 56-character Soroban contract address starting with `C` to check its name, symbol, and your balance in real time.
   - **1-Click Freighter Sync:** Lets you add purchased smart-contract tokens into your Freighter wallet extension with a single button click.
3. **Policy Engine (`/policy`):**
   Audit the active transfer policy: review creator royalty percentages, minimum floor prices, and upstream split addresses.
4. **Wallet Connectivity:**
   - **Freighter Wallet:** Full integration with the official Stellar browser extension.
   - **Instant Test Wallet:** If you don't have Freighter installed, the app creates an in-session testnet wallet and funds it automatically using Stellar's Friendbot.

---

## Repository Structure

```
kiosk/
├── contracts/
│   ├── kiosk/                       # Main Kiosk marketplace smart contract
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs               # Escrow logic, listings, and atomic settlement
│   │       ├── types.rs             # Data structs (ListingItem, TransferPolicy)
│   │       └── test.rs              # 17 comprehensive Rust tests
│   └── kiosk_asset/                 # SEP-0041 asset token contract
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs               # Token implementation (SEP-0041 interface)
│           ├── types.rs             # Token storage keys
│           └── test.rs              # 4 token tests (mint, transfer, allowance)
├── src/
│   ├── App.tsx                      # Main app layout and tab navigation
│   ├── main.tsx                     # React entrypoint
│   ├── index.css                    # Obsidian glassmorphic styling
│   ├── context/
│   │   └── WalletContext.tsx        # Freighter wallet connector & testnet session
│   ├── lib/
│   │   ├── stellar.ts               # Network constants, SAC addresses, Horizon client
│   │   └── soroban.ts               # Soroban RPC transaction builders & simulations
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   └── components/
│       ├── Navbar.tsx               # Header with network status badge
│       ├── Footer.tsx               # Footer with explorer links
│       ├── Hero.tsx                 # Protocol showcase banner
│       ├── TelemetryBar.tsx         # Live metrics and network status
│       ├── InteractiveSandbox.tsx   # Interactive royalty & fee simulator
│       ├── CheckoutModal.tsx        # Live purchase modal with fee breakdown
│       ├── ConnectModal.tsx         # Wallet selection modal
│       └── views/
│           ├── MarketplaceView.tsx  # Catalog of active on-chain listings
│           ├── KioskManagerView.tsx # Vault inventory, deposit modal & Freighter sync
│           ├── PolicyEngineView.tsx # Transfer policy viewer and administrator
│           └── WidgetEmbedView.tsx  # Integration code snippets for external websites
├── .github/
│   └── workflows/
│       └── ci.yml                   # CI pipeline: Frontend build & Cargo tests
├── Cargo.toml                       # Rust workspace definition
└── package.json                     # Frontend dependencies
```

---

## Testing & Verification

Every component in this repository has automated tests:

### 1. Smart Contract Tests (21 Tests, All Passing)
Run the complete Rust test suite:
```bash
cargo test --all
```
This tests:
* Safe deposits, withdrawals, and unauthorized access rejections.
* Enforcing floor prices and royalty basis points.
* Multi-recipient upstream splits and net seller payouts.
* Invariant check that already-sold items cannot be withdrawn or repurchased.
* SEP-0041 token balances, allowances, and minting.

### 2. Code Quality & Formatting
```bash
# Verify Rust formatting
cargo fmt --check

# Check Rust linter (zero warnings)
cargo clippy --all-targets --all-features -- -D warnings
```

### 3. Frontend Typecheck & Build
```bash
# Typecheck TypeScript (zero errors)
npm run lint

# Production build
npm run build
```

---

## Getting Started Locally

### Prerequisites
* **Node.js**: v18 or later (`node -v`)
* **Rust**: Stable Rust toolchain (`rustc --version`)
* **WebAssembly target**:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### 1. Clone and Install
```bash
git clone https://github.com/luxver/kiosk.git
cd kiosk

npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app connects directly to Stellar Testnet out of the box.

### 3. Compile Contracts to WebAssembly (Optional)
```bash
# Compile the Kiosk contract
cargo build --manifest-path contracts/kiosk/Cargo.toml --target wasm32-unknown-unknown --release

# Compile the Asset Token contract
cargo build --manifest-path contracts/kiosk_asset/Cargo.toml --target wasm32-unknown-unknown --release
```

---

## Interacting via Stellar CLI

You can query the live Testnet contracts directly from your terminal:

```bash
# 1. Check total items registered in the Kiosk
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- get_item_count

# 2. Check the details of an item (e.g. Item #8)
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- get_item \
  --item_id 8

# 3. Check the active transfer policy (royalties and floor price)
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --source-account <YOUR_ACCOUNT_NAME> \
  --network testnet \
  -- get_default_policy
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
