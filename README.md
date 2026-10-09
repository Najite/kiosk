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

### 1. System Topology

![System Architecture](docs/images/system_architecture.svg)

* **Client Tier:** React 18 + Vite frontend interfacing with the Freighter browser wallet extension (`@stellar/freighter-api`) or an ephemeral in-memory testnet session.
* **Network Tier:** Communicates directly with public Stellar nodes—Soroban RPC (`simulateTransaction`, `sendTransaction`, `pollTransaction`) and Horizon API (`/accounts` balances and sequence numbers).
* **Smart Contract Tier:** `KioskContract` on Soroban managing escrowed assets, active listings, and customizable transfer policies. Interacts via `token::Client` with both the payment token (Native XLM SAC) and escrowed asset tokens.

### 2. Atomic Settlement Engine

![Atomic Settlement Flow](docs/images/atomic_settlement.svg)

When a buyer calls `purchase(buyer, item_id)`:
1. **Validation:** Checks buyer authorization, listing status, and resolves the effective collection transfer policy.
2. **Fee Math:** Calculates creator royalties and upstream splits in basis points (e.g., 500 BPS = 5%).
3. **Atomic Multi-Transfer:** The contract routes payment directly from the buyer to the creator, the treasury splits, and the seller payout, then delivers the escrowed asset tokens to the buyer.
4. **Revert Protection:** If any payment or transfer leg fails, the entire transaction reverts. No assets or funds change hands.

### 3. Item Lifecycle & Storage Architecture

![Item Lifecycle & Storage](docs/images/item_lifecycle.svg)

* **Placed (`ItemStatus::Placed`):** Tokens are deposited into the Kiosk escrow vault. `is_listed = false`. The seller retains full ownership and can withdraw anytime.
* **Listed (`ItemStatus::Listed`):** Item is active on the marketplace with a bound payment currency. Price is verified against the minimum floor price guardrail (`price >= min_floor_price`). Withdrawals are blocked while listed.
* **Sold (`ItemStatus::Sold`):** The asset is transferred to the buyer's wallet, and ownership is updated (`item.seller = buyer`). Sold items cannot be repurchased or withdrawn.
* **Storage Allocation:**
  - **Instance Storage (`env.storage().instance()`):** Holds protocol-wide settings (`Owner`, `DefaultPolicy`, `ItemCount`).
  - **Persistent Storage (`env.storage().persistent()`):** Holds independent item listings (`DataKey::Item(id)`) and collection overrides (`DataKey::AssetPolicy(address)`). Entries are removed upon withdrawal to reclaim state rent.

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
