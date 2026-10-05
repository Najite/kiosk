# StellarKiosk 🏛️

> A composable, non-custodial digital asset kiosk and policy engine for the Stellar & Soroban ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-green.svg)](https://stellar.org)
[![Wave Program](https://img.shields.io/badge/Drips%20Wave-Eligible%20Sprint-purple.svg)](https://www.drips.network/wave)

---

## 📌 Overview

Traditional Web3 asset commerce forces creators and users into a custody trap: to list, sell, or trade an asset, you must transfer custody to a third-party marketplace contract. 

**StellarKiosk** brings the **Kiosk Commerce Primitive** (popularized by Sui) to Stellar and Soroban. Assets remain in a non-custodial vault, governed by modular on-chain **Transfer Policies** (guaranteed creator royalties, minimum floor prices, timelocks, and identity/KYC allowlists) that execute atomically on settlement.

StellarKiosk provides:
1. **Maintainer Dashboard:** A visual console for configuring kiosks, managing items, and setting multi-recipient royalty splits.
2. **Transfer Policy Engine:** Modular rules enforcing payout conditions, multisig escrows, and floor limits.
3. **Embeddable Checkout Widget:** A drop-in Web Component allowing any site or game to sell Kiosk-stored assets in two lines of HTML.

---

## 🚀 Current Status & Architecture

StellarKiosk is currently in **Phase 1 (Interface Architecture & Simulation Layer)** and transitioning into **Phase 2 (Soroban On-Chain Integration)** through the Stellar Wave sprint cycles.

| Component | Status | Description |
| :--- | :--- | :--- |
| **Kiosk Maintainer Dashboard** | ✅ Functional | React + Tailwind management suite for listings and payouts |
| **Policy Engine UI** | ✅ Functional | Visual configuration for basis-point royalties and escrow rules |
| **Widget Customizer** | ✅ Functional | Real-time code preview and configuration for embeddable widgets |
| **Freighter Wallet Integration** | 🔄 In Progress (`SK-054`) | Transitioning from local wallet simulation to `@stellar/freighter-api` |
| **Soroban Smart Contracts** | 🔄 In Progress (`SK-080`) | Rust contracts (`contracts/kiosk`) for on-chain non-custodial execution |
| **Standalone Web Component** | 🔄 In Progress (`SK-081`) | Zero-dependency `@stellarkiosk/widget` custom element |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Persistence & Metadata:** Supabase (PostgreSQL)
- **Blockchain Target:** Stellar Network / Soroban Smart Contracts (Rust / WASM)
- **Client Libraries:** `@stellar/stellar-sdk`, `@stellar/freighter-api`
- **Testing:** Vitest, Testing Library

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Najite/kiosk.git](https://github.com/Najite/kiosk.git)
   cd kiosk
