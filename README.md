# StellarKiosk 🏛️

> A composable, non-custodial digital asset kiosk and policy engine for the Stellar & Soroban ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet%20%26%20Mainnet-green.svg)](https://stellar.org)
[![Wave Program](https://img.shields.io/badge/Drips%20Wave-Eligible%20Sprint-purple.svg)](https://www.drips.network/wave)
[![Architecture](https://img.shields.io/badge/Architecture-100%25%20Decentralized%20(Zero%20DB)-emerald.svg)](https://soroban.stellar.org)

---

## 📌 Overview

Traditional Web3 asset commerce forces creators and developers into a custody trap: to list, sell, or trade an asset, you must transfer custody to a third-party marketplace contract.

**StellarKiosk** brings the **Kiosk Commerce Primitive** to Stellar and Soroban. Assets remain in a non-custodial vault, governed by modular on-chain **Transfer Policies** (guaranteed creator royalties, minimum floor prices, timelocks, and identity/allowlist rules) that execute atomically on settlement.

StellarKiosk provides:
1. **Maintainer Dashboard:** Visual console for initializing personal Soroban kiosk vaults, managing item listings, and tracking sales volume.
2. **Transfer Policy Engine:** Modular on-chain rules enforcing payout conditions, basis points (royalty splits), and timelocked escrow modes.
3. **Soroban Smart Contracts:** Rust-native smart contracts (`contracts/kiosk`) for trustless, non-custodial asset storage and policy settlement.
4. **Freighter Wallet Integration:** Real-time `@stellar/freighter-api` connectivity with live Stellar Horizon RPC synchronization, live Testnet Friendbot faucet funding, and interactive sandbox preview fallback.
5. **Embeddable Checkout Widget:** Drop-in component for integrating kiosk asset checkouts into external applications (React, HTML Web Component, and iframe).

---

## 🚀 Current Status & Architecture

| Component | Status | Description |
| :--- | :--- | :--- |
| **Kiosk Maintainer Dashboard** | ✅ Implemented | React + Tailwind management suite with account-isolated on-chain initialization |
| **Policy Engine UI** | ✅ Implemented | Visual configuration for basis-point royalties, upstream splits, and escrow modes |
| **Freighter Wallet Integration** | ✅ Implemented | Real-time `@stellar/freighter-api` connectivity with automatic Horizon balance sync |
| **Testnet & Mainnet Switcher** | ✅ Implemented | Seamless network toggle with sequence-guarded RPC and live status feedback |
| **Soroban Smart Contracts** | ⚡ Prototype (`contracts/kiosk`) | Rust contract for non-custodial listings, policy enforcement & atomic payouts |
| **Widget Customizer** | ✅ Implemented | Real-time code generator for React snippet, Web Component, and iframe |
| **Zero Centralized Database** | ✅ Pure Protocol | Completely decentralized — zero Supabase, Firebase, or centralized SQL dependencies |
| **Contributor Backlog** | ✅ Implemented | 800+ lines of scoped issues in [`.github/ISSUES.md`](.github/ISSUES.md) |

---

## 🛠️ Tech Stack

- **Smart Contracts:** Rust, Soroban SDK (`soroban-sdk 21.0.0`), WebAssembly
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Stellar Tooling:** `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Data & Protocol Layer:** Soroban Contract Storage + Stellar Horizon RPC (Zero Centralized Database)
- **Testing:** Vitest with jsdom and simulated wallet integration test suite

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
│   ├── components/          # UI components (TopBar, Modals, Cards, UI kit)
│   ├── context/             # WalletContext (Freighter API, Horizon RPC, Friendbot & network state)
│   ├── lib/
│   │   ├── kiosk.ts         # Pure protocol client & account-isolated storage
│   │   └── stellar.ts       # Stellar address utilities, Horizon RPC & Friendbot faucet
│   ├── test/                # Vitest integration tests (WalletFlow, simulated session)
│   └── views/               # Dashboard views (Kiosk, Policy, Widget, Marketplace, Grant)
├── .github/
│   └── ISSUES.md            # Contributor issue backlog tagged by difficulty & sprint
└── package.json
```

---

## 🌐 Live Mode vs. Sandbox Demo Mode

StellarKiosk operates with clean protocol integrity:

1. **Live Account Mode:**
   * When connected to a real **Freighter** wallet, the dApp queries the live Stellar Horizon ledger for your public key's actual XLM balance and account existence.
   * If your account has not initialized a kiosk instance yet, it provides a clean **"No Kiosk Initialized"** empty state with an **"Initialize Soroban Kiosk"** deploy modal.
   * Assets, policies, and transactions are cleanly partitioned under your wallet's address.

2. **Sandbox Demo Mode:**
   * Reviewers or visitors without Freighter installed can test the full functionality using the interactive Sandbox Demo.
   * Features pre-configured example licenses, passes, royalty configurations, and embeddable widget previews.

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

### 2. Testing

```bash
# Run unit & integration tests
npx vitest run

# Build production bundle
npm run build
```

### 3. Soroban Smart Contracts

```bash
# Build contracts to WASM
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
