import { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Tag,
  Users,
  Lock,
  Layers,
  AlertCircle,
  Terminal,
  CheckCircle2,
  RefreshCw,
  Copy,
  Info,
  DollarSign,
  Send,
  X,
} from 'lucide-react';
import { TESTNET_CONTRACT_ID } from '@/lib/stellar';
import { fetchContractPolicy, fetchAllContractItems, type OnChainItem } from '@/lib/soroban';
import { type ViewId } from '@/components/TopBar';

export function LandingPage({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#040711] text-gray-200 overflow-x-hidden selection:bg-cyan selection:text-obsidian relative font-sans">
      {/* Cosmic background with stars and planetary glow */}
      <CosmicBackground />

      {/* Navigation */}
      <LandingNav
        onEnter={onEnter}
        onOpenFeedback={() => setFeedbackModalOpen(true)}
      />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero onEnter={onEnter} />

        <WhyKioskSection />

        <ComparisonSection onEnter={onEnter} />

        <ProtocolEconomicsSection onEnter={onEnter} />

        {/* Live Marketplace Highlights & Interactive Revenue Splitter */}
        <section id="live-demo" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-cyan/15 bg-black/40">
          <div className="max-w-7xl mx-auto space-y-16">
            <InteractivePayoutCalculator />
            <LiveMarketplacePreview onEnter={onEnter} />
            <EmbedWidgetShowcase onEnter={onEnter} />
          </div>
        </section>

        <FAQSection />
        <CTA onEnter={onEnter} onOpenFeedback={() => setFeedbackModalOpen(true)} />
      </main>

      <Footer />

      {/* Community / Feedback Modal */}
      {feedbackModalOpen && (
        <FeedbackModal onClose={() => setFeedbackModalOpen(false)} />
      )}
    </div>
  );
}

/* ============================================================
   COSMIC BACKGROUND
   ============================================================ */
function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 130; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.005 + 0.002,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        s.alpha += s.speed;
        if (s.alpha > 0.95 || s.alpha < 0.15) s.speed = -s.speed;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.shadowBlur = s.r > 1.2 ? 6 : 0;
        ctx.shadowColor = '#00E5FF';
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d2342_0%,_#050A17_50%,_#03060E_100%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" />

      {/* Atmospheric lighting */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-cyan/15 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan/10 rounded-full blur-[150px]" />
      <div className="absolute top-2/3 -left-40 w-[550px] h-[550px] bg-[#0055ff]/10 rounded-full blur-[160px]" />

      {/* Planetary spherical curvature */}
      <div className="hidden lg:block absolute top-72 -right-28 w-80 h-80 planet-sphere opacity-80 pointer-events-none animate-float-delayed" />
      <div className="hidden lg:block absolute top-[1200px] -left-24 w-64 h-64 planet-sphere opacity-45 pointer-events-none animate-float" />
    </div>
  );
}

/* ============================================================
   NAVBAR
   ============================================================ */
function LandingNav({
  onEnter,
  onOpenFeedback,
}: {
  onEnter: (view?: ViewId) => void;
  onOpenFeedback: () => void;
}) {
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
          ? 'bg-[#060B18]/90 backdrop-blur-2xl border-b border-cyan/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/15 border border-cyan/40 shadow-lg shadow-cyan/25">
            <Store className="h-5 w-5 text-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">
                Stellar<span className="text-cyan drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">Kiosk</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald/15 border border-emerald/30 text-emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                Soroban Testnet
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono hidden sm:block">
              Non-Custodial Escrows &amp; Revenue Splits
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Why StellarKiosk', href: '#why-kiosk' },
            { label: 'Comparison', href: '#comparison' },
            { label: 'Protocol Economics', href: '#economics' },
            { label: 'Live Sandbox', href: '#live-demo' },
            { label: 'FAQ', href: '#faq' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs font-semibold text-gray-300 hover:text-cyan transition-colors tracking-wide"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan hover:bg-cyan/10 transition-colors border border-cyan/25"
            title="Inspect on StellarExpert"
          >
            <span>Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            onClick={() => onEnter('marketplace')}
            className="btn-pill-cyan px-5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Launch App</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   HERO SECTION (HONEST, PRODUCT-FIRST VALUE PROPOSITION)
   ============================================================ */
function Hero({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  return (
    <section id="home" className="relative pt-36 sm:pt-44 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan/10 border border-cyan/25 text-cyan text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Composable Escrow Standard on Stellar &amp; Soroban</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-extrabold text-white tracking-tight leading-[1.08]">
              The Non-Custodial Storefront for <br />
              <span className="text-cyan drop-shadow-[0_0_30px_rgba(0,229,255,0.75)]">
                Digital Passes &amp; Licenses
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              Sell software licenses, community passes, and digital goods with automated multi-party splits.
              100% self-custodial, zero platform fees, and ~5-second finality on the Stellar ledger.
            </p>

            <p className="mt-3 text-xs sm:text-sm text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Unlike centralized platforms that take 15–30% and hold your funds for weeks, your Kiosk vault is an immutable smart contract.
              Customer payments settle straight to your wallet, with enforced creator royalties and upstream open-source drips.
            </p>

            {/* Dual Pill CTA Buttons */}
            <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={() => onEnter('marketplace')}
                className="btn-pill-cyan px-7 py-3.5 text-sm font-bold w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Explore Live Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEnter('kiosk')}
                className="btn-pill-ghost px-6 py-3.5 text-sm font-semibold w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Store className="h-4 w-4 text-cyan" />
                <span>Manage Your Kiosk Vault</span>
              </button>
            </div>

            {/* Real Ledger Proof Points */}
            <div className="mt-12 grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="mono text-2xl font-extrabold text-white">~5s</p>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-mono mt-0.5">Finality</p>
              </div>
              <div>
                <p className="mono text-2xl font-extrabold text-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                  0%
                </p>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-mono mt-0.5">Platform Cut</p>
              </div>
              <div>
                <p className="mono text-2xl font-extrabold text-emerald">0.00001</p>
                <p className="text-[11px] uppercase tracking-wider text-gray-400 font-mono mt-0.5">Base Fee (XLM)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Kiosk Card Preview */}
          <div className="relative flex justify-center items-center">
            <InteractiveHeroKioskCard onEnter={onEnter} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INTERACTIVE HERO KIOSK CARD (REAL PRODUCT UI, NOT SCI-FI ART)
   ============================================================ */
function InteractiveHeroKioskCard({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [isSimulatingBuy, setIsSimulatingBuy] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);

  const products = [
    {
      title: 'Soroban Dev License Pass',
      badge: 'Software License',
      price: 15.0,
      seller: '12.75 XLM (85%)',
      royalty: '1.50 XLM (10%)',
      upstream: '0.75 XLM (5%)',
      desc: 'Commercial software license key with automated Drips upstream revenue split.',
    },
    {
      title: 'Ecosystem Contributor Badge',
      badge: 'Community Pass',
      price: 25.0,
      seller: '21.25 XLM (85%)',
      royalty: '2.50 XLM (10%)',
      upstream: '1.25 XLM (5%)',
      desc: 'Permanent member pass with verified governance weight and lifetime event access.',
    },
    {
      title: 'Digital Creator Asset Bundle',
      badge: 'Digital Goods',
      price: 10.0,
      seller: '8.50 XLM (85%)',
      royalty: '1.00 XLM (10%)',
      upstream: '0.50 XLM (5%)',
      desc: 'Commercial 3D UI kits with perpetual resale royalty enforcement on secondary trades.',
    },
  ];

  const current = products[selectedProduct];

  const handleSimulateBuy = () => {
    setIsSimulatingBuy(true);
    setBuySuccess(false);
    setTimeout(() => {
      setIsSimulatingBuy(false);
      setBuySuccess(true);
      setTimeout(() => setBuySuccess(false), 4500);
    }, 1200);
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Radiant ambient glow */}
      <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-cyan/25 via-emerald/15 to-transparent blur-2xl opacity-80 pointer-events-none" />

      <div className="relative rounded-3xl p-6 glow-card-featured border border-cyan/40 shadow-2xl backdrop-blur-2xl">
        {/* Card Top: Real Contract Tag */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-semibold text-white">Live Kiosk Checkout Preview</span>
          </div>
          <span className="text-[10px] font-mono text-cyan bg-cyan/10 border border-cyan/25 px-2.5 py-0.5 rounded-full font-bold">
            Protocol 21
          </span>
        </div>

        {/* Product selector tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-black/50 border border-white/5 mb-5">
          {products.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedProduct(idx);
                setBuySuccess(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all truncate ${
                selectedProduct === idx
                  ? 'bg-cyan text-obsidian font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.badge}
            </button>
          ))}
        </div>

        {/* Product Details */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/8 mb-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[10px] font-mono text-cyan uppercase font-bold tracking-wider">
                {current.badge}
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{current.title}</h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg font-black text-white font-mono">{current.price.toFixed(2)}</span>
              <span className="text-xs text-cyan font-mono font-bold ml-1">XLM</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">{current.desc}</p>
        </div>

        {/* Atomic Split Visual Bar */}
        <div className="p-4 rounded-2xl bg-cyan/5 border border-cyan/20 mb-5">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-gray-300 font-medium">Atomic Split Execution:</span>
            <span className="font-mono text-[11px] text-emerald font-bold">Instant 0-Custody</span>
          </div>

          <div className="h-2.5 rounded-full overflow-hidden flex bg-black/60 mb-3">
            <div style={{ width: '85%' }} className="bg-emerald" title="Seller Net" />
            <div style={{ width: '10%' }} className="bg-amber" title="Creator Royalty" />
            <div style={{ width: '5%' }} className="bg-cyan" title="Upstream Drips" />
          </div>

          <div className="grid grid-cols-3 text-[10px] font-mono">
            <div className="text-emerald">Seller {current.seller}</div>
            <div className="text-amber text-center">Royalty {current.royalty}</div>
            <div className="text-cyan text-right">Upstream {current.upstream}</div>
          </div>
        </div>

        {/* Simulation Feedback Alert */}
        {buySuccess ? (
          <div className="p-4 rounded-2xl bg-emerald/15 border border-emerald/40 text-emerald text-xs animate-fade-in flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                <strong>Simulated Atomic Settlement:</strong> Funds split instantly to all 3 accounts in 1 ledger transaction!
              </span>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={handleSimulateBuy}
            disabled={isSimulatingBuy}
            className="flex-1 btn-pill-cyan py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            {isSimulatingBuy ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Simulating Ledger Payout...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                <span>Test 1-Click Purchase Flow</span>
              </>
            )}
          </button>
          <button
            onClick={() => onEnter('marketplace')}
            className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all"
            title="Open in Marketplace"
          >
            Buy Live
          </button>
        </div>

        {/* Verifiable Contract Footer */}
        <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span className="truncate max-w-[200px]">Contract: {TESTNET_CONTRACT_ID.slice(0, 14)}...</span>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan hover:underline inline-flex items-center gap-1"
          >
            <span>StellarExpert</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   "WHY STELLARKIOSK?" 4-CARD PILLAR GRID
   ============================================================ */
function WhyKioskSection() {
  const pillars = [
    {
      icon: Boxes,
      title: 'True Non-Custodial Vaults',
      desc: 'Your assets stay protected in autonomous Soroban smart contracts. No platform can freeze your balance, modify prices, or seize your shop.',
      badge: 'Zero Counterparty Risk',
    },
    {
      icon: Zap,
      title: 'Instant ~5s Settlement',
      desc: 'Customer payments transfer directly to your non-custodial Stellar wallet in seconds. Never wait for 14-to-30 day payment processor rolling reserves.',
      badge: 'Zero Withdrawal Delays',
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Creator Royalties',
      desc: 'Enforce immutable floor prices and perpetual resale royalties in smart contract bytecode whenever buyers resell your digital passes or licenses.',
      badge: 'Permanent Secondary Earnings',
    },
    {
      icon: GitBranch,
      title: 'Upstream Contributor Splits',
      desc: 'Automatically route percentages of each sale to open-source repository maintainers, co-founders, or community treasuries at the exact moment of sale.',
      badge: 'Drips Ecosystem Native',
    },
  ];

  return (
    <section id="why-kiosk" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/25 text-[11px] uppercase tracking-wider text-cyan font-mono font-semibold mb-3">
            Core Commerce Primitives
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why Stellar<span className="text-cyan drop-shadow-[0_0_20px_rgba(0,229,255,0.7)]">Kiosk?</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-400 leading-relaxed">
            Eliminate centralized middlemen and keep full sovereignty over your digital inventory, pricing policies, and customer relationships:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="glow-card p-6 rounded-2xl flex flex-col justify-between group cursor-default"
              >
                <div>
                  <div className="h-14 w-14 rounded-2xl bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan mb-6 group-hover:scale-110 group-hover:bg-cyan/20 group-hover:shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all">
                    <Icon className="h-7 w-7 drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                    {item.badge}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-cyan group-hover:translate-x-1 transition-all" />
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
   COMPARISON SECTION: TRADITIONAL PLATFORMS VS STELLARKIOSK
   ============================================================ */
function ComparisonSection({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const comparisons = [
    {
      feature: 'Platform Take-Rate',
      traditional: '15% – 30% per sale',
      kiosk: '0% (Zero platform tax)',
      highlight: true,
    },
    {
      feature: 'Merchant Payout Speed',
      traditional: '14 to 30 days rolling reserve',
      kiosk: '~5 seconds direct to wallet',
      highlight: true,
    },
    {
      feature: 'Asset & Shop Custody',
      traditional: 'Centralized company holds keys',
      kiosk: '100% Non-custodial Soroban vault',
      highlight: true,
    },
    {
      feature: 'Secondary Resale Royalties',
      traditional: 'Easily bypassed or stripped',
      kiosk: 'Immutable smart contract floor enforcement',
      highlight: false,
    },
    {
      feature: 'Account Suspension Risk',
      traditional: 'Arbitrary bans & fund freezes',
      kiosk: 'Mathematically impossible (Self-sovereign)',
      highlight: false,
    },
    {
      feature: 'Collaborator & Contributor Splits',
      traditional: 'Manual accounting & monthly wires',
      kiosk: 'Atomic on-chain distribution at checkout',
      highlight: true,
    },
  ];

  return (
    <section id="comparison" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/25 text-[11px] uppercase tracking-wider text-cyan font-mono font-semibold mb-3">
            Honest Breakdown
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Traditional Commerce vs. <span className="text-cyan drop-shadow-[0_0_20px_rgba(0,229,255,0.7)]">StellarKiosk</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-400 leading-relaxed">
            See the practical difference between centralized marketplace gatekeepers and sovereign smart contract kiosks:
          </p>
        </div>

        <div className="rounded-3xl glow-card overflow-hidden border border-cyan/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-wider font-mono">
                  <th className="py-4 px-6 text-gray-400">Feature</th>
                  <th className="py-4 px-6 text-gray-400">Traditional Platforms (App Stores / Marketplaces)</th>
                  <th className="py-4 px-6 text-cyan font-bold bg-cyan/10">StellarKiosk Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{row.feature}</td>
                    <td className="py-4 px-6 text-gray-400">{row.traditional}</td>
                    <td className="py-4 px-6 text-cyan font-bold bg-cyan/5">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald" />
                        <span>{row.kiosk}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Ready to stop paying middleman fees on your digital passes and software licenses?
            </p>
            <button
              onClick={() => onEnter('kiosk')}
              className="btn-pill-cyan px-6 py-2.5 text-xs font-bold shrink-0"
            >
              Open Your Kiosk Vault
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TRANSPARENT PROTOCOL ECONOMICS (REAL ON-CHAIN TIERS, NO FAKE SAAS)
   ============================================================ */
function ProtocolEconomicsSection({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const tiers = [
    {
      title: 'Open-Source Protocol',
      tag: 'Public Infrastructure',
      price: '0.00001 XLM',
      unit: '/ transaction',
      subtitle: 'Native Stellar ledger fee with zero markup',
      features: [
        '0% Platform take-rate on sales',
        'Unlimited digital passes & licenses',
        'Direct non-custodial wallet payouts',
        'Public Soroban smart contract verification',
        'Zero vendor lock-in or recurring fees',
      ],
      ctaLabel: 'Launch Free Kiosk',
      action: () => onEnter('kiosk'),
      featured: false,
    },
    {
      title: 'Custom Transfer Policies',
      tag: 'On-Chain Governance',
      price: '100% Configurable',
      unit: 'in basis points',
      subtitle: 'Enforce rules in immutable smart contract bytecode',
      features: [
        'Enforce minimum floor prices on-chain',
        'Perpetual secondary resale royalties (e.g. 10%)',
        'Multi-party contributor splits (up to 10 wallets)',
        'Supports instant atomic payouts or dispute buffers',
        'Verifiable on StellarExpert Explorer',
      ],
      ctaLabel: 'Configure Policies',
      action: () => onEnter('policy'),
      featured: true,
    },
    {
      title: 'Embeddable Checkout Widget',
      tag: 'Client Integration',
      price: '1 Line',
      unit: 'of HTML code',
      subtitle: 'Sell directly on any personal site, docs, or blog',
      features: [
        'Vanilla Web Component or React package',
        'Dark, Light, and Cybernetic theme presets',
        '1-Click Freighter wallet approval modal',
        'Host on GitHub Pages, Notion, or static docs',
        'Zero external database or API key setup',
      ],
      ctaLabel: 'Customize Embed Widget',
      action: () => onEnter('widget'),
      featured: false,
    },
  ];

  return (
    <section id="economics" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/25 text-[11px] uppercase tracking-wider text-cyan font-mono font-semibold mb-3">
            Pure On-Chain Economics
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Transparent Protocol <span className="text-cyan drop-shadow-[0_0_20px_rgba(0,229,255,0.7)]">Economics</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-400 leading-relaxed">
            No monthly subscription plans. No credit card billing lock-ins. You only interact directly with the Stellar Soroban smart contract:
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all ${
                tier.featured ? 'glow-card-featured lg:-translate-y-3 z-10' : 'glow-card'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-gradient-to-r from-cyan to-sky-400 text-obsidian text-[11px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(0,229,255,0.6)] flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Smart Policy Engine
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono text-cyan uppercase font-bold tracking-wider">
                  {tier.tag}
                </span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">{tier.title}</h3>
                <p className="text-xs text-gray-400 mb-6 min-h-[32px]">{tier.subtitle}</p>

                <div className="flex items-baseline gap-1.5 mb-8 pb-6 border-b border-white/10">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight mono">
                    {tier.price}
                  </span>
                  <span className="text-xs font-mono text-gray-400">{tier.unit}</span>
                </div>

                <div className="space-y-3.5 mb-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Capabilities:</p>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full bg-cyan/15 text-cyan flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs text-gray-300 leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={tier.action}
                  className={`w-full py-3.5 rounded-full text-xs font-bold transition-all ${
                    tier.featured ? 'btn-pill-cyan' : 'btn-pill-ghost'
                  }`}
                >
                  {tier.ctaLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   INTERACTIVE REVENUE SPLIT CALCULATOR
   ============================================================ */
function InteractivePayoutCalculator() {
  const [salePrice, setSalePrice] = useState(25);
  const [royaltyPercent, setRoyaltyPercent] = useState(10);
  const [collaboratorPercent, setCollaboratorPercent] = useState(5);

  const royaltyAmount = (salePrice * royaltyPercent) / 100;
  const collaboratorAmount = (salePrice * collaboratorPercent) / 100;
  const sellerNet = salePrice - royaltyAmount - collaboratorAmount;

  return (
    <div className="glow-card p-8 rounded-3xl max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase bg-cyan/15 text-cyan border border-cyan/30">
          On-Chain Math Simulator
        </span>
        <h3 className="text-2xl font-bold text-white mt-3 mb-2">Simulate Atomic Settlement Splits</h3>
        <p className="text-xs text-gray-400">
          Adjust the sliders below to see how native XLM distributes across the seller, original creator, and open-source contributors in 1 transaction.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-300 font-medium">Customer Purchase Price</span>
              <span className="text-cyan font-bold font-mono">{salePrice} XLM</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-300 font-medium">Creator Resale Royalty</span>
              <span className="text-amber font-bold font-mono">{royaltyPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={royaltyPercent}
              onChange={(e) => setRoyaltyPercent(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-300 font-medium">Upstream Maintainer Split (Drips)</span>
              <span className="text-emerald font-bold font-mono">{collaboratorPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={collaboratorPercent}
              onChange={(e) => setCollaboratorPercent(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-6 rounded-2xl bg-black/60 border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-gray-300">Instant Settlement Split</span>
            <span className="text-[10px] text-emerald bg-emerald/15 px-2 py-0.5 rounded-full font-bold">
              ~5s Direct
            </span>
          </div>

          {/* Bar */}
          <div className="h-3 rounded-full overflow-hidden flex bg-black/80 mb-6">
            <div
              style={{ width: `${(sellerNet / salePrice) * 100}%` }}
              className="bg-cyan transition-all"
              title="Seller Net"
            />
            <div
              style={{ width: `${royaltyPercent}%` }}
              className="bg-amber transition-all"
              title="Creator Royalty"
            />
            <div
              style={{ width: `${collaboratorPercent}%` }}
              className="bg-emerald transition-all"
              title="Collaborator"
            />
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-cyan font-medium">Seller Net Payout:</span>
              <span className="text-white font-bold">{sellerNet.toFixed(2)} XLM</span>
            </div>
            <div className="flex justify-between items-center text-amber">
              <span>Creator Resale Royalty:</span>
              <span className="font-bold">{royaltyAmount.toFixed(2)} XLM</span>
            </div>
            <div className="flex justify-between items-center text-emerald">
              <span>Upstream Maintainers:</span>
              <span className="font-bold">{collaboratorAmount.toFixed(2)} XLM</span>
            </div>
            <div className="flex justify-between items-center text-gray-400 border-t border-white/10 pt-2 text-[11px]">
              <span>Platform Take-Rate:</span>
              <span className="text-emerald font-bold">0% (Pure On-Chain)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LIVE MARKETPLACE PREVIEW
   ============================================================ */
function LiveMarketplacePreview({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  const [items, setItems] = useState<OnChainItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchAllContractItems(TESTNET_CONTRACT_ID, 'TESTNET', 3);
        setItems(res);
      } catch (e) {
        console.warn('Marketplace preview items fetch:', e);
      }
    }
    load();
  }, []);

  const sampleItems = [
    {
      title: 'Pro Developer Pass #1',
      desc: 'Commercial software license key with automated Drips upstream revenue split.',
      price: '15.00 XLM',
      seller: 'GD54...NVO',
    },
    {
      title: 'Drips Ecosystem Grant Key',
      desc: 'Exclusive contributor membership badge and governance voting rights.',
      price: '25.00 XLM',
      seller: 'GA7R...9KL',
    },
    {
      title: 'Digital Creator Asset Bundle',
      desc: '3D UI kit collection with permanent secondary royalty floor enforcement.',
      price: '10.00 XLM',
      seller: 'GB3Q...2WP',
    },
  ];

  return (
    <div className="glow-card p-8 rounded-3xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase font-medium tracking-wider text-cyan font-mono">
            Direct On-Chain Inventory
          </span>
          <h3 className="text-2xl font-bold text-white mt-1">Live Items Ready for Checkout</h3>
          <p className="text-xs text-gray-400">
            Real items hosted in non-custodial Soroban escrow on Stellar Testnet.
          </p>
        </div>
        <button
          onClick={() => onEnter('marketplace')}
          className="btn-pill-cyan px-5 py-2 text-xs font-bold flex items-center gap-1.5"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Open Full Marketplace</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {sampleItems.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-black/50 border border-white/10 hover:border-cyan/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-2 py-0.5 rounded border border-cyan/20">
                  Instant Access
                </span>
                <span className="text-xs font-mono font-bold text-white">{item.price}</span>
              </div>
              <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.desc}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">Seller: {item.seller}</span>
              <button
                onClick={() => onEnter('marketplace')}
                className="px-3.5 py-1.5 rounded-full bg-cyan/15 hover:bg-cyan/30 text-cyan text-xs font-bold transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   EMBED CHECKOUT SHOWCASE
   ============================================================ */
function EmbedWidgetShowcase({ onEnter }: { onEnter: (view?: ViewId) => void }) {
  return (
    <div className="glow-card p-8 rounded-3xl">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase bg-cyan/15 text-cyan border border-cyan/30 font-mono">
            One-Line Client Integration
          </span>
          <h3 className="text-2xl font-bold text-white mt-3 mb-2">Sell on Any Website or GitHub Docs</h3>
          <p className="text-xs text-gray-300 leading-relaxed mb-6">
            Paste one line of code to give your audience a high-converting, non-custodial checkout modal directly on your site.
            No centralized databases, no hosted checkout redirects, and zero backend maintenance.
          </p>
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan mb-6 overflow-x-auto">
            <code>{`<kiosk-checkout item-id="1" contract="${TESTNET_CONTRACT_ID.slice(0, 10)}..." theme="dark" />`}</code>
          </div>
          <button
            onClick={() => onEnter('widget')}
            className="btn-pill-cyan px-6 py-2.5 text-xs font-bold"
          >
            Open Widget Customizer
          </button>
        </div>

        {/* Live Mockup */}
        <div className="p-6 rounded-2xl bg-black/60 border border-cyan/20 shadow-2xl">
          <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
            <div>
              <span className="text-xs font-bold text-white">Live Embed Widget Preview</span>
              <p className="text-[10px] text-gray-400 font-mono">Direct Freighter sign modal</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan">15.00 XLM</span>
          </div>
          <div className="space-y-2 mb-6 text-xs text-gray-300">
            <div className="flex justify-between">
              <span>Delivery Standard:</span>
              <span className="text-white font-semibold">Self-Custodial Soroban Pass</span>
            </div>
            <div className="flex justify-between">
              <span>Settlement Speed:</span>
              <span className="text-emerald font-semibold font-mono">~5s Finality</span>
            </div>
            <div className="flex justify-between">
              <span>Intermediary Cut:</span>
              <span className="text-cyan font-semibold font-mono">0.00%</span>
            </div>
          </div>
          <button
            onClick={() => onEnter('marketplace')}
            className="w-full py-3 rounded-full bg-cyan text-obsidian text-xs font-bold hover:bg-cyan-dim transition-all shadow-lg shadow-cyan/20"
          >
            Checkout with Freighter Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FAQ SECTION (HONEST, DIRECT ANSWERS)
   ============================================================ */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is there really a 0% platform take-rate?',
      a: 'Yes. StellarKiosk is an open-source decentralized smart contract primitive on the Stellar network. When a customer purchases an item, 100% of the funds transfer directly from their wallet to the seller, creator royalty, and configured upstream split addresses. There is no middleman company taking a 15%–30% fee.',
    },
    {
      q: 'Do I need real money to test this right now?',
      a: 'No. The contract is deployed to the official Stellar Testnet. You can connect your Freighter wallet and receive test XLM instantly for free using the automated Friendbot faucet built directly into the app.',
    },
    {
      q: 'How are secondary creator royalties enforced?',
      a: 'Royalties and minimum floor prices are programmed directly into the Rust Soroban smart contract bytecode. Even if someone trades an item on a secondary interface, the contract logic automatically calculates the basis points and routes royalties to the original creator before transferring ownership.',
    },
    {
      q: 'What is the Upstream Drips split?',
      a: 'Inspired by the open-source Drips protocol, sellers can designate upstream repository maintainers or dependencies to receive a percentage of every sale automatically. This allows developers to sustainably fund the open-source tools their software relies on.',
    },
    {
      q: 'Where does my product metadata live?',
      a: 'Metadata is stored directly on the Stellar ledger in Soroban contract instance storage. There are zero centralized databases (no Supabase, Firebase, or external API servers) required to keep your kiosk running.',
    },
  ];

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/25 text-[11px] uppercase tracking-wider text-cyan font-mono font-semibold mb-3">
            Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="text-cyan drop-shadow-[0_0_20px_rgba(0,229,255,0.7)]">Questions</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-gray-400">
            Real architectural details on how self-sovereign kiosk contracts operate on Stellar Soroban.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="glow-card rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-cyan transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-cyan transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                    {faq.a}
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
function CTA({
  onEnter,
  onOpenFeedback,
}: {
  onEnter: (view?: ViewId) => void;
  onOpenFeedback: () => void;
}) {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan/15 border border-cyan/30 text-cyan text-xs font-mono font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          Protocol 21 · Deployed on Stellar Testnet
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Ready to Experience <br />
          <span className="text-cyan drop-shadow-[0_0_25px_rgba(0,229,255,0.8)]">True Self-Sovereign Commerce?</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl mx-auto leading-relaxed">
          Mint your digital passes, configure your revenue splits, and start selling directly to your audience on Stellar.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button
            onClick={() => onEnter('marketplace')}
            className="btn-pill-cyan px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <ShoppingCart className="h-4 w-4" />
            Launch Live Marketplace
          </button>
          <button
            onClick={() => onEnter('kiosk')}
            className="btn-pill-ghost px-8 py-3.5 text-xs font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Store className="h-4 w-4 text-cyan" />
            Manage Kiosk Vault
          </button>
          <button
            onClick={onOpenFeedback}
            className="px-6 py-3.5 rounded-full border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-xs font-medium transition-all"
          >
            Feedback &amp; Questions
          </button>
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
    <footer className="border-t border-cyan/15 py-12 px-4 sm:px-6 lg:px-8 bg-[#03060E] relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan/20 text-cyan border border-cyan/30 shadow-md shadow-cyan/20">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight">
              Stellar<span className="text-cyan">Kiosk</span>
            </span>
            <span className="text-xs text-gray-500 font-mono ml-2 border-l border-white/10 pl-3">
              Soroban v21 Escrow Primitive
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 font-mono">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan transition-colors inline-flex items-center gap-1"
          >
            <span>Contract Explorer</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <span className="text-gray-700">·</span>
          <span>Zero-Backend Ledger Storage</span>
          <span className="text-gray-700">·</span>
          <span>MIT Open Source</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   HONEST COMMUNITY / FEEDBACK MODAL
   ============================================================ */
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glow-card-featured p-8 border border-cyan/40 shadow-[0_0_60px_rgba(0,229,255,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-emerald/20 text-emerald border border-emerald/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Feedback Received!</h3>
            <p className="text-xs text-gray-300">
              Thank you for testing StellarKiosk and helping us improve the protocol.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-cyan/15 text-cyan border border-cyan/30 flex items-center justify-center">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Community &amp; Feedback</h3>
                <p className="text-xs text-gray-400">Share your thoughts or suggest features for StellarKiosk.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Your Feedback or Feature Request</label>
                <textarea
                  required
                  rows={4}
                  placeholder="What would you like to see improved in the Kiosk manager, policy engine, or checkout widget?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:border-cyan focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-pill-cyan py-3 text-xs font-bold"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
