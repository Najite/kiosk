# Contributing to StellarKiosk

Thank you for your interest in contributing to **StellarKiosk**! We welcome open-source contributions from developers and Stellar ecosystem builders.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:

1. **Rust & Cargo**: Latest stable Rust toolchain (`rustc --version`)
2. **Wasm Target for Soroban**:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
3. **Stellar CLI** (optional for deployment & invocation):
   ```bash
   cargo install --locked stellar-cli --features opt
   ```

---

## 🚀 Quickstart for Local Development

### 1. Clone the repository
```bash
git clone https://github.com/luxver/kiosk.git
cd kiosk
```

---

## 🧪 Testing & Verification Suite

All PRs must pass the automated verification suite before being merged:

### Smart Contract Verification
```bash
# Code formatting check
cargo fmt --check

# Linter checks (zero warnings allowed)
cargo clippy --all-targets --all-features -- -D warnings

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
3. **Keep Tests Green**: Ensure `cargo test` passes cleanly.
4. **No Unused Code**: Avoid unused imports or orphan functions.
5. **Open a PR**: Submit your pull request against `main` with a clear explanation of changes, testing steps, and relevant issue references.

