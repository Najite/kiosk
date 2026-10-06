# StellarKiosk — Wave Program Issues

> Scoped, contributor-ready tasks for the StellarKiosk sprint cycles.
> Each issue is tagged with category, difficulty, and estimated effort so contributors can self-select.

## Issue Categories

| Tag | Category | Description |
|-----|----------|-------------|
| `bug` | Bug Fix | Something broken or behaving incorrectly |
| `feature` | New Feature | Net-new functionality |
| `enhancement` | Enhancement | Improvement to existing functionality |
| `a11y` | Accessibility | WCAG compliance, keyboard nav, screen reader support |
| `docs` | Documentation | README, code comments, inline docs |
| `testing` | Testing | Unit tests, integration tests, E2E |
| `security` | Security | Vulnerability fixes, input validation, hardening |
| `refactor` | Refactor | Code quality, structure, tech debt |
| `infra` | Infrastructure | Build, CI/CD, tooling, dependencies |

## Difficulty Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Good First Issue | No prior StellarKiosk knowledge needed, isolated change |
| 2 | Easy | Small scope, clear acceptance criteria |
| 3 | Medium | Touches multiple files, requires understanding of data flow |
| 4 | Hard | Cross-cutting, architectural, or requires Stellar/Soroban knowledge |
| 5 | Expert | Deep protocol knowledge, smart contract development, or security-critical |

---

## Sprint 1 — Stabilization & Bug Fixes

### SK-001 · `bug` · L2 · Easy
**Unused imports across multiple views**

**Description:** Several files import symbols that are never referenced in the component, inflating the bundle and triggering lint warnings.

- `src/views/WidgetCustomizer.tsx` — imports `Button` from `@/components/ui` but never uses it
- `src/views/KioskManager.tsx` — imports `shortAddress` from `@/lib/stellar` but never uses it
- `src/views/GrantProposal.tsx` — imports `ArrowRight` from `lucide-react` but never uses it
- `src/views/Marketplace.tsx` — imports `ExternalLink` and `Sparkles` from `lucide-react` but never uses them

**Acceptance criteria:**
- Remove all unused imports
- `npm run lint` passes with no warnings
- `npm run build` succeeds

---

### SK-002 · `bug` · L2 · Easy
**Policy save error state and Soroban RPC failure handling**

**Description:** In `PolicyEngine.tsx`, when updating on-chain policies, network or wallet signature rejections need clear error notifications rather than failing silently.

**Acceptance criteria:**
- `setSaved(true)` only fires on successful on-chain transaction confirmation
- On error (rejected in Freighter or rejected by Soroban RPC), display a clear error alert
- Add an `error` banner that displays for 4 seconds on failure
- Automatically re-enable save button after error

**Files:** `src/views/PolicyEngine.tsx`

---

### SK-003 · `bug` · L2 · Easy
**Kiosk delist requires confirmation dialog and on-chain Soroban delist call**

**Description:** `deleteItem()` in `KioskManager.tsx` currently only updates local state without invoking `delist` on the Soroban smart contract. There is also no confirmation dialog before removing an item.

**Acceptance criteria:**
- Add a confirmation modal before deleting ("Delist this asset? It will be marked unlisted on Soroban.")
- Invoke `client.delist` on the Soroban smart contract with the seller's wallet authorization
- On error, keep item listed and show an error banner
- On success, update item status to delisted in UI

**Files:** `src/views/KioskManager.tsx`, `src/lib/soroban.ts`

---

### SK-004 · `bug` · L2 · Easy
**InitModal renders literal `{TESTNET}` instead of the network value**

**Description:** In `KioskManager.tsx`, the `InitModal` component contains the string `` {`{TESTNET}`} `` which renders the literal text `{TESTNET}` instead of the actual selected network (e.g. "TESTNET" or "MAINNET").

**Acceptance criteria:**
- Pass the current network from `useWallet()` into `InitModal`
- Render the actual network name in the description text
- Test with both TESTNET and MAINNET selected

**Files:** `src/views/KioskManager.tsx`

---

### SK-005 · `bug` · L3 · Medium
**Royalty + upstream split can exceed 100%, producing negative seller payout**

**Description:** In `PolicyEngine.tsx`, the royalty slider goes up to 2500 bps (25%) and the upstream slider goes up to 3000 bps (30%). Combined, they can total 5500 bps (55%) — and there's no guard preventing this. The `calculatePayouts()` function in `stellar.ts` will then produce a negative `sellerPayout`, and the payout preview will display a negative percentage.

**Acceptance criteria:**
- Add validation: `min_royalty_bps + upstream_split_bps` must not exceed 9000 bps (90%)
- When the user tries to exceed the cap, clamp the active slider and show a warning message
- Add a guard in `calculatePayouts()` to return 0 for `sellerPayout` if the result would be negative
- Show a visible warning badge in the payout preview when combined splits exceed 80%

**Files:** `src/views/PolicyEngine.tsx`, `src/lib/stellar.ts`

---

### SK-006 · `bug` · L2 · Easy
**clipboard.writeText calls have no error handling**

**Description:** Multiple components call `navigator.clipboard.writeText()` without a `.catch()`. In browsers where the Clipboard API is unavailable or denied (e.g. insecure contexts, iframe sandboxes), this throws an unhandled promise rejection.

**Affected files:**
- `src/views/KioskManager.tsx` — `copyContract()`
- `src/views/GrantProposal.tsx` — `copyAll()`
- `src/views/WidgetCustomizer.tsx` — `copyToClipboard()`

**Acceptance criteria:**
- Wrap all clipboard calls in try/catch
- On failure, show a fallback message ("Copy failed — select and copy manually")
- Extract a shared `copyToClipboard()` utility into `src/lib/stellar.ts` or a new `src/lib/clipboard.ts`

**Files:** `src/views/KioskManager.tsx`, `src/views/GrantProposal.tsx`, `src/views/WidgetCustomizer.tsx`

---

### SK-007 · `bug` · L3 · Medium
**Stored item icon is never rendered — grid always shows Layers icon**

**Description:** When adding a new item in `KioskManager.tsx`, the form stores a `newItem.icon` value (defaulting to `'Package'`), but the item grid always renders a hardcoded `<Layers>` icon regardless of the stored value. The icon field is effectively dead data.

**Acceptance criteria:**
- Map stored icon names to actual Lucide icon components (create an icon registry)
- Render the correct icon per item in the grid
- Add an icon picker to the "Add Item" modal so maintainers can choose from a curated set
- Update the marketplace grid in `Marketplace.tsx` to use the same icon registry

**Files:** `src/views/KioskManager.tsx`, `src/views/Marketplace.tsx`, new `src/lib/iconRegistry.ts`

---

## Sprint 2 — Error Handling & Resilience

### SK-010 · `enhancement` · L3 · Medium
**Add error states to all Soroban data-loading views**

**Description:** Every view that loads on-chain data (`KioskManager`, `PolicyEngine`, `WidgetCustomizer`, `Marketplace`) has a loading spinner but lacks a visible error state. If Soroban RPC or Horizon calls fail or timeout, views should gracefully inform the user.

**Acceptance criteria:**
- Add an `error` state to each view's data-loading flow
- On RPC failure or timeout, render a reusable `ErrorState` component with error details and a "Retry" button
- The "Retry" button re-executes the load query
- Display clear troubleshooting hints (e.g., check Testnet connection or Friendbot funding)
- Add the `ErrorState` component to `src/components/ui.tsx`

**Files:** `src/views/KioskManager.tsx`, `src/views/PolicyEngine.tsx`, `src/views/WidgetCustomizer.tsx`, `src/views/Marketplace.tsx`, `src/components/ui.tsx`

---

### SK-011 · `enhancement` · L3 · Medium
**Add a React error boundary with fallback UI**

**Description:** `App.tsx` has no error boundary. Any unhandled exception in any view crashes the entire app to a blank white screen with no recovery path.

**Acceptance criteria:**
- Create an `ErrorBoundary` component in `src/components/ErrorBoundary.tsx`
- Wrap the main content area in `App.tsx` with the boundary
- Fallback UI shows: error message, "Reload Dashboard" button, "Back to Landing" button
- Log errors to console for debugging (no external error tracking in this issue)
- Test by temporarily throwing in a view and verifying the fallback renders

**Files:** new `src/components/ErrorBoundary.tsx`, `src/App.tsx`

---

### SK-012 · `enhancement` · L2 · Easy
**Add loading prop to Button component**

**Description:** The `Button` component in `ui.tsx` has no `loading` prop. Views currently fake it by swapping `disabled` + text (e.g. "Deploying..." in PolicyEngine). This is inconsistent across the app.

**Acceptance criteria:**
- Add `loading?: boolean` prop to `Button`
- When `loading` is true: show a spinner icon, disable the button, set `aria-busy="true"`
- Keep the button's existing children but prepend the spinner
- Update `PolicyEngine.tsx` save button to use the new `loading` prop
- Update `KioskManager.tsx` initialize button to use the new `loading` prop

**Files:** `src/components/ui.tsx`, `src/views/PolicyEngine.tsx`, `src/views/KioskManager.tsx`

---

### SK-013 · `enhancement` · L2 · Easy
**Add error feedback to initializeKiosk and addItem in KioskManager**

**Description:** `initializeKiosk()` and `addItem()` in `KioskManager.tsx` check `if (!error && data)` but do nothing on error — the user gets no feedback that the operation failed.

**Acceptance criteria:**
- On `initializeKiosk` error: keep the modal open, show an error message inside the modal
- On `addItem` error: keep the modal open, show an error message inside the modal
- Add a transient error banner that auto-dismisses after 4 seconds
- Add loading state to both operations (disable the submit button while in-flight)

**Files:** `src/views/KioskManager.tsx`

---

### SK-014 · `security` · L3 · Medium
**Add input validation for prices, basis points, and Stellar addresses**

**Description:** Multiple forms accept user input without validation:

- `KioskManager` — item price allows negative or zero values, no max length on title/description
- `PolicyEngine` — recipient `shareBps` has no upper bound (can exceed 10000), no check that shares sum to 100%, no Stellar address format validation
- `WidgetCustomizer` — accent color text field accepts non-hex strings, button text has no length cap, border radius `parseInt` has no NaN guard

**Acceptance criteria:**
- **Prices:** must be > 0, max 1,000,000. Show inline error on invalid.
- **Basis points:** each recipient share 0–10000, total shares must not exceed `upstream_split_bps`. Show inline error.
- **Stellar addresses:** must match pattern `^G[A-Z0-9]{55}$`. Show inline error on mismatch.
- **Accent color:** must match `^#[0-9A-Fa-f]{6}$`. Show inline error.
- **Button text:** max 40 characters. Show character count.
- **Border radius:** must parse to integer 0–24. Fallback to 12 on NaN.
- Create a shared validation utility in `src/lib/validation.ts`

**Files:** new `src/lib/validation.ts`, `src/views/KioskManager.tsx`, `src/views/PolicyEngine.tsx`, `src/views/WidgetCustomizer.tsx`

---

## Sprint 3 — Accessibility

### SK-020 · `a11y` · L3 · Medium
**Make Modal accessible: role, focus trap, Escape key, aria-modal**

**Description:** The `Modal` component in `ui.tsx` lacks:
- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to the title
- Focus trap (focus can leave the modal and go behind the backdrop)
- Escape key handler to close
- Focus restoration to the trigger element on close
- The close "×" button has no `aria-label`

**Acceptance criteria:**
- Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Implement focus trap: Tab cycles within modal only
- Pressing Escape closes the modal
- On close, focus returns to the element that opened the modal
- Close button has `aria-label="Close dialog"`
- Test with keyboard only (no mouse)

**Files:** `src/components/ui.tsx`

---

### SK-021 · `a11y` · L2 · Easy
**Link Label and Input components with htmlFor / id**

**Description:** The `Label` component has no `htmlFor` prop, and `Input` has no `id` prop. This means labels and inputs are never programmatically linked, breaking screen reader association across every form in the app.

**Acceptance criteria:**
- Add `htmlFor?: string` prop to `Label`
- Add `id?: string` prop to `Input`
- Update all forms in `KioskManager`, `PolicyEngine`, and `WidgetCustomizer` to pass matching `htmlFor`/`id` pairs
- Verify with a screen reader that labels are announced when focusing inputs

**Files:** `src/components/ui.tsx`, `src/views/KioskManager.tsx`, `src/views/PolicyEngine.tsx`, `src/views/WidgetCustomizer.tsx`

---

### SK-022 · `a11y` · L2 · Easy
**Add aria-labels to icon-only buttons**

**Description:** Multiple buttons across the app contain only an icon with no text, making them invisible to screen readers:

- `KioskManager` — delete item button (Trash2 icon, also `opacity-0` until hover)
- `KioskManager` — copy contract button (Copy icon)
- `WidgetCustomizer` — color swatch buttons, device toggle buttons, copy button
- `GrantProposal` — section nav buttons lack `aria-pressed`/`aria-current`
- `PolicyEngine` — remove recipient button (Trash2 icon)

**Acceptance criteria:**
- Add `aria-label` to every icon-only button
- Make delete buttons visible by default (not `opacity-0` until hover) — use a subtle style instead
- Add `aria-pressed` to toggle-style buttons (theme, device, section nav)
- Add `aria-label` to all range sliders (currently unlabeled)

**Files:** `src/views/KioskManager.tsx`, `src/views/WidgetCustomizer.tsx`, `src/views/GrantProposal.tsx`, `src/views/PolicyEngine.tsx`

---

### SK-023 · `a11y` · L2 · Easy
**Add Toggle role="switch" and aria-checked**

**Description:** The `Toggle` component in `ui.tsx` is a `<button>` that visually represents a switch but has no `role="switch"` or `aria-checked` attribute. Screen readers announce it as a generic button with no state information.

**Acceptance criteria:**
- Add `role="switch"` to the button element
- Add `aria-checked={checked}`
- Add `aria-label` when the `label` prop is provided
- Ensure keyboard Space/Enter toggles the state (already works as a button, just verify)

**Files:** `src/components/ui.tsx`

---

### SK-024 · `a11y` · L2 · Easy
**Add skip-to-content link and semantic landmarks**

**Description:** `App.tsx` has no skip-to-content link for keyboard users, and view changes have no `aria-live` announcement.

**Acceptance criteria:**
- Add a visually-hidden "Skip to content" link at the top of both the landing page and dashboard, visible on focus
- Ensure `<main>` has `id="main-content"` as a skip target
- Add an `aria-live="polite"` region that announces view changes in the dashboard (e.g. "Kiosk Manager view loaded")
- Add `scope="col"` to all `<th>` elements in tables (Marketplace, GrantProposal comparison)
- Add `<caption>` to data tables

**Files:** `src/App.tsx`, `src/views/LandingPage.tsx`, `src/views/Marketplace.tsx`, `src/views/GrantProposal.tsx`

---

## Sprint 4 — Feature Enhancements

### SK-030 · `feature` · L3 · Medium
**Add multi-kiosk support**

**Description:** The entire app assumes a single kiosk — all views query `kiosks` with `.limit(1).maybeSingle()`. The database schema supports multiple kiosks, but the UI has no kiosk selector or multi-kiosk management.

**Acceptance criteria:**
- Add a kiosk selector dropdown in the TopBar (next to the brand)
- `KioskManager` shows all kiosks owned by the connected wallet address
- Add a "Create New Kiosk" flow in `KioskManager`
- All views filter by the selected kiosk ID
- Store the active kiosk ID in component state, passed via context or props
- The widget customizer generates code snippets with the correct kiosk ID

**Files:** `src/App.tsx`, `src/components/TopBar.tsx`, `src/views/KioskManager.tsx`, all view files, new `src/context/KioskContext.tsx`

---

### SK-031 · `feature` · L3 · Medium
**Add live Soroban event polling for marketplace transactions**

**Description:** The Marketplace transaction ledger currently updates on page load or after a local purchase. It does not reflect transactions executed by other buyers on Testnet.

**Acceptance criteria:**
- Poll Soroban Testnet RPC for new `KIOSK` events emitted on the contract
- Parse `bought` and `listed` events from Soroban ledger
- Automatically append new confirmed on-chain transactions to the ledger without page refresh
- Show a subtle animation when a new transaction event appears
- Clean up the polling timer on component unmount

**Files:** `src/views/Marketplace.tsx`, `src/lib/soroban.ts`

---

### SK-032 · `feature` · L3 · Medium
**Add export/download for grant proposal as Markdown file**

**Description:** The SCF Grant Proposal view's "Export Full Proposal" button only copies to clipboard. Contributors and maintainers need a downloadable Markdown file for submission.

**Acceptance criteria:**
- Add a "Download as Markdown" button next to the existing "Export" button
- Generate a well-formatted `.md` file with all sections, comparison table (as Markdown table), milestones, and budget
- Trigger a browser download with filename `stellarkiosk-scf-proposal.md`
- Keep the existing copy-to-clipboard functionality

**Files:** `src/views/GrantProposal.tsx`

---

### SK-033 · `feature` · L3 · Medium
**Add multi-sig signer configuration UI in PolicyEngine**

**Description:** The `MULTISIG` escrow mode has no UI for configuring which addresses are required signers. Users can select the mode but cannot specify who needs to sign.

**Acceptance criteria:**
- When `MULTISIG` mode is selected, show a signer configuration panel
- Allow adding/removing signer Stellar addresses (similar to upstream recipients UI)
- Store signers in the policy structure
- Show required signer count and current signer list in the marketplace checkout modal
- Display pending multi-sig transactions in the transaction ledger with an "Awaiting signatures" status

**Files:** `src/views/PolicyEngine.tsx`, `src/views/Marketplace.tsx`

---

### SK-034 · `feature` · L2 · Easy
**Add transaction detail modal in Marketplace ledger**

**Description:** The transaction ledger table shows truncated tx hashes and short addresses. Users cannot click a row to see full details.

**Acceptance criteria:**
- Make each transaction row clickable
- Open a modal showing: full tx hash (with copy), full buyer/seller addresses, complete payout breakdown, ledger timestamp, status, and a "View on Stellar Expert" link
- Add hover state to rows to indicate clickability

**Files:** `src/views/Marketplace.tsx`

---

### SK-035 · `feature` · L2 · Easy
**Add search and filter to the Marketplace**

**Description:** The Marketplace has no search or filtering. As the number of listed items grows, users need a way to find specific assets.

**Acceptance criteria:**
- Add a search input that filters items by title and description (debounced)
- Add filter dropdowns for: asset type (License, Pass, Token, Collectible), status (Available, In Escrow, Settled), price range (min/max)
- Show "No results" state when filters match nothing
- Add a "Clear filters" button

**Files:** `src/views/Marketplace.tsx`

---

### SK-036 · `feature` · L2 · Easy
**Persist wallet connection across page reloads**

**Description:** The simulated wallet connection in `WalletContext.tsx` is lost on every page refresh. The address is stored only in React state.

**Acceptance criteria:**
- On `connect()`, store the generated address in `localStorage` under key `stellarkiosk_wallet`
- On mount, check `localStorage` and restore the session if present
- On `disconnect()`, clear `localStorage`
- Also persist the selected network (TESTNET/MAINNET)
- Add a comment noting this is a simulation and real wallet integration will replace this

**Files:** `src/context/WalletContext.tsx`

---

## Sprint 5 — Testing

### SK-040 · `testing` · L3 · Medium
**Add unit tests for stellar.ts utility functions**

**Description:** `src/lib/stellar.ts` contains core business logic — payout calculations, formatting, address generation — with zero test coverage.

**Acceptance criteria:**
- Set up Vitest (install `vitest` + `@testing-library/react` as dev dependencies)
- Add `vitest.config.ts` configuration
- Test `calculatePayouts()`: normal case, zero royalty, zero upstream, edge case where splits total 100%
- Test `bpsToPercent()`: 0 bps, 1000 bps, 2500 bps
- Test `formatTokenAmount()`: integer, decimal, zero, large number
- Test `formatTimeAgo()`: seconds, minutes, hours, days
- Test `formatDuration()`: 0, under 1h, under 24h, over 24h
- Test `shortAddress()`: normal, too-short input, empty string
- All tests pass with `npm run test`

**Files:** new `vitest.config.ts`, new `src/lib/__tests__/stellar.test.ts`

---

### SK-041 · `testing` · L3 · Medium
**Add unit tests for validation utilities**

**Description:** Once `src/lib/validation.ts` is created (SK-014), it needs test coverage since it guards all user input.

**Acceptance criteria:**
- Test price validation: valid, zero, negative, over max, non-numeric
- Test bps validation: valid, over 10000, negative, non-integer
- Test Stellar address validation: valid G..., lowercase, wrong length, empty
- Test hex color validation: valid #RRGGBB, missing #, wrong length, invalid chars
- Test button text length: under cap, at cap, over cap, empty
- Test border radius: valid, NaN, over 24, negative
- All tests pass with `npm run test`

**Depends on:** SK-014

**Files:** new `src/lib/__tests__/validation.test.ts`

---

### SK-042 · `testing` · L4 · Hard
**Add integration tests for Kiosk state and Soroban RPC simulation**

**Description:** Add automated integration tests verifying contract state queries, RPC transaction building, and split calculations.

**Acceptance criteria:**
- Test kiosk initialization flow: initialize on-chain → verify state
- Test item listing simulation: build `place_and_list` transaction → verify simulation success and returned ID
- Test policy save simulation: build `set_policy` transaction → verify policy parameters
- Test purchase transaction simulation: build `purchase` transaction with buyer address
- Test payout calculation pure functions against known edge cases (zero royalty, 100% split threshold, rounding)
- All tests pass with `npm test`

**Files:** new `src/test/integration/` directory with test files per workflow

---

### SK-043 · `testing` · L2 · Easy
**Add test for calculatePayouts edge case: negative seller payout**

**Description:** `calculatePayouts()` can return a negative `sellerPayout` when royalty + upstream exceed the total amount. This should be guarded.

**Acceptance criteria:**
- Write a test that calls `calculatePayouts(100, 6000, 5000)` (110% total split)
- Verify that `sellerPayout` is 0, not -100
- This test should initially fail, then pass after SK-005 fixes the function
- Add a test comment explaining the business rule: total splits must not exceed 100%

**Depends on:** SK-005 (for the fix), or can be written first as a failing test (TDD)

**Files:** new `src/lib/__tests__/stellar.test.ts`

---

## Sprint 6 — Refactoring & Code Quality

### SK-050 · `refactor` · L3 · Medium
**Extract shared data-loading hook (useKioskData)**

**Description:** Every view (`KioskManager`, `PolicyEngine`, `WidgetCustomizer`, `Marketplace`) independently loads the kiosk and its related data with nearly identical `useCallback` + `useEffect` patterns. This is duplicated logic.

**Acceptance criteria:**
- Create a `useKioskData()` hook in `src/hooks/useKioskData.ts`
- The hook loads: kiosk, items, policies, transactions, widget config
- Returns `{ kiosk, items, policies, transactions, widgetConfig, loading, error, refetch }`
- All four views use this hook instead of their own load functions
- Remove duplicated load logic from each view
- Verify all views still function identically

**Files:** new `src/hooks/useKioskData.ts`, `src/views/KioskManager.tsx`, `src/views/PolicyEngine.tsx`, `src/views/WidgetCustomizer.tsx`, `src/views/Marketplace.tsx`

---

### SK-051 · `refactor` · L2 · Easy
**Extract reusable clipboard utility**

**Description:** Three views independently implement clipboard copy logic with the same pattern. This should be a shared utility.

**Acceptance criteria:**
- Create `src/lib/clipboard.ts` with a `copyToClipboard(text: string): Promise<boolean>` function
- Handles try/catch, returns true on success, false on failure
- Update `KioskManager`, `WidgetCustomizer`, and `GrantProposal` to use the shared utility
- Remove inline clipboard implementations

**Files:** new `src/lib/clipboard.ts`, `src/views/KioskManager.tsx`, `src/views/WidgetCustomizer.tsx`, `src/views/GrantProposal.tsx`

---

### SK-052 · `refactor` · L3 · Medium
**Add lazy loading and code splitting for dashboard views**

**Description:** `App.tsx` eagerly imports all five dashboard views plus the landing page. The production bundle is a single 396KB JS file. Code-splitting would improve initial load time significantly.

**Acceptance criteria:**
- Use `React.lazy()` to lazy-load each dashboard view
- Wrap lazy views in `<Suspense>` with a shared loading fallback
- The landing page stays eagerly loaded (it's the first thing users see)
- Verify the production build produces separate chunks per view
- Add a route-level loading indicator

**Files:** `src/App.tsx`

---

### SK-053 · `refactor` · L2 · Easy
**Extract hardcoded constants into a config file**

**Description:** Multiple values are hardcoded across the codebase that should be centralized for easier maintenance.

**Acceptance criteria:**
- Create `src/lib/config.ts` exporting:
  - `ASSET_TYPES = ['License', 'Pass', 'Token', 'Collectible']`
  - `SETTLEMENT_TOKENS = ['XLM', 'USDC']`
  - `ESCROW_MODES = ['INSTANT', 'TIMELOCK', 'MULTISIG']`
  - `MAX_ROYALTY_BPS = 2500`
  - `MAX_UPSTREAM_BPS = 3000`
  - `MAX_TOTAL_SPLIT_BPS = 9000`
  - `TIMELOCK_RANGE = { min: 3600, max: 604800, step: 3600 }`
  - `WIDGET_PRESET_COLORS = ['#00E5FF', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6']`
  - `WIDGET_CDN_URL = 'https://cdn.stellarkiosk.io/widget.js'`
  - `WIDGET_EMBED_URL = 'https://widget.stellarkiosk.io/embed'`
- Update all views to import from config instead of inlining values

**Files:** new `src/lib/config.ts`, all view files

---

### SK-054 · `refactor` · L4 · Hard
**Replace simulated wallet with real Freighter integration**

**Description:** `WalletContext.tsx` simulates wallet connection by generating a random invalid Stellar address. The app claims Freighter/Albedo support but has none.

**Acceptance criteria:**
- Integrate `@freighter-ai/sdk` (or `@stellar/freighter-api`) for real wallet connection
- `connect()` calls Freighter's `requestConnection()` and gets the real public key
- `disconnect()` calls Freighter's `disconnect()`
- Handle: wallet not installed, user rejects connection, network mismatch
- Fall back to the simulated mode if Freighter is not detected (for development/preview)
- Add a "Freighter not detected — using simulation mode" indicator
- Validate the returned address is a real Stellar public key (56 chars, starts with G, valid base32 + checksum)
- Persist real connection state across reloads

**Files:** `src/context/WalletContext.tsx`, `src/lib/stellar.ts`, `package.json` (add freighter dependency)

---

## Sprint 7 — Documentation

### SK-060 · `docs` · L2 · Easy
**Add inline JSDoc comments to stellar.ts utility functions**

**Description:** `src/lib/stellar.ts` contains business-critical functions with no documentation. Contributors need to understand what each function does, its parameters, and return types.

**Acceptance criteria:**
- Add JSDoc comments to all exported functions: `generateStellarAddress`, `generateTxHash`, `generateContractId`, `shortAddress`, `bpsToPercent`, `formatTokenAmount`, `formatTimeAgo`, `formatDuration`, `calculatePayouts`
- Include `@param`, `@returns`, and `@example` tags
- Document the `PayoutSplit` type
- Add a file-level comment explaining this is a simulation layer

**Files:** `src/lib/stellar.ts`

---

### SK-061 · `docs` · L2 · Easy
**Add CONTRIBUTING.md with setup and contribution guidelines**

**Description:** The project has no contributor guide. Wave Program contributors need clear instructions for local setup, branching, and PR submission.

**Acceptance criteria:**
- Create `CONTRIBUTING.md` with:
  - Prerequisites (Node 18+, npm)
  - Local setup steps (`npm install`, env vars)
  - Branch naming convention (`SK-XXX-short-description`)
  - PR template and submission process
  - Code style guidelines (TypeScript strict, no any, match existing conventions)
  - Testing requirements (all new functions need tests)
  - Project structure overview
  - How to pick an issue (reference the Wave Program issues doc)

**Files:** new `CONTRIBUTING.md`

---

### SK-062 · `docs` · L2 · Easy
**Add component-level documentation for the UI library**

**Description:** `src/components/ui.tsx` exports 10+ reusable components with no documentation. Contributors need to know available props and usage patterns.

**Acceptance criteria:**
- Add JSDoc comments to each exported component: `Badge`, `StatusDot`, `Panel`, `SectionTitle`, `StatCard`, `Button`, `Input`, `Label`, `Modal`, `Toggle`, `EmptyState`
- Document all props with `@param` tags
- Add a `@example` JSX snippet for each component
- Create `src/components/README.md` with a component catalog table

**Files:** `src/components/ui.tsx`, new `src/components/README.md`

---

### SK-063 · `docs` · L1 · Good First Issue
**Update README.md with Wave Program and contributor info**

**Description:** The README needs a section pointing contributors to the Wave Program issues and contribution guide.

**Acceptance criteria:**
- Add a "Contributing" section linking to `CONTRIBUTING.md` and the issues doc
- Add a "Wave Program" subsection explaining the sprint-based contribution model
- Add a "Good First Issues" callout pointing to L1 difficulty tasks
- Update the project structure tree to include new files (config.ts, validation.ts, hooks/, etc.)

**Depends on:** SK-061

**Files:** `README.md`

---

## Sprint 8 — Infrastructure & Tooling

### SK-070 · `infra` · L2 · Easy
**Add ESLint configuration for unused imports and accessibility**

**Description:** The project has an `eslint.config.js` but it doesn't catch unused imports or common accessibility issues.

**Acceptance criteria:**
- Enable `@typescript-eslint/no-unused-vars` with `argsIgnorePattern: '^_'`
- Enable `react/jsx-key` for array rendering
- Add `eslint-plugin-jsx-a11y` and enable recommended rules
- Configure to error on: `no-unused-vars`, `alt-text`, `aria-role`, `tabindex-no-positive`
- Run `npm run lint` and fix any new violations
- Add lint check to CI (if applicable)

**Files:** `eslint.config.js`, `package.json`

---

### SK-071 · `infra` · L2 · Easy
**Add Prettier configuration for consistent formatting**

**Description:** The project has no Prettier config, leading to inconsistent formatting across contributions.

**Acceptance criteria:**
- Install `prettier` and `prettier-plugin-tailwindcss` as dev dependencies
- Create `.prettierrc` with: single quotes, 2-space indent, trailing commas, tailwind class sorting
- Add `format` and `format:check` scripts to `package.json`
- Run Prettier on the entire codebase and commit the formatting changes
- Add `.prettierignore` for `dist/`, `node_modules/`, `package-lock.json`

**Files:** new `.prettierrc`, new `.prettierignore`, `package.json`, all source files (reformatted)

---

### SK-072 · `infra` · L3 · Medium
**Add Husky pre-commit hooks for lint and typecheck**

**Description:** There are no pre-commit hooks, so formatting and type errors can slip into commits.

**Acceptance criteria:**
- Install `husky` and `lint-staged` as dev dependencies
- Configure pre-commit hook to run `lint-staged`
- `lint-staged` runs: ESLint on staged `*.{ts,tsx}` files, Prettier on all staged files
- Add `tsc --noEmit` as a pre-push hook
- Document the hook setup in `CONTRIBUTING.md`

**Depends on:** SK-070, SK-071

**Files:** `package.json`, new `.husky/pre-commit`, new `.husky/pre-push`

---

### SK-073 · `infra` · L3 · Medium
**Add Vitest configuration and npm scripts**

**Description:** The project has no test runner configured. Issues SK-040 through SK-043 require Vitest to be set up first.

**Acceptance criteria:**
- Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` as dev dependencies
- Create `vitest.config.ts` with: jsdom environment, path alias `@/` → `src/`, coverage thresholds
- Add `test`, `test:watch`, `test:coverage` scripts to `package.json`
- Add a basic smoke test (`src/__tests__/smoke.test.ts`) that verifies the test runner works
- Document how to run tests in `CONTRIBUTING.md`

**Files:** new `vitest.config.ts`, `package.json`, new `src/__tests__/smoke.test.ts`

---

## Sprint 9 — Advanced Features (Post-Grant)

### SK-080 · `feature` · L5 · Expert
**Implement Soroban Kiosk smart contract in Rust**

**Description:** The current dashboard is a prototype with simulated blockchain interactions. The production protocol requires actual Soroban smart contracts.

**Acceptance criteria:**
- Create `contracts/kiosk/` directory with a Soroban contract in Rust
- Implement `KioskTrait`: `initialize`, `list_item`, `purchase`, `release_escrow`
- Implement `TransferPolicyTrait`: `set_policy`, `validate_transfer`, `distribute_funds`
- Atomic fund splitting on-chain: seller, royalty, and upstream payouts in a single transaction
- Deploy to Stellar Testnet and verify with `soroban contract invoke`
- Add contract ABIs and TypeScript bindings
- Integration tests against Testnet
- Security review of contract logic

**Files:** new `contracts/` directory, `Cargo.toml`, Rust source files

---

### SK-081 · `feature` · L4 · Hard
**Build the embeddable Web Component as a standalone package**

**Description:** The widget customizer generates code snippets referencing `@stellarkiosk/widget` and `cdn.stellarkiosk.io`, but no actual package or CDN exists.

**Acceptance criteria:**
- Create `packages/widget/` directory with a standalone build
- Implement `<stellar-kiosk-button>` as a Custom Element (no framework dependency)
- Support all props: `kiosk-id`, `item-id`, `theme`, `accent-color`, `button-text`, `border-radius`, `show-preview`
- Build to a single minified JS file for CDN distribution
- Add an iframe fallback for sites that don't support Custom Elements
- Add a React wrapper component (`<StellarKioskButton>`)
- Publish to npm as `@stellarkiosk/widget`
- Test embedding on: a static HTML page, a Docusaurus site, a Next.js app

**Files:** new `packages/widget/` directory

---

### SK-082 · `feature` · L4 · Hard
**Add Stellar Horizon RPC integration for real transaction submission**

**Description:** `src/lib/stellar.ts` generates fake transaction hashes. The production app needs to submit real transactions to the Stellar network.

**Acceptance criteria:**
- Install `@stellar/stellar-sdk` as a dependency
- Replace `generateTxHash()` with real transaction submission via Horizon
- Build the atomic transaction: payment to seller + royalty + upstream recipients in one operation
- Submit to Testnet Horizon and capture the real tx hash
- Verify transaction on-chain via Horizon API
- Handle: insufficient balance, network errors, transaction timeout
- Fall back to simulation mode when no wallet is connected
- Add network selector: Testnet vs. Mainnet (already in the TopBar, just wire it up)

**Files:** `src/lib/stellar.ts`, `src/views/Marketplace.tsx`, `src/context/WalletContext.tsx`, `package.json`

---

### SK-083 · `feature` · L3 · Medium
**Add analytics dashboard with charts and volume trends**

**Description:** The Kiosk Manager shows a single "total sales volume" stat. Maintainers need richer analytics: volume over time, top-selling items, buyer geography, royalty distributions.

**Acceptance criteria:**
- Add a new "Analytics" view (sixth tab in the TopBar)
- Volume over time chart (last 30 days, line/area chart)
- Top-selling items bar chart
- Royalty vs. upstream payout distribution (pie/donut chart)
- Transaction count by escrow mode
- Use a lightweight charting approach (SVG-based, no heavy library) or `recharts`
- Data sourced from `escrow_transactions` table with date aggregation
- Responsive layout with stat cards and charts

**Files:** new `src/views/Analytics.tsx`, `src/App.tsx`, `src/components/TopBar.tsx`

---

## Summary

| Sprint | Theme | Issues | Difficulty Range |
|--------|-------|--------|-----------------|
| 1 | Stabilization & Bug Fixes | SK-001 – SK-007 | L2–L3 |
| 2 | Error Handling & Resilience | SK-010 – SK-014 | L2–L3 |
| 3 | Accessibility | SK-020 – SK-024 | L2–L3 |
| 4 | Feature Enhancements | SK-030 – SK-036 | L2–L3 |
| 5 | Testing | SK-040 – SK-043 | L2–L4 |
| 6 | Refactoring & Code Quality | SK-050 – SK-054 | L2–L4 |
| 7 | Documentation | SK-060 – SK-063 | L1–L2 |
| 8 | Infrastructure & Tooling | SK-070 – SK-073 | L2–L3 |
| 9 | Advanced Features | SK-080 – SK-083 | L3–L5 |

**Total: 38 issues** across 9 sprint cycles.

### Good First Issues (L1)

- SK-063 — Update README.md with Wave Program and contributor info

### Easy Onboarding Issues (L2)

- SK-001 — Remove unused imports
- SK-002 — Fix false "saved to Soroban" indicator
- SK-003 — Add delete confirmation and error handling
- SK-004 — Fix InitModal network rendering bug
- SK-006 — Add clipboard error handling
- SK-012 — Add loading prop to Button
- SK-021 — Link Label and Input with htmlFor/id
- SK-022 — Add aria-labels to icon-only buttons
- SK-023 — Add Toggle role="switch"
- SK-024 — Add skip-to-content link
- SK-034 — Transaction detail modal
- SK-035 — Marketplace search and filter
- SK-036 — Persist wallet connection
- SK-043 — Test for negative seller payout edge case
- SK-051 — Extract clipboard utility
- SK-053 — Extract hardcoded constants
- SK-060 — JSDoc for stellar.ts
- SK-061 — CONTRIBUTING.md
- SK-062 — Component documentation
- SK-070 — ESLint configuration
- SK-071 — Prettier configuration
