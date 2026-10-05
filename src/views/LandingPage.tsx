import { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Copy,
  Github,
  Twitter,
  ArrowUpRight,
  Activity,
  Lock,
  Coins,
  TrendingUp,
  Globe,
  Radio,
  FlaskConical,
  ChevronRight,
  ScanLine,
  Cpu,
} from 'lucide-react';

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-obsidian text-gray-200 overflow-x-hidden">
      <LandingNav onEnter={onEnter} />
      <Hero onEnter={onEnter} />
      <TrustBar />
      <ModeSection onEnter={onEnter} />
      <ProtocolDiagram />
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
   NAV
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
        scrolled ? 'bg-obsidian/85 backdrop-blur-xl border-b border-white/8' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-emerald/10 border border-cyan/20">
            <Zap className="h-4 w-4 text-cyan" fill="currentColor" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            Stellar<span className="text-gradient-cyan">Kiosk</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Modes', href: '#modes' },
            { label: 'Protocol', href: '#protocol' },
            { label: 'Features', href: '#features' },
            { label: 'How it Works', href: '#how-it-works' },
            { label: 'Widget', href: '#widget' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan text-obsidian text-sm font-semibold hover:bg-cyan-dim transition-all hover:shadow-lg hover:shadow-cyan/20"
          >
            Launch App
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   HERO
   ============================================================ */
function Hero({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="relative pt-32 pb-20 px-4 lg:px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40" />
      <div className="absolute inset-0 bg-cyan-glow" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.07), transparent 70%)' }} />

      {/* Floating particles */}
      <div className="absolute top-40 left-10 w-2 h-2 rounded-full bg-cyan animate-float opacity-60" />
      <div className="absolute top-60 right-20 w-1.5 h-1.5 rounded-full bg-emerald animate-float-delayed opacity-50" />
      <div className="absolute top-32 right-1/3 w-1 h-1 rounded-full bg-amber animate-float opacity-40" />
      <div className="absolute bottom-20 left-1/4 w-1 h-1 rounded-full bg-cyan/60 animate-float-delayed opacity-30" />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-14 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald opacity-60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
              <span className="text-xs text-gray-400">SCF Season 23 · Live on Stellar Mainnet &amp; Testnet</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              On-Chain Escrow &amp;
              <br />
              <span className="text-gradient-cyan">Digital Asset Commerce</span>
              <br />
              on Stellar
            </h1>

            <p className="mt-6 text-base lg:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              A Soroban-native Kiosk protocol with composable transfer policies, upstream dependency
              drips, and an embeddable checkout widget — connect your{' '}
              <span className="text-emerald font-medium">Freighter wallet</span> to go live, or explore
              the full protocol in{' '}
              <span className="text-amber font-medium">Sandbox mode</span> instantly.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <button
                onClick={onEnter}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan text-obsidian font-semibold text-sm hover:bg-cyan-dim transition-all hover:shadow-xl hover:shadow-cyan/20 w-full sm:w-auto justify-center"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a
                href="#modes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all w-full sm:w-auto justify-center"
              >
                <ScanLine className="h-4 w-4" />
                Explore Modes
              </a>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              {[
                { label: 'Settlement', value: '~5s' },
                { label: 'Tx Cost', value: '~0.00001 XLM' },
                { label: 'License', value: 'MIT' },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="mono text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated visual */}
          <div className="relative animate-slide-up-delayed">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  const [tick, setTick] = useState(0);
  const [mode, setMode] = useState<'live' | 'sandbox'>('live');
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2800);
    return () => clearInterval(id);
  }, []);

  const steps = [
    { label: 'Freighter signs transaction', color: 'text-cyan', icon: Wallet },
    { label: 'Soroban escrow validates policy', color: 'text-amber', icon: Shield },
    { label: 'Funds split atomically on-chain', color: 'text-emerald', icon: Check },
  ];
  const activeStep = tick % 3;

  return (
    <div className="relative">
      {/* Glow ring */}
      <div className="absolute -inset-4 bg-gradient-to-br from-cyan/10 via-transparent to-emerald/5 rounded-3xl blur-2xl animate-glow-breath" />

      <div className="relative panel p-0 overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-obsidianLight">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose/70" />
            <span className="h-3 w-3 rounded-full bg-amber/70" />
            <span className="h-3 w-3 rounded-full bg-emerald/70" />
          </div>
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
            <button
              onClick={() => setMode('live')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                mode === 'live' ? 'bg-emerald/20 text-emerald' : 'text-gray-600'
              }`}
            >
              <Radio className="h-2.5 w-2.5" /> Live
            </button>
            <button
              onClick={() => setMode('sandbox')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                mode === 'sandbox' ? 'bg-amber/20 text-amber' : 'text-gray-600'
              }`}
            >
              <FlaskConical className="h-2.5 w-2.5" /> Sandbox
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 bg-obsidian">
          {/* Mode indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-medium transition-all ${
            mode === 'live'
              ? 'bg-emerald/8 border-emerald/20 text-emerald'
              : 'bg-amber/8 border-amber/20 text-amber'
          }`}>
            {mode === 'live' ? <Radio className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
            {mode === 'live'
              ? 'Live Account Mode · Freighter Connected · Horizon RPC Active'
              : 'Sandbox Mode · No wallet required · Demo data isolated'}
          </div>

          {/* Code block */}
          <div className="space-y-1.5">
            <CodeLine line={1} text="let kiosk = Kiosk::init(owner, 'XLM');" color="text-gray-500" />
            <CodeLine line={2} text="kiosk.set_policy(royalty: 10%);" color="text-cyan" />
            <CodeLine line={3} text="kiosk.add_upstream_drip('sdk-rs', 8%);" color="text-amber" />
            <CodeLine line={4} text="kiosk.list(item, price: 50 XLM);" color="text-emerald" />
            <CodeLine line={5} text="→ escrow ready for atomic purchase" color="text-gray-600" />
          </div>

          {/* Animated steps */}
          <div className="pt-3 border-t border-white/8 space-y-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = i === activeStep;
              const done = i < activeStep;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-300 ${
                    active ? 'bg-white/5 border-cyan/20 scale-[1.02]' : 'bg-transparent border-white/5'
                  }`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                    active ? 'bg-cyan/15' : done ? 'bg-emerald/15' : 'bg-white/5'
                  }`}>
                    <Icon className={`h-3.5 w-3.5 ${active ? s.color : done ? 'text-emerald' : 'text-gray-600'}`} />
                  </div>
                  <span className={`text-xs transition-colors ${active ? 'text-white' : done ? 'text-gray-400' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                  {done && <Check className="h-3 w-3 text-emerald ml-auto" />}
                </div>
              );
            })}
          </div>

          {/* Payout bar */}
          <div className="pt-3 border-t border-white/8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-600">Atomic fund split</span>
              <span className="mono text-[10px] text-cyan">50 XLM</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
              <div className="bg-emerald" style={{ width: '75%' }} />
              <div className="bg-cyan" style={{ width: '10%' }} />
              <div className="bg-amber" style={{ width: '15%' }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px]">
              <span className="text-emerald">Seller 37.5</span>
              <span className="text-cyan">Royalty 5</span>
              <span className="text-amber">Upstream 7.5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -top-3 -right-3 panel px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-float">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
        <span className="text-[10px] text-gray-300 font-medium">Live on Mainnet + Testnet</span>
      </div>
    </div>
  );
}

function CodeLine({ line, text, color }: { line: number; text: string; color: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mono text-[10px] text-gray-700 select-none w-4 text-right">{line}</span>
      <span className={`mono text-[11px] ${color}`}>{text}</span>
    </div>
  );
}

/* ============================================================
   TRUST BAR
   ============================================================ */
function TrustBar() {
  const items = [
    'Soroban Smart Contracts',
    'Freighter Wallet',
    'Stellar Mainnet',
    'Stellar Testnet',
    'Atomic Settlement',
    'MIT Licensed',
    'Drips-Style Splits',
    'Zero-Dependency Widget',
    'Live + Sandbox Modes',
    'SCF Season 23',
  ];
  return (
    <section className="border-y border-white/8 py-5 overflow-hidden bg-obsidianLight/50">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 mx-6">
            <span className="h-1 w-1 rounded-full bg-cyan/40" />
            <span className="text-xs text-gray-500 font-medium tracking-wide">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   PROTOCOL DIAGRAM
   ============================================================ */
function ProtocolDiagram() {
  return (
    <section id="protocol" className="py-20 px-4 lg:px-6 relative">
      <div className="relative max-w-7xl mx-auto">
        <SectionHeader
          tag="Architecture"
          title="The Kiosk Protocol"
          subtitle="A Soroban-native escrow account that enforces transfer policies entirely on-chain — no centralized intermediary."
        />

        {/* Diagram */}
        <div className="mt-12 panel p-6 lg:p-10 relative overflow-hidden scan-overlay">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
            <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="30%" x2="75%" y2="25%" stroke="rgba(16,185,129,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="rgba(0,229,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="70%" x2="75%" y2="75%" stroke="rgba(245,158,11,0.15)" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          <div className="relative grid lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Left: Kiosk core */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl border border-cyan/20 animate-pulse-ring" />
                <div className="relative panel p-6 w-48 h-48 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-cyan/8 to-transparent">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/15 border border-cyan/25">
                    <Boxes className="h-6 w-6 text-cyan" />
                  </div>
                  <p className="text-sm font-bold text-white">Soroban Kiosk</p>
                  <p className="text-[11px] text-gray-500 leading-snug">On-chain escrow account</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="h-1 w-1 rounded-full bg-emerald animate-pulse" />
                    <span className="text-[9px] text-gray-600">Horizon RPC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Policy engine */}
            <div className="flex flex-col gap-3">
              <DiagramNode icon={Shield} label="Transfer Policy Engine" sub="Royalties · Splits · Timelocks" color="cyan" />
              <DiagramNode icon={GitBranch} label="Upstream Dependency Drip" sub="Auto-route to upstream crates" color="amber" />
              <DiagramNode icon={Lock} label="Escrow Release Modes" sub="Instant · Timelock · Multi-sig" color="emerald" />
            </div>

            {/* Right: Outputs */}
            <div className="flex flex-col gap-3">
              <DiagramNode icon={Code2} label="Embeddable Web Widget" sub="Drop into any site in 60s" color="cyan" />
              <DiagramNode icon={ShoppingCart} label="Atomic Checkout" sub="Sign → Split → Settle" color="emerald" />
              <DiagramNode icon={Activity} label="Real-time Ledger" sub="Track every payout on-chain" color="amber" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, value: '~5s', label: 'Settlement Finality', color: 'cyan' },
            { icon: Coins, value: '0.00001', label: 'XLM per Transaction', color: 'emerald' },
            { icon: Layers, value: '3', label: 'Escrow Release Modes', color: 'amber' },
            { icon: Globe, value: '∞', label: 'Upstream Recipients per Sale', color: 'cyan' },
          ].map((s, i) => {
            const Icon = s.icon;
            const colorCls: Record<string, string> = {
              cyan: 'text-cyan',
              emerald: 'text-emerald',
              amber: 'text-amber',
            };
            return (
              <div key={i} className="panel p-5 text-center hover:border-white/15 transition-all">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${colorCls[s.color]} opacity-60`} />
                <p className={`mono text-2xl font-bold ${colorCls[s.color]}`}>{s.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-600 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DiagramNode({
  icon: Icon,
  label,
  sub,
  color,
}: {
  icon: typeof Shield;
  label: string;
  sub: string;
  color: 'cyan' | 'emerald' | 'amber';
}) {
  const colors = {
    cyan: 'text-cyan border-cyan/15 bg-cyan/5',
    emerald: 'text-emerald border-emerald/15 bg-emerald/5',
    amber: 'text-amber border-amber/15 bg-amber/5',
  };
  return (
    <div className={`panel-tight p-3.5 flex items-center gap-3 rounded-xl border ${colors[color]} hover:scale-[1.02] transition-transform`}>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURES
   ============================================================ */
function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Composable Transfer Policies',
      desc: 'Set minimum prices, enforce creator royalties, and configure automated revenue splits — all on-chain, no custom contract code required.',
      color: 'cyan',
    },
    {
      icon: GitBranch,
      title: 'Upstream Dependency Drips',
      desc: 'Every sale automatically routes a percentage to upstream open-source crates and libraries. Drips-style splitting, built into the policy engine.',
      color: 'amber',
    },
    {
      icon: Code2,
      title: 'Embeddable Web Widget',
      desc: 'A zero-dependency Web Component that drops into any Docusaurus, Next.js, or GitHub Pages site. React, HTML, and iframe variants included.',
      color: 'emerald',
    },
    {
      icon: Lock,
      title: 'Three Escrow Modes',
      desc: 'Instant delivery for immediate settlement, timelock for delayed release, and multi-sig confirmation for high-value transfers.',
      color: 'cyan',
    },
    {
      icon: Wallet,
      title: 'Freighter + Live RPC',
      desc: 'Connect Freighter to switch into Live Account Mode. StellarKiosk queries Horizon directly — your real kiosk state is always on-chain, never in a database.',
      color: 'emerald',
    },
    {
      icon: Cpu,
      title: 'Soroban-Native Storage',
      desc: 'Kiosk state, listings, and policies are stored in Soroban contract storage. Each account gets its own scoped namespace — demo and live data never mix.',
      color: 'amber',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Capabilities"
          title="Everything you need to sell on-chain"
          subtitle="From listing to settlement, StellarKiosk handles the entire decentralized commerce lifecycle."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            const colors: Record<string, string> = {
              cyan: 'text-cyan bg-cyan/8 border-cyan/15',
              emerald: 'text-emerald bg-emerald/8 border-emerald/15',
              amber: 'text-amber bg-amber/8 border-amber/15',
            };
            return (
              <div
                key={i}
                className="panel p-6 group hover:border-white/15 transition-all hover:-translate-y-1 duration-300"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${colors[f.color]} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
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
      icon: Boxes,
      title: 'Initialize a Kiosk',
      desc: 'Connect Freighter or open Sandbox. Deploy a Soroban escrow contract with a single click — choose your settlement token (XLM or USDC).',
    },
    {
      num: '02',
      icon: Shield,
      title: 'Configure Policies',
      desc: 'Set royalties, upstream dependency drips, and your escrow release mode. The policy engine validates every transfer on-chain.',
    },
    {
      num: '03',
      icon: Code2,
      title: 'List & Embed',
      desc: 'Add items to your kiosk and copy a single embed snippet for your docs, blog, or marketplace. The widget handles checkout end-to-end.',
    },
    {
      num: '04',
      icon: Check,
      title: 'Settle Atomically',
      desc: 'Buyer signs once. Funds split to seller, creator, and upstream recipients in a single atomic Soroban transaction.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 lg:px-6 relative">
      <div className="absolute inset-0 bg-cyan-glow opacity-40" />
      <div className="relative max-w-7xl mx-auto">
        <SectionHeader
          tag="Workflow"
          title="From zero to settled in four steps"
          subtitle="No smart contract experience required. The dashboard handles every layer of complexity."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan/20 via-emerald/20 to-amber/20" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="relative">
                <div className="panel p-6 text-center group hover:border-white/15 transition-all">
                  <div className="relative inline-flex">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/15 to-emerald/5 border border-cyan/20 text-cyan group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="absolute -top-2 -right-2 mono text-[10px] font-bold text-cyan bg-obsidian border border-cyan/20 rounded-full px-1.5 py-0.5">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-4 mb-2">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-14 -right-2 h-4 w-4 text-gray-700 z-10" />
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
   MODE SECTION
   ============================================================ */
function ModeSection({ onEnter }: { onEnter: () => void }) {
  const [active, setActive] = useState<'live' | 'sandbox'>('live');

  const modes = {
    live: {
      icon: Radio,
      color: 'emerald' as const,
      label: 'Live Account Mode',
      badge: 'Freighter Connected',
      tagline: 'Real assets. Real settlement. Your Stellar account.',
      desc: 'Connect your Freighter wallet and StellarKiosk automatically detects your on-chain state. Your kiosks, listings, and policies are read directly from Horizon RPC — no intermediary database, no custodial risk.',
      points: [
        'Queries Horizon RPC for your live account data',
        'All kiosk state lives on-chain via Soroban storage',
        'Purchases execute real atomic transactions',
        'Works on Mainnet and Testnet, switchable in-app',
      ],
      cta: 'Connect Freighter & Go Live',
    },
    sandbox: {
      icon: FlaskConical,
      color: 'amber' as const,
      label: 'Sandbox Mode',
      badge: 'No wallet required',
      tagline: 'Explore the full protocol. No gas. No keys.',
      desc: 'Sandbox gives you a fully isolated environment to create kiosks, set policies, list items, and simulate purchases — completely offline. Demo data is scoped to your browser session and never touches the chain.',
      points: [
        'Full protocol simulation with realistic demo data',
        'Account-scoped storage — demo data stays separate from live',
        'No Freighter needed — great for demos and evaluation',
        'Switch to Live mode at any time without losing demo data',
      ],
      cta: 'Open Sandbox Dashboard',
    },
  };

  const m = modes[active];
  const ModeIcon = m.icon;
  const colorMap = {
    emerald: 'text-emerald border-emerald/20 bg-emerald/8',
    amber: 'text-amber border-amber/20 bg-amber/8',
  };
  const dotMap = { emerald: 'bg-emerald', amber: 'bg-amber' };
  const btnMap = {
    emerald: 'bg-emerald/20 text-emerald border border-emerald/30 hover:bg-emerald/30',
    amber: 'bg-amber/20 text-amber border border-amber/30 hover:bg-amber/30',
  };

  return (
    <section id="modes" className="py-20 px-4 lg:px-6 relative">
      <div className="absolute inset-0 bg-emerald-glow opacity-20" />
      <div className="relative max-w-7xl mx-auto">
        <SectionHeader
          tag="Two Modes"
          title="Live or Sandbox — you decide"
          subtitle="StellarKiosk works without a backend. Connect a wallet for real on-chain commerce, or explore everything instantly in Sandbox mode."
        />

        {/* Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {(['live', 'sandbox'] as const).map((k) => {
              const cfg = modes[k];
              const Ico = cfg.icon;
              const isActive = active === k;
              return (
                <button
                  key={k}
                  onClick={() => setActive(k)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? k === 'live'
                        ? 'bg-emerald/15 text-emerald border border-emerald/25'
                        : 'bg-amber/15 text-amber border border-amber/25'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Ico className="h-4 w-4" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="mt-8 panel p-0 overflow-hidden rounded-2xl max-w-4xl mx-auto">
          <div className={`px-6 py-4 border-b border-white/8 flex items-center gap-3 ${colorMap[m.color]}`}>
            <ModeIcon className="h-5 w-5" />
            <span className="text-sm font-semibold">{m.label}</span>
            <span className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${dotMap[m.color]} animate-pulse`} />
              {m.badge}
            </span>
          </div>

          <div className="p-6 lg:p-8 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
            <div>
              <p className="text-lg font-semibold text-white mb-3">{m.tagline}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
              <button
                onClick={onEnter}
                className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 ${btnMap[m.color]}`}
              >
                {m.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {m.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    active === 'live' ? 'bg-emerald/15' : 'bg-amber/15'
                  }`}>
                    <Check className={`h-3 w-3 ${active === 'live' ? 'text-emerald' : 'text-amber'}`} />
                  </div>
                  <span className="text-sm text-gray-300 leading-snug">{pt}</span>
                </div>
              ))}
            </div>
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
    {
      icon: Boxes,
      title: 'Kiosk Manager',
      desc: 'Initialize and manage your Soroban escrow account. Works in both Live and Sandbox modes.',
      color: 'cyan',
    },
    {
      icon: Shield,
      title: 'Escrow Policies',
      desc: 'Configure royalties, upstream drips, and escrow release modes with a visual editor.',
      color: 'emerald',
    },
    {
      icon: Code2,
      title: 'Embed Widget',
      desc: 'Customize and export your zero-dependency checkout widget code in React or HTML.',
      color: 'amber',
    },
    {
      icon: Store,
      title: 'Live Marketplace',
      desc: 'Browse all listed assets and execute atomic purchases via Freighter or Sandbox simulation.',
      color: 'cyan',
    },
    {
      icon: FileText,
      title: 'SCF Grant Proposal',
      desc: 'Export a publication-ready Stellar Community Fund grant application from your kiosk data.',
      color: 'emerald',
    },
  ];

  const colorMap: Record<string, string> = {
    cyan: 'text-cyan bg-cyan/8 border-cyan/15 group-hover:border-cyan/30',
    emerald: 'text-emerald bg-emerald/8 border-emerald/15 group-hover:border-emerald/30',
    amber: 'text-amber bg-amber/8 border-amber/15 group-hover:border-amber/30',
  };
  const arrowMap: Record<string, string> = {
    cyan: 'group-hover:text-cyan',
    emerald: 'group-hover:text-emerald',
    amber: 'group-hover:text-amber',
  };

  return (
    <section className="py-20 px-4 lg:px-6 relative">
      <div className="absolute inset-0 bg-cyan-glow opacity-25" />
      <div className="relative max-w-7xl mx-auto">
        <SectionHeader
          tag="Dashboard"
          title="Five powerful views, one protocol"
          subtitle="The StellarKiosk dashboard gives you full control over your decentralized commerce stack — from initialization to payout tracking."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {views.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="panel p-5 group hover:border-white/15 transition-all cursor-pointer hover:-translate-y-1 duration-200"
                onClick={onEnter}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border mb-3 transition-all group-hover:scale-110 ${colorMap[v.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{v.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                <ArrowUpRight className={`h-3.5 w-3.5 text-gray-700 mt-3 transition-colors ${arrowMap[v.color]}`} />
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
  const [btnText, setBtnText] = useState('Buy via StellarKiosk');
  const [radius, setRadius] = useState(12);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'react' | 'html'>('html');

  const isDark = theme === 'dark';

  const codeSnippet = tab === 'react'
    ? `import { StellarKioskButton } from '@stellarkiosk/widget';

export default function DocsPage() {
  return (
    <StellarKioskButton
      kioskId="kx7f2a..."
      itemId="im3b9c..."
      theme="${theme}"
      accentColor="${accent}"
      buttonText="${btnText}"
      borderRadius={${radius}}
      showPreview={${showPreview}}
    />
  );
}`
    : `<script src="https://cdn.stellarkiosk.io/widget.js"></script>
<stellar-kiosk-button
  kiosk-id="kx7f2a..."
  item-id="im3b9c..."
  theme="${theme}"
  accent-color="${accent}"
  button-text="${btnText}"
  border-radius="${radius}"
  ${showPreview ? 'show-preview' : ''}
></stellar-kiosk-button>`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="widget" className="py-20 px-4 lg:px-6 relative">
      <div className="absolute inset-0 bg-emerald-glow opacity-20" />
      <div className="relative max-w-7xl mx-auto">
        <SectionHeader
          tag="Embeddable Widget"
          title="Drop-in checkout for any site"
          subtitle="Customize the widget in real time, then copy a single line of code. Works everywhere."
        />

        <div className="mt-12 grid lg:grid-cols-[1fr_1fr] gap-5">
          {/* Controls */}
          <div className="panel p-6 space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-2">Theme</p>
              <div className="grid grid-cols-2 gap-2">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      theme === t ? 'bg-cyan/10 border-cyan/30 text-cyan' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {t === 'dark' ? 'Dark' : 'Light'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-2">Accent Color</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="h-9 w-12 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                />
                <span className="mono text-sm text-gray-400">{accent}</span>
                <div className="flex gap-1 ml-auto">
                  {['#00E5FF', '#10B981', '#F59E0B', '#F43F5E'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setAccent(c)}
                      className="h-8 w-8 rounded-lg border border-white/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-2">Button Text</p>
              <input
                value={btnText}
                onChange={(e) => setBtnText(e.target.value)}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Border Radius</p>
                <span className="mono text-xs text-cyan">{radius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={2}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/8">
              <div>
                <p className="text-sm text-white font-medium">Show Asset Preview</p>
                <p className="text-xs text-gray-500 mt-0.5">Display item thumbnail and price</p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showPreview ? 'bg-cyan/30' : 'bg-white/10'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${showPreview ? 'translate-x-5 bg-cyan' : 'translate-x-1 bg-gray-400'}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {['React', 'HTML', 'Next.js', 'Docusaurus', 'GitHub Pages'].map((p) => (
                <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Preview + Code */}
          <div className="space-y-4">
            {/* Live preview */}
            <div className="panel p-6">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-3">Live Preview</p>
              <div
                className="rounded-xl border p-5 transition-all"
                style={{
                  background: isDark ? '#0A0D14' : '#F8FAFC',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  borderRadius: `${radius}px`,
                }}
              >
                {showPreview && (
                  <div className="mb-3 flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
                      <ShoppingCart className="h-5 w-5" style={{ color: accent }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate" style={{ color: isDark ? '#fff' : '#0A0D14' }}>Soroban SDK License</p>
                      <p className="text-xs mono font-bold mt-0.5" style={{ color: accent }}>50 XLM</p>
                    </div>
                  </div>
                )}
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: accent,
                    color: isDark ? '#0A0D14' : '#fff',
                    borderRadius: `${radius}px`,
                    boxShadow: `0 4px 20px ${accent}30`,
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {btnText}
                </button>
              </div>
            </div>

            {/* Code snippet */}
            <div className="panel p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                  {(['html', 'react'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${tab === t ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                    >
                      {t === 'html' ? 'HTML' : 'React'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs mono leading-relaxed text-gray-300 overflow-x-auto max-h-52">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-2 text-sm text-cyan hover:text-cyan-dim transition-colors group"
          >
            Try the full widget customizer in the dashboard
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}


/* ============================================================
   CTA
   ============================================================ */
function CTA({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="py-20 px-4 lg:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative panel p-10 lg:p-14 text-center overflow-hidden rounded-2xl">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/8 via-transparent to-emerald/5" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl" style={{ background: 'radial-gradient(ellipse, rgba(0,229,255,0.08), transparent 70%)' }} />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-cyan" />
              <span className="text-xs text-cyan font-medium">Stellar Community Fund · Season 23</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Start selling on Stellar
              <br />
              <span className="text-gradient-cyan">in under 60 seconds</span>
            </h2>
            <p className="mt-4 text-sm text-gray-400 max-w-lg mx-auto">
              Connect Freighter to go live on Mainnet or Testnet, or jump straight into Sandbox mode
              — no wallet, no gas, no setup required.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                onClick={onEnter}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan text-obsidian font-semibold text-sm hover:bg-cyan-dim transition-all hover:shadow-xl hover:shadow-cyan/20 w-full sm:w-auto justify-center"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all w-full sm:w-auto justify-center"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </div>

            {/* Mode pills */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald/10 border border-emerald/20 text-[11px] text-emerald font-medium">
                <Radio className="h-3 w-3" />
                Live Account Mode
              </div>
              <span className="text-gray-700 text-xs">or</span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/10 border border-amber/20 text-[11px] text-amber font-medium">
                <FlaskConical className="h-3 w-3" />
                Sandbox Mode
              </div>
            </div>
          </div>
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
    <footer className="border-t border-white/8 py-10 px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-emerald/10 border border-cyan/20">
                <Zap className="h-4 w-4 text-cyan" fill="currentColor" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Stellar<span className="text-gradient-cyan">Kiosk</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
              Composable escrow and digital asset protocol on the Stellar Network and Soroban smart
              contract ecosystem. No backend. No database. Built for SCF Season 23.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
              <span className="ml-2 mono text-xs text-gray-700">v0.1.0 · MIT</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-3">Protocol</p>
            <div className="space-y-2">
              {['Architecture', 'Smart Contracts', 'Transfer Policies', 'Widget SDK'].map((l) => (
                <a key={l} href="#" className="block text-sm text-gray-500 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium mb-3">Resources</p>
            <div className="space-y-2">
              {['Documentation', 'SCF Grant Proposal', 'Roadmap', 'Community'].map((l) => (
                <a key={l} href="#" className="block text-sm text-gray-500 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">© 2026 StellarKiosk. Open-sourced under MIT License.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
              <span className="text-xs text-gray-600">Mainnet · Operational</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
              <span className="text-xs text-gray-600">Testnet · Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   SHARED
   ============================================================ */
function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/8 border border-cyan/15 text-[11px] uppercase tracking-wider text-cyan font-medium mb-4">
        <span className="h-1 w-1 rounded-full bg-cyan" />
        {tag}
      </span>
      <h2 className="text-2xl lg:text-4xl font-bold text-white tracking-tight leading-tight">{title}</h2>
      <p className="mt-4 text-sm lg:text-base text-gray-500 leading-relaxed">{subtitle}</p>
    </div>
  );
}
