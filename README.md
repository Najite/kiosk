# StellarKiosk

> **A non-custodial asset vault and marketplace on Stellar with automatic creator royalties and multi-party payouts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.expert/explorer/testnet)
[![Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20v21-purple.svg)](https://soroban.stellar.org)
[![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passing-brightgreen.svg)](.github/workflows/ci.yml)

---

## The Big Picture

Think of **StellarKiosk** as an automated vending machine on the Stellar blockchain:

1. **Sellers put digital assets inside:** You can deposit software licenses, access passes, or custom tokens into the smart contract. You keep ownership and can withdraw them anytime if unlisted.
2. **Creators set the rules:** You can enforce a minimum price, a creator royalty (e.g. 5%), and revenue splits (e.g. 2.5% to a community treasury).
3. **Buyers purchase with 1 click:** The smart contract automatically splits the payment to the creator, the treasury, and the seller, and delivers the asset directly to the buyer's wallet.

Everything happens in **one single blockchain transaction**. If any part of the payment fails, the transaction cancels and no assets move.

---

## Live Contracts (Stellar Testnet)

| Contract | Address | Explorer |
| :--- | :--- | :--- |
| **Kiosk Protocol** | `CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R` | [View Contract](https://stellar.expert/explorer/testnet/contract/CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R) |
| **Asset Token (SEP-0041)** | `CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA` | [View Token](https://stellar.expert/explorer/testnet/contract/CA2B4QI5LZW63D2WFQIDADASCKPAWU3W75H7RZZQIXT244PK7636WQAA) |
| **Native XLM SAC** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | [View SAC](https://stellar.expert/explorer/testnet/contract/CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC) |

---

## Architecture & How It Works

### 1. System Overview

```
[ Frontend: React + Vite + Freighter Wallet ]
                      │
                      ▼ HTTPS / JSON-RPC
[ Stellar RPC: Horizon API + Soroban RPC ]
                      │
                      ▼ On-Chain Invocation
┌────────────────────────────────────────────────────────┐
│             Kiosk Contract (Soroban / Rust)            │
│                                                        │
│  • Escrow Vault: Safely holds deposited tokens         │
│  • Listing Registry: Tracks prices & bound currencies  │
│  • Policy Engine: Enforces royalties & treasury splits │
└───────────┬────────────────────────────────┬───────────┘
            │ Transfers Escrowed Asset       │ Routes Payment
            ▼                                ▼
[ Asset Token (CA2B4...6WQAA) ]    [ Native XLM SAC (CDLZF...GCYSC) ]
 (Delivered to Buyer)               (Buyer ──► Creator, Split & Seller)
```

### 2. Item Lifecycle

* **Placed:** Tokens are deposited into the Kiosk contract custody. The seller still owns the item and can withdraw it anytime.
* **Listed:** The seller puts the item up for sale with a price and accepted token (e.g. XLM). Floor price rules are enforced.
* **Sold:** A buyer purchases the item. Royalties and splits route automatically, and the tokens transfer to the buyer's wallet.

### 3. Soroban Storage Model

* **Instance Storage:** Holds global protocol state (`Owner`, `DefaultPolicy`, `ItemCount`).
* **Persistent Storage:** Holds item listings (`DataKey::Item(id)`) and collection-specific policy overrides (`DataKey::AssetPolicy(address)`). When an item is withdrawn, its storage entry is deleted to reclaim state rent.

---

## Repository Structure

```
kiosk/
├── contracts/
│   ├── kiosk/              # Main marketplace & escrow contract (Rust)
│   └── kiosk_asset/        # SEP-0041 standard token contract (Rust)
├── src/
│   ├── components/         # UI components & views (Marketplace, Vault, Policy Engine)
│   ├── context/            # WalletContext (Freighter & testnet session)
│   └── lib/                # Soroban RPC client, transaction builders & network config
├── .github/workflows/ci.yml# CI: Build & automated tests
├── Cargo.toml              # Rust workspace
└── package.json            # Frontend dependencies
```

---

## Quickstart: Run Locally

### Prerequisites
* **Node.js** v18+
* **Rust** & `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`)

### 1. Clone & Start
```bash
git clone https://github.com/luxver/kiosk.git
cd kiosk

npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The app connects directly to Stellar Testnet.

---

## Testing & Verification

The codebase includes an automated test suite across contracts and frontend:

```bash
# Run all 21 Soroban contract unit & integration tests
cargo test --all

# Check formatting & linting
cargo fmt --check
cargo clippy --all-targets -- -D warnings

# Typecheck frontend
npm run lint
```

---

## Interacting via Stellar CLI

Query live Testnet state directly from your terminal:

```bash
# 1. Get total items created
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --network testnet \
  -- get_item_count

# 2. View item details (e.g. Item #8)
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --network testnet \
  -- get_item --item_id 8

# 3. Check active transfer policy
stellar contract invoke \
  --id CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R \
  --network testnet \
  -- get_default_policy
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
