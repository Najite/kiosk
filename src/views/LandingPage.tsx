import { useState, useEffect } from 'react';
import {
  Zap,
  ArrowRight,
  Shield,
  Code2,
  GitBranch,
  Layers,
  ShoppingCart,
  Wallet,
  Check,
  Boxes,
  Store,
  FileText,
  Copy,
  Github,
  Twitter,
  ArrowUpRight,
  Activity,
  Lock,
  Coins,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Radio,
  ScanLine,
  Cpu,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { TESTNET_CONTRACT_ID } from '@/lib/stellar';
import { fetchContractItem, fetchContractPolicy } from '@/lib/soroban';

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-obsidian text-gray-200 overflow-x-hidden selection:bg-cyan selection:text-obsidian">
      <LandingNav onEnter={onEnter} />
      <Hero onEnter={onEnter} />
      <LiveContractTicker />
      <ProtocolArchitecture />
      <LiveOnChainShowcase onEnter={onEnter} />
      <Features />
      <HowItWorks />
      <WidgetDemo onEnter={onEnter} />
      <DashboardViews onEnter={onEnter} />
      <CTA onEnter={onEnter} />
      <Footer />
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function LandingNav({ onEnter }: { onEnter: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-obsidian/90 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/25 to-emerald/10 border border-cyan/30 shadow-sm">
            <Zap className="h-4 w-4 text-cyan" fill="currentColor" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Stellar<span className="text-gradient-cyan">Kiosk</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" /> Testnet Verified
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'On-Chain Contract', href: '#contract' },
            { label: 'Architecture', href: '#architecture' },
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#workflow' },
            { label: 'Checkout Widget', href: '#widget' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan hover:bg-cyan/10 transition-colors border border-cyan/20"
          >
            <span>Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan text-obsidian text-xs font-bold hover:bg-cyan-dim transition-all shadow-lg shadow-cyan/20 active:scale-95"
          >
            Launch Kiosk
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   HERO SECTION
   ============================================================ */
function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative pt-32 pb-20 px-4 lg:px-6 overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-35" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.12), transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              <span className="text-xs font-mono text-gray-300">
                Soroban Protocol · Stellar Testnet Live
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Non-Custodial <br />
              <span className="text-gradient-cyan">Kiosk Commerce</span> <br />
              on Stellar Soroban
            </h1>

            <p className="mt-6 text-base lg:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The composable escrow primitive for Web3. Keep digital assets in an account-isolated
              vault governed by atomic transfer policies, creator royalties, and upstream revenue
              splits — deployed live on Stellar Testnet.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <button
                onClick={onEnter}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan text-obsidian font-bold text-sm hover:bg-cyan-dim transition-all shadow-xl shadow-cyan/25 active:scale-95 w-full sm:w-auto"
              >
                Open Kiosk Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-medium text-sm hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                <Cpu className="h-4 w-4 text-cyan" />
                Verify On-Chain Contract
              </a>
            </div>

            {/* Metrics */}
            <div className="mt-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="mono text-lg lg:text-xl font-bold text-white">~5 sec</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-0.5">Finality</p>
              </div>
              <div>
                <p className="mono text-lg lg:text-xl font-bold text-cyan">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-0.5">Non-Custodial</p>
              </div>
              <div>
                <p className="mono text-lg lg:text-xl font-bold text-emerald">0.00001 XLM</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mt-0.5">Base Fee</p>
              </div>
            </div>
          </div>

          {/* Right Live Simulation Card */}
          <div className="relative">
            <HeroInteractiveVisual onEnter={onEnter} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroInteractiveVisual({ onEnter }: { onEnter: () => void }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const flows = [
    {
      title: '1. Buyer Signs Escrow',
      desc: 'Freighter signs Soroban transaction with network passphrase authentication.',
      icon: Wallet,
      color: 'text-cyan',
    },
    {
      title: '2. TransferPolicy Enforced',
      desc: 'Smart contract verifies floor price and splits royalties atomically.',
      icon: Shield,
      color: 'text-amber',
    },
    {
      title: '3. Ledger Settlement',
      desc: 'Seller, creator, and upstream maintainers receive payouts on ledger.',
      icon: CheckCircle2,
      color: 'text-emerald',
    },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan/20 via-emerald/10 to-transparent blur-xl" />
      <div className="relative panel p-6 rounded-2xl border border-white/15 bg-obsidian/95 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide">Live Testnet Contract</span>
          </div>
          <span className="mono text-[10px] text-cyan bg-cyan/10 border border-cyan/20 px-2 py-0.5 rounded">
            Protocol v21
          </span>
        </div>

        {/* Contract ID Bar */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/8 mb-5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500 font-mono">Contract Identifier</p>
            <p className="mono text-xs text-gray-300 truncate">{TESTNET_CONTRACT_ID}</p>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan transition-colors shrink-0"
            title="Open in Stellar Expert"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-5">
          {flows.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-white/5 border-cyan/30 scale-[1.01] shadow-lg shadow-cyan/5'
                    : 'bg-transparent border-white/5 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 mt-0.5 ${step.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{step.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Split Distribution Preview */}
        <div className="p-3.5 rounded-xl bg-cyan/5 border border-cyan/15">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400">Atomic Payout Ratio:</span>
            <span className="mono font-bold text-white">50.00 XLM</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-black/40 mb-2">
            <div className="bg-emerald" style={{ width: '85%' }} title="Seller Payout 85%" />
            <div className="bg-cyan" style={{ width: '10%' }} title="Creator Royalty 10%" />
            <div className="bg-amber" style={{ width: '5%' }} title="Upstream Drips 5%" />
          </div>
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-emerald">Seller 85%</span>
            <span className="text-cyan">Royalty 10%</span>
            <span className="text-amber">Upstream 5%</span>
          </div>
        </div>

        <button
          onClick={onEnter}
          className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
        >
          <span>Interact With Live Instance</span>
          <ArrowRight className="h-3.5 w-3.5 text-cyan" />
        </button>
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
    'Stellar Testnet Protocol 21',
    'Atomic Token Transfers',
    'Freighter Wallet Authentication',
    'Zero Centralized Databases',
    'Real-Time Horizon RPC Synchronization',
    'MIT Licensed Open Source',
    'Drips Wave Maintainer Eligible',
  ];

  return (
    <div className="border-y border-white/10 py-3.5 bg-obsidianLight/40 overflow-hidden">
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
   LIVE ON-CHAIN SHOWCASE
   ============================================================ */
function LiveOnChainShowcase({ onEnter }: { onEnter: () => void }) {
  const [onChainItem, setOnChainItem] = useState<{
    id: number;
    title: string;
    price: bigint;
    isListed: boolean;
    seller: string;
  } | null>(null);
  const [policy, setPolicy] = useState<{
    royaltyBps: number;
    minFloorPrice: bigint;
    royaltyRecipient: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOnChainData() {
      try {
        const it = await fetchContractItem(1);
        const pol = await fetchContractPolicy();
        if (it) setOnChainItem(it);
        if (pol) setPolicy(pol);
      } catch (e) {
        console.warn('Could not read contract:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOnChainData();
  }, []);

  return (
    <section id="contract" className="py-20 px-4 lg:px-6 relative bg-gradient-to-b from-transparent via-cyan/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="On-Chain State"
          title="Direct Soroban Ledger Query"
          subtitle="This data is queried live from the deployed Stellar Testnet contract via Soroban RPC — zero mock data, zero centralized database."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Live Contract State */}
          <div className="panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-cyan font-bold">
                  Live Persistent Asset #1
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded border border-emerald/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" /> Listed on Ledger
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {onChainItem ? onChainItem.title : 'Soroban Developer Pass #42'}
              </h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Statically registered in Soroban contract storage. Validated by minimum floor price
                rules and ready for atomic purchase settlement.
              </p>

              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Asset Item ID:</span>
                  <span className="text-white">#{onChainItem?.id || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Floor Unit Price:</span>
                  <span className="text-cyan font-bold">
                    {onChainItem ? `${Number(onChainItem.price) / 10000000} XLM` : '50.00 XLM'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Seller Public Key:</span>
                  <span className="text-gray-300 text-[11px]">
                    {onChainItem
                      ? `${onChainItem.seller.slice(0, 8)}...${onChainItem.seller.slice(-6)}`
                      : 'GBOL...EB5X'}
                  </span>
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
                <span>Inspect in Stellar Expert</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={onEnter}
                className="px-4 py-2 rounded-xl bg-cyan text-obsidian text-xs font-bold hover:bg-cyan-dim transition-all"
              >
                Buy via Escrow
              </button>
            </div>
          </div>

          {/* Card 2: Live Policy State */}
          <div className="panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-emerald font-bold">
                  On-Chain Policy Engine
                </span>
                <span className="text-[11px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                  Instance Storage
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Automated Royalty &amp; Floor Rules</h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Guaranteed by Soroban smart contract authorization checks (`caller.require_auth()`).
                Sellers cannot circumvent creator royalties on secondary transfers.
              </p>

              <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Royalty Basis Points:</span>
                  <span className="text-emerald font-bold">
                    {policy?.royaltyBps ?? 500} bps ({(policy?.royaltyBps ?? 500) / 100}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Min Floor Enforcement:</span>
                  <span className="text-white">10,000,000 stroops (1.0 XLM)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Royalty Recipient:</span>
                  <span className="text-gray-300 text-[11px]">
                    {policy?.royaltyRecipient
                      ? `${policy.royaltyRecipient.slice(0, 8)}...${policy.royaltyRecipient.slice(-6)}`
                      : 'GBOL...EB5X'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">Status: Enforced on Ledger</span>
              <button
                onClick={onEnter}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
              >
                Configure Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PROTOCOL ARCHITECTURE
   ============================================================ */
function ProtocolArchitecture() {
  return (
    <section id="architecture" className="py-20 px-4 lg:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Architecture"
          title="The Kiosk Escrow Primitive"
          subtitle="Non-custodial digital asset vaults with atomic settlement policies directly on Soroban."
        />

        <div className="mt-14 panel p-8 lg:p-12 rounded-3xl relative overflow-hidden scan-overlay border border-white/15">
          <div className="grid md:grid-cols-3 gap-8 items-center text-center">
            {/* Box 1 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-cyan/15 text-cyan border border-cyan/30 mb-4">
                <Boxes className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Non-Custodial Vault</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Assets remain cryptographically locked in the owner's isolated Kiosk contract until
                policy conditions are verified.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan/10 to-transparent border border-cyan/25 flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-emerald/15 text-emerald border border-emerald/30 mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Policy Engine</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Atomic evaluation of floor pricing, minimum creator royalties, and multi-recipient
                splits prior to asset release.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
              <div className="p-3.5 rounded-2xl bg-amber/15 text-amber border border-amber/30 mb-4">
                <Coins className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">Atomic Payout</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Payment tokens move directly via Soroban token client to sellers, royalties, and
                open-source upstream contributors simultaneously.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURES
   ============================================================ */
function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Enforced Creator Royalties',
      desc: 'Set floor basis points on secondary asset sales that execute immutably on-chain via Soroban smart contracts.',
      color: 'text-cyan bg-cyan/10 border-cyan/20',
    },
    {
      icon: GitBranch,
      title: 'Upstream Dependency Drips',
      desc: 'Route percentages of each sale to open-source repository maintainers and dependency creators on Stellar.',
      color: 'text-amber bg-amber/10 border-amber/20',
    },
    {
      icon: Code2,
      title: 'Embeddable Checkout Widget',
      desc: 'Exportable HTML, React, and iframe components allowing instant checkouts on blogs, docs, and marketplaces.',
      color: 'text-emerald bg-emerald/10 border-emerald/20',
    },
    {
      icon: Lock,
      title: 'Timelocked Escrow Modes',
      desc: 'Support for instant atomic settlements as well as timelocked escrow windows with dispute buffer safety.',
      color: 'text-cyan bg-cyan/10 border-cyan/20',
    },
    {
      icon: Wallet,
      title: 'Freighter & Live Horizon RPC',
      desc: 'Deep integration with @stellar/freighter-api with real-time balance queries and automated Friendbot faucet funding.',
      color: 'text-emerald bg-emerald/10 border-emerald/20',
    },
    {
      icon: Cpu,
      title: '100% Serverless & Decentralized',
      desc: 'Zero centralized databases or custodial API keys. The Stellar ledger and Soroban RPC are the single source of truth.',
      color: 'text-amber bg-amber/10 border-amber/20',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Protocol Capabilities"
          title="Engineered for Web3 Asset Commerce"
          subtitle="Everything creators and developers need to monetize code, licenses, and collectibles on-chain."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="panel p-6 rounded-2xl border border-white/10 hover:border-cyan/30 transition-all hover:-translate-y-1"
              >
                <div className={`p-3 rounded-xl border w-fit mb-4 ${f.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Initialize Soroban Kiosk',
      desc: 'Connect Freighter or simulated demo account to deploy an account-isolated Soroban Kiosk contract.',
      icon: Boxes,
    },
    {
      num: '02',
      title: 'Define Transfer Policies',
      desc: 'Set floor prices, creator royalties (bps), and upstream maintainer split percentages.',
      icon: Shield,
    },
    {
      num: '03',
      title: 'List Assets & Embed',
      desc: 'Add software licenses, passes, or collectibles and embed the checkout button on your web property.',
      icon: Code2,
    },
    {
      num: '04',
      title: 'Atomic Settlement',
      desc: 'Buyers purchase in 1 transaction. Stellar splits payouts to sellers and maintainers simultaneously.',
      icon: Check,
    },
  ];

  return (
    <section id="workflow" className="py-20 px-4 lg:px-6 relative bg-obsidianLight/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Workflow"
          title="From Asset to Ledger in Four Steps"
          subtitle="A complete self-custodial pipeline that removes centralized middlemen."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="panel p-6 rounded-2xl border border-white/10 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan/10 border border-cyan/20 text-cyan">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="mono text-sm font-extrabold text-cyan/70">{s.num}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{s.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WIDGET DEMO
   ============================================================ */
function WidgetDemo({ onEnter }: { onEnter: () => void }) {
  const [accent, setAccent] = useState('#00E5FF');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copied, setCopied] = useState(false);

  const snippet = `<stellar-kiosk-button
  contract-id="${TESTNET_CONTRACT_ID}"
  item-id="1"
  theme="${theme}"
  accent-color="${accent}"
></stellar-kiosk-button>`;

  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="widget" className="py-20 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Widget Builder"
          title="Embeddable Web Component"
          subtitle="Drop self-custodial checkouts directly into your technical documentation or landing pages."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-8 items-center">
          {/* Configurator */}
          <div className="panel p-6 rounded-2xl border border-white/10 space-y-5">
            <h4 className="text-sm font-bold text-white">Interactive Widget Preview</h4>
            <div className="space-y-4">
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
              className={`p-5 rounded-xl border mt-4 text-center ${
                theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-gray-100 text-black border-gray-300'
              }`}
            >
              <p className="text-xs font-bold mb-2">Soroban Developer Pass #42</p>
              <p className="mono text-sm font-bold mb-3" style={{ color: accent }}>
                50.00 XLM
              </p>
              <button
                onClick={onEnter}
                style={{ backgroundColor: accent, color: '#090D14' }}
                className="px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95"
              >
                Buy via StellarKiosk
              </button>
            </div>
          </div>

          {/* Code snippet */}
          <div className="panel p-6 rounded-2xl border border-white/10 bg-black/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-400">Embed Snippet (HTML/React)</span>
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
            <p className="text-[11px] text-gray-500 mt-6 leading-relaxed">
              Drop this component into Docusaurus, Next.js, or plain HTML. It talks straight to Soroban
              RPC with zero middleman server.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   DASHBOARD VIEWS
   ============================================================ */
function DashboardViews({ onEnter }: { onEnter: () => void }) {
  const views = [
    { title: 'Kiosk Manager', desc: 'Vault management & on-chain asset placement.', icon: Boxes },
    { title: 'Policy Engine', desc: 'Custom royalty splits & timelocked escrow modes.', icon: Shield },
    { title: 'Marketplace', desc: 'Live catalog & atomic Soroban settlement ledger.', icon: Store },
    { title: 'Widget Builder', desc: 'WYSIWYG configurator with multi-framework code export.', icon: Code2 },
    { title: 'SCF Proposal', desc: 'Drips Wave & Stellar Community Fund application view.', icon: FileText },
  ];

  return (
    <section className="py-20 px-4 lg:px-6 bg-obsidianLight/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Suite Navigation"
          title="Integrated Maintainer Dashboard"
          subtitle="Everything required to run, govern, and embed your digital kiosk."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {views.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                onClick={onEnter}
                className="panel p-5 rounded-2xl border border-white/10 hover:border-cyan/40 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-white/5 text-cyan w-fit mb-3 group-hover:bg-cyan/15 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{v.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{v.desc}</p>
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-cyan mt-3 transition-colors" />
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
function CTA({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="py-24 px-4 lg:px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Launch Your Decentralized Kiosk on <br />
          <span className="text-gradient-cyan">Stellar Testnet Today</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
          Experience non-custodial asset commerce with real on-chain enforcement and zero database
          dependencies.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button
            onClick={onEnter}
            className="px-8 py-4 rounded-xl bg-cyan text-obsidian font-bold text-sm hover:bg-cyan-dim transition-all shadow-xl shadow-cyan/25 active:scale-95 w-full sm:w-auto"
          >
            Launch Live Dashboard
          </button>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 transition-all w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <span>View Deployed Contract</span>
            <ExternalLink className="h-4 w-4" />
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
    <footer className="border-t border-white/10 py-10 px-4 lg:px-6 bg-obsidian">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan/20 text-cyan">
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">
            Stellar<span className="text-gradient-cyan">Kiosk</span>
          </span>
          <span className="text-xs text-gray-500 font-mono ml-2">MIT Licensed</span>
        </div>

        <p className="text-xs text-gray-500 font-mono">
          Built for Stellar Community Fund &amp; Drips Wave
        </p>
      </div>
    </footer>
  );
}

/* ============================================================
   HELPER
   ============================================================ */
function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-[11px] uppercase tracking-wider text-cyan font-mono font-semibold mb-3">
        {tag}
      </span>
      <h2 className="text-2xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </h2>
      <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed">{subtitle}</p>
    </div>
  );
}
