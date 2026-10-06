# StellarKiosk 🏛️

> A composable, non-custodial digital asset kiosk and policy engine for the Stellar & Soroban ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet%20%26%20Mainnet-green.svg)](https://stellar.org)
[![Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20v21-purple.svg)](https://soroban.stellar.org)
[![Architecture](https://img.shields.io/badge/Architecture-100%25%20Decentralized%20(Zero%20DB)-emerald.svg)](https://soroban.stellar.org)
[![Wave Program](https://img.shields.io/badge/Drips%20Wave-Eligible%20Sprint-blueviolet.svg)](https://www.drips.network/wave)

---

## 📌 Executive Summary

Traditional Web3 asset commerce forces creators and developers into a custody trap: to list, sell, or trade an asset, you must transfer custody to a third-party marketplace contract.

**StellarKiosk** brings the **Kiosk Commerce Primitive** to Stellar and Soroban. Assets remain in a non-custodial vault, governed by modular on-chain **Transfer Policies** (guaranteed creator royalties, minimum floor prices, timelocks, and identity/allowlist rules) that execute atomically on settlement.

The project is built as a **100% decentralized Web3 protocol** with **zero centralized databases** (no Supabase, Firebase, or external API keys). The blockchain ledger and Soroban state are the single source of truth.

---

## 🎯 What the Project Includes

### 1. 🏠 Interactive Landing Page & Product Showcase
* **Hero Section & Value Proposition:** Explains the non-custodial kiosk primitive vs. traditional marketplace custody risks.
* **Interactive Protocol Architecture Diagram:** Visualizes the flow between Buyer, Seller, Kiosk Vault, Transfer Policy Engine, and Soroban Settlement.
* **Feature Deep-Dives:** Details atomic royalty settlement, programmable splits, timelocked escrows, and embeddable widgets.
* **Live Interactive Widget Demo:** Demonstrates instant simulated and on-chain checkouts directly on the landing page.

### 2. 🏛️ Kiosk Maintainer Dashboard (`KioskManager`)
* **Account-Isolated Kiosk State:** Every connected Stellar wallet manages its own isolated Soroban Kiosk instance.
* **Live Empty-State & Initialization:** If an account is new, it presents an honest empty state with a one-click **"Initialize Soroban Kiosk"** modal allowing the user to configure:
  * Kiosk Name & Description
  * Settlement Asset (`Native XLM` or `Stellar USDC`)
* **Asset Vault & Listings:**
  * Add digital assets (Developer Passes, API Licenses, Collectibles, Badges).
  * Assign prices, icons, and real-time statuses (`AVAILABLE`, `IN_ESCROW`, `SETTLED`).
  * Instant delisting / removal controls.
* **Live Analytics & Contract Badges:** Displays Total Sales Volume, Stored Asset Count, Contract UID, and Deployment status.

### 3. 🛡️ Transfer Policy Engine (`PolicyEngine`)
* **Granular Royalty Enforcement:** Configure minimum royalty percentages (in basis points, e.g., `500 bps = 5.0%`).
* **Multi-Recipient Upstream Splits:** Split secondary sale royalties across multiple addresses (e.g., Protocol Treasury, Community Funds, DAO addresses).
* **Escrow Modes & Timelocks:**
  * `INSTANT`: Atomic ledger settlement upon buyer signature.
  * `TIMELOCKED`: Enforces a configurable escrow delay (e.g., 24 hours) with dispute buffer.
* **Live Fee Calculator:** Real-time preview of Seller Payout, Creator Royalty, and Upstream Splits before saving on-chain.

### 4. 🛒 Soroban Escrow Marketplace (`Marketplace`)
* **Catalog Browsing:** Filter and view all active listings stored in the kiosk vault.
* **Multi-Step Escrow Checkout Modal:**
  1. *Review Stage:* Item price, creator royalty breakdown, and upstream recipient verification.
  2. *Signing Stage:* Freighter signature simulation/prompt.
  3. *Settling Stage:* Atomic Soroban settlement and token transfer.
  4. *Done Stage:* Transaction receipt with generated Soroban transaction hash and explorer links.
* **Double-Click & Race Condition Protected:** Synchronous execution guards prevent duplicate purchases or double deductions.

### 5. 🧩 Embeddable Checkout Widget Configurator (`WidgetCustomizer`)
* **WYSIWYG Widget Builder:**
  * Dark & Light theme toggles.
  * Custom hex accent color picker.
  * Configurable button labels, border radius, and preview cards.
* **Multi-Platform Code Export:**
  * **React Component:** `@stellarkiosk/widget` drop-in code snippet.
  * **HTML Web Component:** `<stellar-kiosk-button>` standalone script.
  * **Iframe Embed:** Responsive cross-origin embed code.

### 6. 💼 Stellar Community Fund (SCF) Proposal View (`GrantProposal`)
* Full formatted grant application export for **Stellar Community Fund / Drips Wave**:
  * Project Overview, Problem Statement, and Solution Architecture.
  * Technical Milestones (Soroban Contracts, Dashboard, SDK, Documentation).
  * Budget breakdown with detailed category percentages.
  * One-click **"Export Full Proposal"** to clipboard for grant submission.

### 7. 👛 Freighter Wallet & Network Management (`TopBar`)
* **Freighter API Integration:** Connects seamlessly to `@stellar/freighter-api`.
* **Live Horizon RPC Sync:** Real-time query to Stellar Horizon for public key existence, sequence numbers, and live XLM balances.
* **Testnet & Mainnet Switcher:**
  * One-click network switcher dropdown.
  * Sequence-guarded async fetch prevents out-of-order race conditions.
  * Gracefully handles unfunded accounts without throwing red 404 errors in DevTools.
  * Bottom-right floating toast notification provides immediate feedback during network transitions.
* **Testnet Faucet Funding:** Automatic detection of unfunded testnet accounts with a one-click **"Fund with 10,000 Testnet XLM via Friendbot"** button.
* **Simulated Sandbox Fallback:** Reviewers without the Freighter extension can click **"Continue with Simulated Demo Account"** to test the entire suite instantly.

### 8. 🦀 Rust Soroban Smart Contracts (`contracts/kiosk`)
* **Live Testnet Contract:** [`CDP5VMLME3NOXC7G3ZFRBGUMXNGIDYG7IMKBZLS4KPAZCVB6SSY4O2EG`](https://stellar.expert/explorer/testnet/contract/CDP5VMLME3NOXC7G3ZFRBGUMXNGIDYG7IMKBZLS4KPAZCVB6SSY4O2EG)
* **Contract Admin / Deployer:** `GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X`
* **Initialization Tx:** [`de9de343e30af1fdb7d2d08e2edf1ddd887faa137ca31f164a45f6c12a7cb6ed`](https://stellar.expert/explorer/testnet/tx/de9de343e30af1fdb7d2d08e2edf1ddd887faa137ca31f164a45f6c12a7cb6ed)
* **On-Chain Listing Tx:** [`9ea828c0f151913665dcbec160da0bff12c7a7d7476f9d7f5120e912efa01702`](https://stellar.expert/explorer/testnet/tx/9ea828c0f151913665dcbec160da0bff12c7a7d7476f9d7f5120e912efa01702)
* **`initialize`:** Sets owner address, default royalty basis points, royalty recipient, and floor price.
* **`set_policy`:** Updates policy rules with `caller.require_auth()` owner protection.
* **`place_and_list`:** Places an asset in persistent storage, validates floor price, and publishes a `(KIOSK, "listed")` event.
* **`delist`:** Seller-authorized delisting.
* **`purchase`:** Atomically transfers payment token from buyer to seller and royalty recipient using Soroban `token::Client`, marks item unlisted, and emits `(KIOSK, "bought")`.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technologies |
| :--- | :--- |
| **Smart Contracts** | Rust, Soroban SDK (`soroban-sdk 21.7.7`), WebAssembly (`wasm32v1-none`), Stellar CLI 27.0 |
| **Deployed Testnet Contract** | [`CDP5VMLME3NOXC7G3ZFRBGUMXNGIDYG7IMKBZLS4KPAZCVB6SSY4O2EG`](https://stellar.expert/explorer/testnet/contract/CDP5VMLME3NOXC7G3ZFRBGUMXNGIDYG7IMKBZLS4KPAZCVB6SSY4O2EG) |
| **Frontend Framework** | React 18, TypeScript, Vite, Tailwind CSS |
| **Stellar SDKs** | `@stellar/stellar-sdk` (v17.2.1), `@stellar/freighter-api` (v6.0.1) |
| **UI & Icons** | Lucide React Icons, Glassmorphism UI Token System |
| **Testing** | Vitest (v2.1.8), `@testing-library/react`, `jsdom` |
| **Protocol Storage** | Pure decentralized ledger & Horizon/Soroban RPC client (`src/lib/soroban.ts`, `src/lib/kiosk.ts`) |

---

## 📂 Complete Project Structure

```text
kiosk/
├── contracts/
│   └── kiosk/               # Soroban Smart Contract (Rust)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs       # Contract methods (initialize, list, purchase, delist, policy)
│           ├── types.rs     # Data structures (ListingItem, TransferPolicy, DataKey)
│           └── test.rs      # Soroban unit test suite
├── Cargo.toml               # Cargo workspace root
├── src/
│   ├── components/
│   │   ├── ConnectModal.tsx # Freighter detection & Simulated account selector
│   │   ├── TopBar.tsx       # Navigation, Network toggle, Live wallet dropdown & toasts
│   │   └── ui.tsx           # Glassmorphism design system (Panel, StatCard, Badge, Button, Modal, Input)
│   ├── context/
│   │   └── WalletContext.tsx # Centralized wallet, Freighter listeners, Horizon RPC & sequence guards
│   ├── lib/
│   │   ├── kiosk.ts         # Account-isolated protocol client (kiosks, items, policies, widgets, txs)
│   │   └── stellar.ts       # Horizon server endpoints, Friendbot faucet, payout math & helpers
│   ├── test/
│   │   ├── setup.ts         # Vitest environment & Freighter API mocks
│   │   └── WalletFlow.test.tsx # Integration tests for wallet connection and network toggle
│   ├── views/
│   │   ├── GrantProposal.tsx # SCF Season 23 proposal export viewer
│   │   ├── KioskManager.tsx  # Maintainer vault, asset listing & contract init
│   │   ├── LandingPage.tsx   # Product landing page, interactive protocol diagrams & demos
│   │   ├── Marketplace.tsx   # Multi-step escrow checkout & transaction ledger
│   │   ├── PolicyEngine.tsx  # Royalty split builder, upstream recipients & timelock modes
│   │   └── WidgetCustomizer.tsx # Embeddable button configurator with React/HTML/iframe export
│   ├── App.tsx              # Main application router (Landing vs. Dashboard views)
│   ├── index.css            # Custom theme styles, scanlines, animations & fonts
│   └── main.tsx             # React DOM entry point
├── .github/
│   └── ISSUES.md            # 800+ lines of contributor issues tagged by difficulty & sprint
├── dist/                    # Production build output
├── package.json             # NPM dependencies and scripts
├── tailwind.config.js       # Curated Web3 palette (obsidian, cyan, emerald, amber, rose)
└── vite.config.ts           # Vite build configuration with path aliases
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or later
- **npm** or **pnpm**
- *(Optional for Soroban development)*: **Rust** with `wasm32-unknown-unknown` target and `soroban-cli`

### 1. Run the Frontend Locally

```bash
# Clone the repository
git clone https://github.com/Najite/kiosk.git
cd kiosk

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Run Tests & Validation

```bash
# Run Vitest test suite
npx vitest run

# Validate TypeScript & build production bundle
npm run build
```

### 3. Build & Test Soroban Contracts

```bash
# Compile Soroban contracts to WebAssembly
cargo build --target wasm32-unknown-unknown --release

# Run Rust unit tests
cargo test -p kiosk
```

---

## 🔒 Security & Decentralization Commitments

1. **Non-Custodial Design:** Items remain tied to the creator's kiosk until the exact atomic criteria specified by the `TransferPolicy` are satisfied.
2. **Zero Centralized Storage:** There are no backend API servers, centralized relational databases, or administrative custody keys.
3. **Graceful Network Handling:** Unfunded accounts on Mainnet or Testnet are handled with clean Horizon RPC logic without console errors or unhandled promises.
4. **Race-Condition Safeguards:** Network state changes and purchase submissions utilize monotonic sequence counters and synchronous locks to prevent out-of-order state overwrites.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
