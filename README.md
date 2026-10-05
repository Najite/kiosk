# StellarKiosk 🏛️

> A composable, non-custodial digital asset kiosk and policy engine for the Stellar & Soroban ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.org)
[![Wave Program](https://img.shields.io/badge/Drips%20Wave-Eligible%20Sprint-purple.svg)](https://www.drips.network/wave)

---

## 📌 Overview

Traditional Web3 asset commerce forces creators and users into a custody trap: to list, sell, or trade an asset, you must transfer custody to a third-party marketplace contract. 

**StellarKiosk** brings the **Kiosk Commerce Primitive** to Stellar and Soroban. Assets remain in a non-custodial vault, governed by modular on-chain **Transfer Policies** (guaranteed creator royalties, minimum floor prices, timelocks, and identity/allowlist rules) that execute atomically on settlement.

StellarKiosk provides:
1. **Maintainer Dashboard:** Visual console for managing kiosk vaults, listings, and multi-recipient royalty splits.
2. **Transfer Policy Engine:** Modular on-chain rules enforcing payout conditions, basis points, and floor limits.
3. **Soroban Smart Contracts:** Rust-native smart contracts (`contracts/kiosk`) for trustless, non-custodial asset storage and policy settlement.
4. **Freighter Wallet Integration:** Native connection with Freighter wallet for Stellar Testnet/Mainnet signing, with fallback demo simulation.
5. **Embeddable Checkout Widget:** Drop-in component for integrating kiosk asset checkouts into external applications.

---

## 🚀 Current Status & Architecture

| Component | Status | Description |
| :--- | :--- | :--- |
| **Kiosk Maintainer Dashboard** | ✅ Implemented | React + Tailwind management suite for listings and payouts |
| **Policy Engine UI** | ✅ Implemented | Visual configuration for basis-point royalties and escrow rules |
| **Freighter Wallet Integration** | ✅ Implemented | Live `@stellar/freighter-api` connectivity with simulated fallback |
| **Soroban Smart Contracts** | ⚡ Prototype (`contracts/kiosk`) | Rust contract for non-custodial listings, policy enforcement & atomic payouts |
| **Widget Customizer** | ✅ Implemented | Real-time code preview and configuration for embeddable widgets |
| **Contributor Backlog** | ✅ Implemented | 800+ lines of scoped issues in [`.github/ISSUES.md`](.github/ISSUES.md) |

---

## 🛠️ Tech Stack

- **Smart Contracts:** Rust, Soroban SDK (`soroban-sdk 21.0.0`), WebAssembly
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Stellar Tooling:** `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Data & Protocol Layer:** Soroban Contract Storage + Stellar Horizon RPC (Zero Centralized Database)

---

## 📂 Project Structure

```text
kiosk/
├── contracts/
│   └── kiosk/               # Soroban Smart Contract (Rust)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs       # Kiosk contract methods (initialize, list, purchase, policy)
│           ├── types.rs     # Data structures (ListingItem, TransferPolicy, DataKey)
│           └── test.rs      # Soroban unit tests
├── Cargo.toml               # Soroban Cargo workspace configuration
├── src/
│   ├── components/          # UI components (TopBar, Modals, Cards)
│   ├── context/             # WalletContext (Freighter API & live RPC sync)
│   ├── lib/                 # Stellar address utilities, Horizon RPC & Kiosk client
│   └── views/               # Dashboard views (Kiosk, Policy, Widget, Marketplace, Grant)
├── .github/
│   └── ISSUES.md            # Contributor issue backlog tagged by difficulty & sprint
└── package.json
```

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **pnpm**
- *(Optional for contracts)* **Rust & Cargo** with `wasm32-unknown-unknown` target and `soroban-cli`

### 1. Frontend & Dashboard

```bash
# Clone the repository
git clone https://github.com/Najite/kiosk.git
cd kiosk

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Soroban Smart Contracts

```bash
# Build contracts
cargo build --target wasm32-unknown-unknown --release

# Run contract unit tests
cargo test -p kiosk
```

---

## 🤝 Contributing & Wave Program

We welcome open-source contributions! Explore our comprehensive issue backlog in [`.github/ISSUES.md`](.github/ISSUES.md) for tasks categorized by difficulty (`L1` to `L5`) and domain (`feature`, `bug`, `testing`, `security`).

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
