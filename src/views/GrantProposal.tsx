import { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Target,
  GitCompare,
  Code,
  Calendar,
  DollarSign,
  Award,
  Github,
  ArrowRight,
  Building2,
  Rocket,
  Shield,
  Layers,
} from 'lucide-react';
import { Panel, SectionTitle, Badge, Button } from '@/components/ui';

export function GrantProposal() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = GRANT_SECTIONS.map((s) => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const current = GRANT_SECTIONS.find((s) => s.id === activeSection) || GRANT_SECTIONS[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <Panel className="p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-glow" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/10 border border-cyan/20">
                <Award className="h-5 w-5 text-cyan" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">SCF Grant Application Export</h1>
                <p className="text-xs text-gray-500">Stellar Community Fund · Season 23 Submission</p>
              </div>
            </div>
          </div>
          <Button onClick={copyAll} variant="secondary" size="sm">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Export Full Proposal'}
          </Button>
        </div>
      </Panel>

      {/* Navigation + Content */}
      <div className="grid lg:grid-cols-[240px_1fr] gap-5">
        {/* Section nav */}
        <Panel className="p-4 h-fit sticky top-20">
          <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-3">Proposal Sections</p>
          <div className="space-y-1">
            {GRANT_SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    active ? 'bg-cyan/10 text-cyan border border-cyan/20' : 'text-gray-400 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {s.title}
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Content */}
        <div className="space-y-5">
          {/* Section header */}
          <Panel className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/20 text-cyan">
                <current.icon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">{current.title}</h2>
                <p className="text-xs text-gray-500">{current.subtitle}</p>
              </div>
            </div>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed font-sans">{current.content}</pre>
            </div>
          </Panel>

          {/* Competitive Analysis Table (only for comparison section) */}
          {activeSection === 'comparison' && (
            <Panel className="p-5">
              <SectionTitle title="Feature Matrix" subtitle="Sui Kiosk vs. StellarKiosk" icon={<GitCompare className="h-4 w-4" />} />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 px-3 text-left text-[10px] uppercase tracking-wider text-gray-600">Feature</th>
                      <th className="py-2 px-3 text-left text-[10px] uppercase tracking-wider text-gray-600">Sui Kiosk</th>
                      <th className="py-2 px-3 text-left text-[10px] uppercase tracking-wider text-cyan">StellarKiosk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2.5 px-3 text-gray-300 font-medium">{row.feature}</td>
                        <td className="py-2.5 px-3 text-gray-500">{row.sui}</td>
                        <td className="py-2.5 px-3 text-cyan">{row.stellar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* Milestones (only for roadmap section) */}
          {activeSection === 'roadmap' && (
            <Panel className="p-5">
              <SectionTitle title="Implementation Milestones" subtitle="12-week delivery plan" icon={<Calendar className="h-4 w-4" />} />
              <div className="space-y-3">
                {MILESTONES.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 panel-tight p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/20 shrink-0">
                      <span className="mono text-xs font-bold text-cyan">{m.week}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge size="xs" variant="cyan">{m.deliverable}</Badge>
                        <span className="mono text-xs text-emerald">{m.budget}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Budget (only for budget section) */}
          {activeSection === 'budget' && (
            <Panel className="p-5">
              <SectionTitle title="Budget Allocation" subtitle="Total request: 45,000 XLM" icon={<DollarSign className="h-4 w-4" />} />
              <div className="space-y-2">
                {BUDGET.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 panel-tight p-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${b.color}`}>
                      <b.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{b.category}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="mono text-sm font-bold text-cyan">{b.amount}</p>
                      <p className="text-[10px] text-gray-600">{b.percent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

type Section = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  content: string;
};

const GRANT_SECTIONS: Section[] = [
  {
    id: 'overview',
    title: 'Problem & Overview',
    subtitle: 'The gap StellarKiosk fills',
    icon: Target,
    content: `Problem Statement

The Stellar ecosystem lacks a composable, developer-friendly on-chain commerce layer. While Sui revolutionized decentralized commerce with its Kiosk architecture—providing escrow accounts that enforce transfer policies without opaque custodial contracts—Stellar developers have no equivalent. Open-source maintainers selling software licenses, dApp developers monetizing digital passes, and creators distributing collectibles must each write custom escrow contracts from scratch, resulting in fragmented, insecure, and non-interoperable solutions.

Solution

StellarKiosk ports Sui's flagship Kiosk architecture to the Stellar Network and Soroban smart contract ecosystem. It provides:

1. Composable on-chain escrows that hold digital items (software licenses, passes, compute vouchers, collectibles)
2. Programmable transfer policies enforcing creator royalties, automated upstream dependency revenue splits (Drips-style), and configurable timelocks
3. An embeddable, zero-dependency web widget that works on any documentation site, blog, or marketplace
4. A modern maintainer dashboard for configuring kiosks, policies, and revenue splits without writing contract code

By bridging Web2 commerce patterns with Soroban smart contracts, StellarKiosk eliminates the barrier to entry for decentralized commerce on Stellar while maintaining full atomic settlement guarantees.

Why Stellar?

Stellar's low transaction fees (~0.00001 XLM), fast finality (~5s), and growing Soroban smart contract platform make it ideal for microtransactions, royalty splits, and high-frequency digital asset transfers. The ecosystem currently lacks a composable commerce protocol—a gap SCF reviewers have acknowledged.`,
  },
  {
    id: 'architecture',
    title: 'Soroban Architecture',
    subtitle: 'Smart contract interfaces',
    icon: Building2,
    content: `Soroban Smart Contract Interfaces

// kiosk.rs — Core Kiosk escrow contract
pub trait KioskTrait {
    fn initialize(env: Env, owner: Address, name: String, settlement_token: Token) -> Kiosk;
    fn list_item(env: Env, kiosk_id: BytesN<32>, item: Item) -> ItemId;
    fn purchase(env: Env, kiosk_id: BytesN<32>, item_id: ItemId, buyer: Address) -> EscrowTx;
    fn release_escrow(env: Env, escrow_id: BytesN<32>) -> void;
}

// transfer_policy.rs — Composable policy engine
pub trait TransferPolicyTrait {
    fn set_policy(env: Env, item_id: ItemId, policy: TransferPolicy) -> void;
    fn validate_transfer(env: Env, item_id: ItemId, amount: i128) -> PayoutSplit;
    fn distribute_funds(env: Env, tx: EscrowTx, split: PayoutSplit) -> void;
}

// TransferPolicy struct
pub struct TransferPolicy {
    min_royalty_bps: u32,         // Creator royalty in basis points
    upstream_split_bps: u32,       // Upstream dependency drip
    upstream_recipients: Vec<Recipient>,
    timelock_seconds: u32,
    escrow_mode: EscrowMode,       // Instant | Timelock | MultiSig
}

Architecture Layers

Layer 1: Soroban Smart Contracts (Rust)
  - Kiosk escrow contract with atomic fund splitting
  - Transfer policy engine with on-chain validation
  - Cross-contract calls for royalty distribution

Layer 2: TypeScript SDK + Dashboard
  - Deterministic in-browser escrow simulator
  - Real Stellar Testnet Horizon/RPC connectivity
  - Supabase-backed state persistence

Layer 3: Embeddable Web Widget
  - Zero-dependency Web Component (<stellar-kiosk-button>)
  - React/HTML/iframe embed variants
  - Freighter + Albedo wallet integration

Data persistence uses Supabase for off-chain metadata (kiosk names, descriptions, widget configs) while all financial state and ownership lives on-chain in Soroban contracts.`,
  },
  {
    id: 'comparison',
    title: 'Competitive Analysis',
    subtitle: 'Sui Kiosk vs. StellarKiosk',
    icon: GitCompare,
    content: `StellarKiosk is directly inspired by Sui's Kiosk but adds several innovations unique to the Stellar ecosystem:

1. Built-in upstream dependency drip splits (Drips-style) — Sui Kiosk does not natively support automated revenue splitting to upstream open-source dependencies. StellarKiosk integrates this as a first-class policy primitive.

2. Embeddable web widget — Sui Kiosk requires a full dApp frontend. StellarKiosk ships a zero-dependency embeddable component for any static site, Docusaurus, or GitHub Pages.

3. Lower settlement cost — Stellar transactions cost ~0.00001 XLM vs. Sui's higher gas fees, making micro-royalties and small-ticket digital sales economically viable.

4. Soroban cross-contract calls — enables composable escrow policies that reference external royalty registries and dependency graphs.

See the feature matrix below for a detailed comparison.`,
  },
  {
    id: 'roadmap',
    title: 'Implementation Roadmap',
    subtitle: '12-week delivery plan',
    icon: Calendar,
    content: `The project follows a 12-week delivery plan with 6 milestones, each producing a verifiable deliverable. The dashboard prototype (this app) demonstrates the full UX flow and policy engine; the remaining work focuses on production Soroban contract development, security audits, and widget distribution.

Key Milestones:
- Week 1-2: Soroban contract scaffolding + Kiosk init/list operations
- Week 3-4: Transfer policy engine + atomic fund splitting
- Week 5-6: Escrow release modes (instant, timelock, multi-sig)
- Week 7-8: Web Component widget + Freighter integration
- Week 9-10: Dashboard production hardening + Testnet deployment
- Week 11-12: Security audit + documentation + SCF submission

See the detailed milestone breakdown below.`,
  },
  {
    id: 'budget',
    title: 'Funding Budget',
    subtitle: '45,000 XLM total request',
    icon: DollarSign,
    content: `Total Funding Request: 45,000 XLM

The budget is allocated across six categories, prioritizing smart contract development and security auditing. All code is open-sourced under MIT license. The team consists of two full-time contributors with Soroban and frontend expertise.

Budget priorities:
1. Soroban contract development (40%) — Core escrow + policy engine
2. Security audit (20%) — Third-party review of contract logic
3. Web widget development (15%) — Embeddable component + SDK
4. Dashboard production (10%) — Maintainer UI hardening
5. Documentation (8%) — Integration guides + API reference
6. Community & distribution (7%) — Demos, tutorials, adoption

See the detailed budget breakdown below.`,
  },
  {
    id: 'license',
    title: 'Open Source & License',
    subtitle: 'MIT licensed, fully open',
    icon: Github,
    content: `Licensing

All StellarKiosk code is open-sourced under the MIT License:
- Soroban smart contracts (Rust): MIT
- TypeScript SDK + dashboard: MIT
- Web widget component: MIT

Repository Structure

github.com/stellarkiosk/protocol
  /contracts        — Soroban Rust contracts
  /sdk              — TypeScript SDK
  /dashboard        — Maintainer dashboard (this app)
  /widget           — Embeddable web component
  /docs             — Integration guides

Contribution Model

The project welcomes community contributions. The contract interfaces follow a standardized pattern compatible with the broader Stellar DeFi ecosystem. Future plans include submitting the transfer policy interface as a Stellar SEP (Stellar Ecosystem Proposal) for standardization.

Team

Two full-time contributors with combined experience in:
- Soroban smart contract development (Rust)
- Stellar SDK and Horizon/RPC integration
- React/TypeScript frontend development
- Web Component standards and embeddable widget architecture
- Open-source maintenance and developer tooling`,
  },
];

const COMPARISON = [
  { feature: 'Escrow Architecture', sui: 'Object-centric Kiosk', stellar: 'Soroban contract Kiosk' },
  { feature: 'Creator Royalties', sui: 'Transfer policy', stellar: 'BPS-based policy engine' },
  { feature: 'Upstream Dependency Splits', sui: 'Not native', stellar: 'Built-in Drips-style drip' },
  { feature: 'Embeddable Widget', sui: 'Requires dApp', stellar: 'Zero-dependency Web Component' },
  { feature: 'Escrow Modes', sui: 'Custom', stellar: 'Instant / Timelock / Multi-sig' },
  { feature: 'Settlement Cost', sui: '~$0.01', stellar: '~$0.00001' },
  { feature: 'Wallet Support', sui: 'Sui wallets', stellar: 'Freighter / Albedo / xBull' },
  { feature: 'License', sui: 'Apache 2.0', stellar: 'MIT' },
];

const MILESTONES = [
  { week: 'W1-2', title: 'Soroban Contract Scaffolding', desc: 'Kiosk init, list_item, and ownership verification on Testnet.', deliverable: 'Testnet contract', budget: '8,000 XLM' },
  { week: 'W3-4', title: 'Transfer Policy Engine', desc: 'Royalty + upstream split logic with atomic fund distribution.', deliverable: 'Policy module', budget: '10,000 XLM' },
  { week: 'W5-6', title: 'Escrow Release Modes', desc: 'Instant, timelock, and multi-sig confirmation flows.', deliverable: 'Escrow release', budget: '7,000 XLM' },
  { week: 'W7-8', title: 'Web Component Widget', desc: 'Embeddable <stellar-kiosk-button> with Freighter integration.', deliverable: 'Widget SDK', budget: '6,000 XLM' },
  { week: 'W9-10', title: 'Dashboard Production', desc: 'Hardening, Testnet deployment, and integration testing.', deliverable: 'Production dashboard', budget: '5,000 XLM' },
  { week: 'W11-12', title: 'Security Audit & Docs', desc: 'Third-party audit, documentation, SCF final submission.', deliverable: 'Audit report', budget: '9,000 XLM' },
];

const BUDGET = [
  { category: 'Soroban Contract Development', desc: 'Core escrow + policy engine in Rust', amount: '18,000 XLM', percent: '40%', icon: Code, color: 'bg-cyan/10 text-cyan' },
  { category: 'Security Audit', desc: 'Third-party contract review', amount: '9,000 XLM', percent: '20%', icon: Shield, color: 'bg-emerald/10 text-emerald' },
  { category: 'Web Widget Development', desc: 'Embeddable component + SDK', amount: '6,750 XLM', percent: '15%', icon: Rocket, color: 'bg-amber/10 text-amber' },
  { category: 'Dashboard Production', desc: 'Maintainer UI hardening', amount: '4,500 XLM', percent: '10%', icon: Layers, color: 'bg-cyan/10 text-cyan' },
  { category: 'Documentation', desc: 'Integration guides + API reference', amount: '3,600 XLM', percent: '8%', icon: FileText, color: 'bg-emerald/10 text-emerald' },
  { category: 'Community & Distribution', desc: 'Demos, tutorials, adoption push', amount: '3,150 XLM', percent: '7%', icon: Github, color: 'bg-amber/10 text-amber' },
];
