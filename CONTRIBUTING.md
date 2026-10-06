# Contributing to StellarKiosk

Thank you for your interest in contributing to **StellarKiosk**! We welcome open-source contributions from developers, designers, and Stellar ecosystem builders.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Node.js**: Version 20.x or later (`node -v`)
2. **npm**: Version 10.x or later (`npm -v`)
3. **Rust & Cargo**: Latest stable Rust toolchain (`rustc --version`)
4. **Wasm Target for Soroban**:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
5. **Freighter Wallet Extension**:
   - Install [Freighter](https://www.freighter.app/) in your browser.
   - Switch Freighter's network selector to **Test Net**.
   - Fund your Testnet address using [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test) or via the in-app funding button.

---

## 🚀 Quickstart for Local Development

### 1. Clone the repository
```bash
git clone https://github.com/Najite/kiosk.git
cd kiosk
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the local frontend dev server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification Suite

All PRs must pass the automated verification suite before being merged:

### Frontend Verification
```bash
# Type check TypeScript code
npm run typecheck

# Run linter
npm run lint

# Run Vitest unit tests
npm test

# Test production build
npm run build
```

### Smart Contract Verification
```bash
# Check contract compilation
cargo check --manifest-path contracts/kiosk/Cargo.toml --tests

# Run Soroban unit tests
cargo test --manifest-path contracts/kiosk/Cargo.toml
```

---

## 🦀 Smart Contract Development (`contracts/kiosk`)

The Soroban smart contract is written in Rust using `soroban-sdk v21`.

- **Source Code**: `contracts/kiosk/src/lib.rs`
- **Data Types**: `contracts/kiosk/src/types.rs`
- **Unit Tests**: `contracts/kiosk/src/test.rs`

### Building the Contract WASM
```bash
cargo build --manifest-path contracts/kiosk/Cargo.toml --target wasm32-unknown-unknown --release
```

---

## 📋 Pull Request Guidelines

1. **Fork and Branch**: Create a descriptive feature branch from `main` (e.g. `feat/payout-boundary-check` or `fix/empty-account-retry`).
2. **Atomic Commits**: Keep commits concise and meaningful.
3. **Keep Tests Green**: Ensure `npm run typecheck`, `npm run lint`, `npm test`, and `cargo test` pass cleanly.
4. **No Unused Code**: Avoid unused imports or orphan functions.
5. **Open a PR**: Submit your pull request against `main` with a clear explanation of changes, testing steps, and relevant issue references.
