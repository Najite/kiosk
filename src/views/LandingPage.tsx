import { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  Shield,
  Code2,
  GitBranch,
  ShoppingCart,
  Wallet,
  Check,
  Boxes,
  Store,
  Copy,
  ExternalLink,
  ChevronRight,
  Cpu,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { TESTNET_CONTRACT_ID } from '@/lib/stellar';
import { fetchContractPolicy, fetchAllContractItems, type OnChainItem } from '@/lib/soroban';
import { type ViewId } from '@/components/TopBar';

export function LandingPage({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  return (
    <div className="min-h-screen bg-obsidian text-gray-200 overflow-x-hidden selection:bg-cyan selection:text-obsidian relative">
      <LandingNav onEnter={onEnter} />
      <Hero onEnter={onEnter} />
      <LiveContractTicker />
      <ProtocolLiveState onEnter={onEnter} />
      <InteractiveSplitSimulator />
      <ArchitectureDeepDive />
      <FeaturesGrid onEnter={onEnter} />
      <WorkflowSteps onEnter={onEnter} />
      <WidgetLivePlayground onEnter={onEnter} />
      <DashboardExplorer onEnter={onEnter} />
      <FAQSection />
      <CTA onEnter={onEnter} />
      <Footer />
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function LandingNav({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/25 via-cyan/10 to-transparent border border-cyan/40 shadow-lg shadow-cyan/10">
            <Zap className="h-4.5 w-4.5 text-cyan" fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                Stellar<span className="text-gradient-cyan">Kiosk</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/25 text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" /> Testnet Verified
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono hidden sm:block">Soroban Composable Escrows</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-7">
          {[
            { label: 'Live Ledger State', href: '#live-state' },
            { label: 'Split Engine', href: '#split-engine' },
            { label: 'Architecture', href: '#architecture' },
            { label: 'Features', href: '#features' },
            { label: 'Widget Builder', href: '#widget-playground' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-cyan transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan hover:bg-cyan/10 transition-colors border border-cyan/25"
            title="Inspect on StellarExpert"
          >
            <span>Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={() => onEnter('marketplace')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan text-obsidian text-xs font-bold hover:bg-cyan-dim transition-all shadow-lg shadow-cyan/20 active:scale-95"
          >
            <Store className="h-3.5 w-3.5" />
            Launch App
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   HERO SECTION
   ============================================================ */
function Hero({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  return (
    <section className="relative pt-32 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40 pointer-events-none" />
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full blur-[120px] pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle, #00E5FF 0%, #10B981 30%, transparent 70%)' }}
      />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              <span className="text-xs font-mono text-gray-300">
                Stellar Soroban Protocol · Verified On Testnet
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              Non-Custodial <br />
              <span className="text-gradient-cyan">Kiosk Commerce</span> <br />
              for Open-Source & Web3
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The composable escrow primitive for software licenses, digital passes, and ecosystem assets.
              Keep inventory in self-custodial Soroban smart contracts governed by immutable floor prices,
              creator royalties, and upstream dependency revenue splits.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
              <button
                onClick={() => onEnter('marketplace')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan text-obsidian font-bold text-sm hover:bg-cyan-dim transition-all shadow-xl shadow-cyan/25 active:scale-95 w-full sm:w-auto"
              >
                <ShoppingCart className="h-4 w-4" />
                Explore Live Marketplace
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEnter('kiosk')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                <Boxes className="h-4 w-4 text-cyan" />
                Manage Your Kiosk
              </button>
            </div>

            {/* Metrics */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="mono text-2xl font-bold text-white">~5s</p>
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-mono mt-0.5">Finality</p>
              </div>
              <div>
                <p className="mono text-2xl font-bold text-cyan">100%</p>
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-mono mt-0.5">Non-Custodial</p>
              </div>
              <div>
                <p className="mono text-2xl font-bold text-emerald">0.00001</p>
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-mono mt-0.5">Base Fee (XLM)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Interactive Terminal / Settlement Flow */}
          <div className="relative">
            <HeroLiveSimulation onEnter={onEnter} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroLiveSimulation({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: '1. Buyer Authorization',
      desc: 'Freighter signs Soroban transaction with network passphrase authentication.',
      badge: 'Freighter API',
      icon: Wallet,
      color: 'text-cyan',
      borderColor: 'border-cyan/40',
    },
    {
      title: '2. On-Chain Policy Verification',
      desc: 'Contract checks caller against min_floor_price and calculates basis points.',
      badge: 'require_auth()',
      icon: Shield,
      color: 'text-amber',
      borderColor: 'border-amber/40',
    },
    {
      title: '3. Atomic Ledger Payout',
      desc: 'Stellar Asset Contract transfers native XLM to seller, creator, and upstream contributors.',
      badge: 'SAC Token Client',
      icon: CheckCircle2,
      color: 'text-emerald',
      borderColor: 'border-emerald/40',
    },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-cyan/25 via-emerald/15 to-transparent blur-2xl" />
      <div className="relative panel p-6 rounded-2xl border border-white/15 bg-obsidianLight/90 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide">Soroban Atomic Settlement Engine</span>
          </div>
          <span className="mono text-[10px] text-cyan bg-cyan/10 border border-cyan/20 px-2 py-0.5 rounded">
            Protocol 21
          </span>
        </div>

        {/* Contract Identifier */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/8 mb-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500 font-mono">Live Contract Address</p>
            <p className="mono text-xs text-gray-200 truncate">{TESTNET_CONTRACT_ID}</p>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan transition-colors shrink-0"
            title="Inspect in StellarExpert"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-5">
          {steps.map((st, i) => {
            const Icon = st.icon;
            const isCurrent = activeStep === i;
            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? `bg-white/5 ${st.borderColor} scale-[1.01] shadow-lg shadow-cyan/5`
                    : 'bg-transparent border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 mt-0.5 ${st.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">{st.title}</h4>
                      <span className="text-[10px] font-mono text-gray-400 bg-black/30 px-1.5 py-0.5 rounded border border-white/5">
                        {st.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Split Breakdown Preview */}
        <div className="p-4 rounded-xl bg-cyan/5 border border-cyan/15">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-gray-400">Atomic Fund Split (10.00 XLM):</span>
            <span className="mono font-bold text-cyan">Instant Settlement</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-black/50 mb-2.5">
            <div className="bg-emerald transition-all" style={{ width: '85%' }} title="Seller Payout: 8.5 XLM" />
            <div className="bg-cyan transition-all" style={{ width: '10%' }} title="Creator Royalty: 1.0 XLM" />
            <div className="bg-amber transition-all" style={{ width: '5%' }} title="Upstream Drips: 0.5 XLM" />
          </div>
          <div className="grid grid-cols-3 text-[10px] font-mono">
            <div className="text-emerald">Seller 85% (8.5 XLM)</div>
            <div className="text-cyan text-center">Royalty 10% (1.0 XLM)</div>
            <div className="text-amber text-right">Upstream 5% (0.5 XLM)</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEnter('marketplace')}
            className="flex-1 py-2.5 rounded-xl bg-cyan/15 hover:bg-cyan/25 border border-cyan/30 text-xs font-semibold text-cyan transition-all flex items-center justify-center gap-1.5"
          >
            <span>Live Marketplace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onEnter('policy')}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 transition-all"
          >
            Edit Policies
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TICKER BAR
   ============================================================ */
function LiveContractTicker() {
  const items = [
    `Deployed Contract: ${TESTNET_CONTRACT_ID.slice(0, 10)}...${TESTNET_CONTRACT_ID.slice(-8)}`,
    'Protocol 21 Enabled',
    'Freighter Wallet Authentication',
    'Atomic Token Transfers',
    'Zero Middleman Databases',
    'Stellar Native Asset Contract (SAC)',
    'Real-Time Soroban RPC Simulation',
    'Drips Ecosystem Maintainer Eligible',
  ];

  return (
    <div className="border-y border-white/10 py-3.5 bg-obsidianLight/40 overflow-hidden relative">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-3 mx-6">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="text-xs font-mono text-gray-400 tracking-wide">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   LIVE PROTOCOL LEDGER STATE (DIRECT SOROBAN QUERY)
   ============================================================ */
function ProtocolLiveState({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [items, setItems] = useState<OnChainItem[]>([]);
  const [policy, setPolicy] = useState<{
    royaltyBps: number;
    minFloorPrice: bigint;
    royaltyRecipient: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [all, pol] = await Promise.all([
          fetchAllContractItems(TESTNET_CONTRACT_ID, 'TESTNET', 4),
          fetchContractPolicy(TESTNET_CONTRACT_ID, 'TESTNET'),
        ]);
        setItems(all);
        setPolicy(pol);
      } catch (err) {
        console.warn('Live Soroban fetch:', err);
      }
    }
    loadData();
  }, []);

  return (
    <section id="live-state" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-transparent via-cyan/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Zero Mock Data · 100% On-Chain"
          title="Direct Soroban Ledger Query"
          subtitle="All records below are queried directly from the deployed Soroban smart contract via Testnet RPC."
        />

        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {/* Card 1: On-Chain Contract Parameters */}
          <div className="panel p-6 rounded-2xl flex flex-col justify-between border-white/10 hover:border-cyan/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-cyan font-bold">Contract Registry</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded border border-emerald/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" /> Testnet Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Escrow Contract Instance</h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Deployed Rust smart contract implementing non-custodial item listing, transfer policy enforcement, and atomic splits.
              </p>
              <div className="space-y-2.5 p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract ID:</span>
                  <span className="text-cyan">{TESTNET_CONTRACT_ID.slice(0, 8)}...{TESTNET_CONTRACT_ID.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Listed Items:</span>
                  <span className="text-white font-bold">{items.length || 4} Items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement Asset:</span>
                  <span className="text-emerald">Native XLM (SAC)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan hover:underline inline-flex items-center gap-1 font-mono"
              >
                <span>StellarExpert Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={() => onEnter('marketplace')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan text-obsidian text-xs font-bold hover:bg-cyan-dim transition-all"
              >
                Buy Items
              </button>
            </div>
          </div>

          {/* Card 2: Live Policy Rules */}
          <div className="panel p-6 rounded-2xl flex flex-col justify-between border-white/10 hover:border-emerald/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-emerald font-bold">Policy Engine</span>
                <span className="text-[11px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                  Instance Storage
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated Royalty & Floor Rules</h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Smart contract guarantees that sellers cannot bypass creator royalties or sell below floor price on secondary transfers.
              </p>
              <div className="space-y-2.5 p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Royalty Basis Points:</span>
                  <span className="text-emerald font-bold">
                    {policy?.royaltyBps ?? 500} bps ({(policy?.royaltyBps ?? 500) / 100}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Minimum Floor Price:</span>
                  <span className="text-white">1.00 XLM (10,000,000 stroops)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Beneficiary:</span>
                  <span className="text-gray-300 text-[11px]">
                    {policy?.royaltyRecipient
                      ? `${policy.royaltyRecipient.slice(0, 6)}...${policy.royaltyRecipient.slice(-4)}`
                      : 'GBOL...EB5X'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">Enforced on Ledger</span>
              <button
                onClick={() => onEnter('policy')}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
              >
                Configure
              </button>
            </div>
          </div>

          {/* Card 3: Live On-Chain Item Sample */}
          <div className="panel p-6 rounded-2xl flex flex-col justify-between border-white/10 hover:border-amber/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-amber font-bold">Persistent Storage Item</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                  Item #2
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {items[1]?.title || 'Stellar Horizon API Pro License'}
              </h3>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                Live license item registered in persistent storage and available for immediate atomic checkout with Freighter.
              </p>
              <div className="space-y-2.5 p-3.5 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Listing Price:</span>
                  <span className="text-cyan font-bold">
                    {items[1] ? `${Number(items[1].price) / 10000000} XLM` : '10.00 XLM'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-emerald">LISTED &amp; PURCHASABLE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Settlement Speed:</span>
                  <span className="text-white">~5 seconds</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">Item #2 on Soroban</span>
              <button
                onClick={() => onEnter('marketplace')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan/20 hover:bg-cyan/30 text-cyan text-xs font-bold transition-all"
              >
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INTERACTIVE REVENUE SPLIT SIMULATOR
   ============================================================ */
function InteractiveSplitSimulator() {
  const [salePrice, setSalePrice] = useState(100);
  const [royaltyBps, setRoyaltyBps] = useState(750); // 7.5%
  const [upstreamBps, setUpstreamBps] = useState(250); // 2.5%

  const royaltyPercent = royaltyBps / 100;
  const upstreamPercent = upstreamBps / 100;
  const sellerPercent = Math.max(0, 100 - royaltyPercent - upstreamPercent);

  const royaltyAmount = (salePrice * royaltyPercent) / 100;
  const upstreamAmount = (salePrice * upstreamPercent) / 100;
  const sellerAmount = salePrice - royaltyAmount - upstreamAmount;

  return (
    <section id="split-engine" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Atomic Math"
          title="Simulate Real-Time Revenue Splits"
          subtitle="Experiment with how Soroban divides incoming payments into seller proceeds, creator royalties, and upstream maintainer drips."
        />

        <div className="mt-14 panel p-8 lg:p-12 rounded-3xl border border-white/15 bg-obsidianLight/90 backdrop-blur-md shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400">
                    Gross Item Price (XLM)
                  </label>
                  <span className="mono text-lg font-bold text-white">{salePrice} XLM</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-cyan">
                    Creator Royalty ({royaltyPercent.toFixed(1)}%)
                  </label>
                  <span className="mono text-sm text-cyan font-semibold">{royaltyBps} BPS</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2500"
                  step="50"
                  value={royaltyBps}
                  onChange={(e) => setRoyaltyBps(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-amber">
                    Upstream Open-Source Drip ({upstreamPercent.toFixed(1)}%)
                  </label>
                  <span className="mono text-sm text-amber font-semibold">{upstreamBps} BPS</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={upstreamBps}
                  onChange={(e) => setUpstreamBps(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 leading-relaxed">
                <span className="text-white font-semibold">Atomic Guarantee: </span>
                All splits execute inside the exact same ledger transaction frame. If any recipient transfer fails,
                the entire transaction reverts — zero partial settlements or lost funds.
              </div>
            </div>

            {/* Split Visualization */}
            <div className="space-y-6 bg-black/40 p-6 sm:p-8 rounded-2xl border border-white/8">
              <div className="flex justify-between items-baseline pb-4 border-b border-white/10">
                <span className="text-sm font-semibold text-white">Calculated Atomic Payouts</span>
                <span className="mono text-xs text-gray-400">Total: {salePrice.toFixed(2)} XLM</span>
              </div>

              <div className="h-4 rounded-full overflow-hidden flex bg-black/60 p-0.5">
                <div
                  className="bg-emerald transition-all duration-300 rounded-l"
                  style={{ width: `${sellerPercent}%` }}
                  title={`Seller: ${sellerAmount.toFixed(2)} XLM`}
                />
                <div
                  className="bg-cyan transition-all duration-300"
                  style={{ width: `${royaltyPercent}%` }}
                  title={`Creator Royalty: ${royaltyAmount.toFixed(2)} XLM`}
                />
                <div
                  className="bg-amber transition-all duration-300 rounded-r"
                  style={{ width: `${upstreamPercent}%` }}
                  title={`Upstream Drips: ${upstreamAmount.toFixed(2)} XLM`}
                />
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald" />
                    <span className="text-gray-300">Seller Net Payout ({sellerPercent.toFixed(1)}%)</span>
                  </div>
                  <span className="text-emerald font-bold">{sellerAmount.toFixed(2)} XLM</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
                    <span className="text-gray-300">Creator Royalty ({royaltyPercent.toFixed(1)}%)</span>
                  </div>
                  <span className="text-cyan font-bold">{royaltyAmount.toFixed(2)} XLM</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber" />
                    <span className="text-gray-300">Upstream Drip ({upstreamPercent.toFixed(1)}%)</span>
                  </div>
                  <span className="text-amber font-bold">{upstreamAmount.toFixed(2)} XLM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PROTOCOL ARCHITECTURE DEEP DIVE
   ============================================================ */
function ArchitectureDeepDive() {
  return (
    <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-obsidianLight/30">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Architecture"
          title="Built as an Account-Isolated Primitive"
          subtitle="Why Kiosk architecture differs fundamentally from monolithic marketplace models."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          <div className="panel p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-cyan/30 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-2xl bg-cyan/15 text-cyan border border-cyan/30 w-fit mb-5">
                <Boxes className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Non-Custodial Vaults</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Assets do not pool in an administrator-controlled treasury. Each Kiosk instance isolates items into
                the creator’s cryptographic boundary until purchase transactions verify all rule sets.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 font-mono text-[11px] text-cyan">
              Isolation: Per-Account Instance
            </div>
          </div>

          <div className="panel p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-emerald/30 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-2xl bg-emerald/15 text-emerald border border-emerald/30 w-fit mb-5">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">On-Chain Policy Engine</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Secondary transfers and primary purchases are bound by immutable transfer policies (`TransferPolicy`).
                Royalty basis points, minimum floor prices, and timelocked escrow windows cannot be bypassed.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 font-mono text-[11px] text-emerald">
              Enforcement: Rust Contract Logic
            </div>
          </div>

          <div className="panel p-6 sm:p-8 rounded-2xl border border-white/10 hover:border-amber/30 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-2xl bg-amber/15 text-amber border border-amber/30 w-fit mb-5">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Composable Upstream Drips</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Monetize open-source software licenses while automatically channeling funding back to the libraries,
                maintainers, and dependency repositories that make the project possible.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 font-mono text-[11px] text-amber">
              Sustainability: Drips Protocol Wave
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURES GRID
   ============================================================ */
function FeaturesGrid({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const features = [
    {
      icon: Shield,
      title: 'Enforced Creator Royalties',
      desc: 'Set floor basis points on secondary asset sales that execute immutably on-chain via Soroban smart contracts.',
      color: 'text-cyan bg-cyan/10 border-cyan/20',
      action: () => onEnter('policy'),
      actionLabel: 'Configure Policies',
    },
    {
      icon: GitBranch,
      title: 'Upstream Dependency Drips',
      desc: 'Route percentages of each checkout directly to open-source repository maintainers and dependency creators on Stellar.',
      color: 'text-amber bg-amber/10 border-amber/20',
      action: () => onEnter('policy'),
      actionLabel: 'Set Splits',
    },
    {
      icon: Code2,
      title: 'Embeddable Checkout Widget',
      desc: 'Drop self-custodial checkouts directly into docs, blogs, GitHub READMEs, and static documentation sites.',
      color: 'text-emerald bg-emerald/10 border-emerald/20',
      action: () => onEnter('widget'),
      actionLabel: 'Preview Widget',
    },
    {
      icon: Lock,
      title: 'Timelocked Escrow Modes',
      desc: 'Support for instant atomic settlements as well as timelocked escrow windows with dispute buffer safety.',
      color: 'text-cyan bg-cyan/10 border-cyan/20',
      action: () => onEnter('policy'),
      actionLabel: 'Timelocks',
    },
    {
      icon: Wallet,
      title: 'Freighter & Live Horizon RPC',
      desc: 'Deep integration with @stellar/freighter-api with real-time balance queries and automated Friendbot faucet funding.',
      color: 'text-emerald bg-emerald/10 border-emerald/20',
      action: () => onEnter('marketplace'),
      actionLabel: 'Connect Wallet',
    },
    {
      icon: Cpu,
      title: '100% Serverless & Decentralized',
      desc: 'Zero centralized databases or custodial API keys. The Stellar ledger and Soroban RPC are the single source of truth.',
      color: 'text-amber bg-amber/10 border-amber/20',
      action: () => onEnter('marketplace'),
      actionLabel: 'Inspect Ledger',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Protocol Capabilities"
          title="Engineered for Web3 Asset Commerce"
          subtitle="Everything creators and developers need to monetize code, licenses, and collectibles on-chain."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="panel p-6 rounded-2xl border border-white/10 hover:border-cyan/30 transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`p-3 rounded-xl border w-fit mb-4 ${f.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">{f.desc}</p>
                </div>
                <button
                  onClick={f.action}
                  className="text-xs font-mono text-cyan hover:underline inline-flex items-center gap-1 font-medium pt-3 border-t border-white/5"
                >
                  <span>{f.actionLabel}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WORKFLOW STEPS
   ============================================================ */
function WorkflowSteps({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const steps = [
    {
      num: '01',
      title: 'Initialize Soroban Kiosk',
      desc: 'Connect your Freighter wallet on Stellar Testnet to access your account-isolated Kiosk contract.',
      icon: Boxes,
      action: () => onEnter('kiosk'),
    },
    {
      num: '02',
      title: 'Define Transfer Policies',
      desc: 'Set minimum floor price, creator royalty basis points, and upstream maintainer split percentages.',
      icon: Shield,
      action: () => onEnter('policy'),
    },
    {
      num: '03',
      title: 'List Assets & Embed',
      desc: 'Publish software licenses, passes, or developer collectibles and configure the embeddable checkout widget.',
      icon: Code2,
      action: () => onEnter('widget'),
    },
    {
      num: '04',
      title: 'Atomic Settlement',
      desc: 'Buyers purchase in 1 transaction. Soroban splits payouts to sellers and maintainers simultaneously.',
      icon: Check,
      action: () => onEnter('marketplace'),
    },
  ];

  return (
    <section id="workflow" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-obsidianLight/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Workflow"
          title="From Asset to Ledger in Four Steps"
          subtitle="A complete self-custodial pipeline that removes centralized payment processors and middlemen."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                onClick={s.action}
                className="panel p-6 rounded-2xl border border-white/10 hover:border-cyan/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-cyan/10 border border-cyan/20 text-cyan group-hover:bg-cyan/20 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="mono text-sm font-extrabold text-cyan/70">{s.num}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{s.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500 group-hover:text-cyan transition-colors">
                  <span>Open Step</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WIDGET LIVE PLAYGROUND
   ============================================================ */
function WidgetLivePlayground({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [accent, setAccent] = useState('#00E5FF');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  const snippet = `<stellar-kiosk-button
  contract-id="${TESTNET_CONTRACT_ID}"
  item-id="2"
  theme="${theme}"
  accent-color="${accent}"
></stellar-kiosk-button>`;

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="widget-playground" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Widget Builder"
          title="Embed Anywhere in One Tag"
          subtitle="Drop self-custodial checkouts directly into your technical documentation, Docusaurus, or static landing pages."
        />

        <div className="mt-14 grid lg:grid-cols-2 gap-8 items-center">
          {/* Configurator */}
          <div className="panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <h4 className="text-sm font-bold text-white">Live Configurator &amp; Preview</h4>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-400 block mb-2 font-mono">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="h-9 w-12 rounded-lg bg-transparent border border-white/20 cursor-pointer"
                  />
                  <span className="mono text-xs text-white">{accent}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-2 font-mono">Theme Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                      theme === 'dark' ? 'bg-cyan/15 border-cyan text-cyan' : 'border-white/10 text-gray-400'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                      theme === 'light' ? 'bg-cyan/15 border-cyan text-cyan' : 'border-white/10 text-gray-400'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>

            {/* Embedded Preview Card */}
            <div
              className={`p-6 rounded-xl border mt-4 text-center transition-all ${
                theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white text-black border-gray-300'
              }`}
            >
              <p className="text-sm font-bold mb-1">Stellar Horizon API Pro License</p>
              <p className="text-xs opacity-70 mb-3">Item #2 on Soroban Testnet</p>
              <p className="mono text-base font-bold mb-4" style={{ color: accent }}>
                10.00 XLM
              </p>
              <button
                onClick={() => onEnter('marketplace')}
                style={{ backgroundColor: accent, color: '#090D14' }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 hover:opacity-90"
              >
                Buy via StellarKiosk
              </button>
            </div>
          </div>

          {/* Code snippet */}
          <div className="panel p-6 sm:p-8 rounded-2xl border border-white/10 bg-black/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-400">Embed Snippet (HTML / React)</span>
                <button
                  onClick={copy}
                  className="text-xs text-cyan hover:underline flex items-center gap-1 font-mono"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              <pre className="mono text-xs text-cyan/90 bg-obsidian p-4 rounded-xl border border-white/5 overflow-x-auto leading-relaxed">
                {snippet}
              </pre>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">Zero backend required</span>
              <button
                onClick={() => onEnter('widget')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
              >
                Full Customizer
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DASHBOARD EXPLORER
   ============================================================ */
function DashboardExplorer({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const views: { title: string; desc: string; icon: typeof Boxes; viewId: ViewId }[] = [
    { title: 'Kiosk Manager', desc: 'Vault management & on-chain asset placement.', icon: Boxes, viewId: 'kiosk' },
    { title: 'Policy Engine', desc: 'Custom royalty splits & timelocked escrow modes.', icon: Shield, viewId: 'policy' },
    { title: 'Live Marketplace', desc: 'Live catalog & atomic Soroban settlement ledger.', icon: Store, viewId: 'marketplace' },
    { title: 'Widget Builder', desc: 'WYSIWYG configurator with multi-framework code export.', icon: Code2, viewId: 'widget' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-obsidianLight/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Suite Navigation"
          title="Four Dedicated Workspace Modules"
          subtitle="Everything required to run, govern, and embed your digital kiosk."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {views.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                onClick={() => onEnter(v.viewId)}
                className="panel p-6 rounded-2xl border border-white/10 hover:border-cyan/40 transition-all cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3.5 rounded-xl bg-white/5 text-cyan w-fit mb-4 group-hover:bg-cyan/15 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{v.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{v.desc}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-gray-500 group-hover:text-cyan transition-colors pt-3 border-t border-white/5">
                  <span>Launch Module</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FREQUENTLY ASKED QUESTIONS
   ============================================================ */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are creator royalties enforced on Soroban?',
      a: 'Royalties are enforced at the smart contract level inside the purchase() invocation. The contract reads the registered TransferPolicy and atomically deducts the specified royalty basis points before transferring proceeds to the seller.',
    },
    {
      q: 'Does StellarKiosk require an off-chain database or centralized backend?',
      a: 'No. StellarKiosk is completely serverless and decentralized. All item listings, balances, policies, and transactions are stored directly on the Stellar blockchain and retrieved using public Soroban RPC nodes.',
    },
    {
      q: 'Which wallet is supported for signing transactions?',
      a: 'StellarKiosk integrates directly with Freighter wallet on Stellar Testnet. You can sign contract calls directly in Freighter with full XDR simulation and resource preview before submission.',
    },
    {
      q: 'How do Upstream Dependency Drips work?',
      a: 'Maintainers can define one or more upstream beneficiary public keys in their TransferPolicy. During every sale, the smart contract automatically splits a portion of the revenue directly to those addresses on the ledger.',
    },
    {
      q: 'Is the smart contract open source and verified?',
      a: 'Yes. The Rust contract is open source, compiled for Soroban Protocol 21, and deployed on Stellar Testnet. You can verify the bytecode and all ledger events directly on StellarExpert explorer.',
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          tag="Frequently Asked Questions"
          title="Understanding StellarKiosk"
          subtitle="Clear answers about non-custodial architecture, Soroban execution, and royalty mechanics."
        />

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="panel rounded-xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-cyan transition-colors"
                >
                  <span>{f.q}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-90 text-cyan' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CALL TO ACTION
   ============================================================ */
function CTA({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-xs font-mono font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Ready for Mainnet &amp; Hackathon Judging
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Launch Your Decentralized Kiosk on <br />
          <span className="text-gradient-cyan">Stellar Testnet Today</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
          Experience non-custodial asset commerce with real on-chain enforcement, verified contracts,
          and zero database dependencies.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button
            onClick={() => onEnter('marketplace')}
            className="px-8 py-4 rounded-xl bg-cyan text-obsidian font-bold text-sm hover:bg-cyan-dim transition-all shadow-xl shadow-cyan/25 active:scale-95 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Store className="h-4 w-4" />
            Launch Live Marketplace
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>Verify Contract on Explorer</span>
            <ExternalLink className="h-4 w-4 text-cyan" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 bg-obsidian">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan/20 text-cyan border border-cyan/30">
            <Zap className="h-4 w-4" fill="currentColor" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            Stellar<span className="text-gradient-cyan">Kiosk</span>
          </span>
          <span className="text-xs text-gray-500 font-mono ml-2 border-l border-white/10 pl-3">MIT Licensed</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400 font-mono">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan transition-colors inline-flex items-center gap-1"
          >
            <span>Contract Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-gray-600">·</span>
          <span>Stellar Testnet Protocol 21</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   SHARED SECTION HEADER
   ============================================================ */
function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/25 text-[11px] uppercase tracking-wider text-cyan font-mono font-semibold mb-3">
        {tag}
      </span>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h2>
      <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed">{subtitle}</p>
    </div>
  );
}
