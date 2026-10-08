import React, { useState } from 'react';
import { Shield, Sparkles, ArrowRight, Zap, CheckCircle2, ChevronRight, Lock, RefreshCw, ShoppingBag, ExternalLink } from 'lucide-react';

interface HeroProps {
  onExploreMarket: () => void;
  onExploreVault: () => void;
  onOpenConnectModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreMarket,
  onExploreVault,
  onOpenConnectModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative pt-6 pb-20 md:pb-28 overflow-hidden">
      {/* Deep Obsidian Background & Radial Violet Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-violet-800/10 blur-[180px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 -ml-3.5"></span>
            <span className="text-xs text-zinc-300 font-medium tracking-wide">Non-custodial Kiosk standard on Stellar & Soroban</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="text-purple-400">● Testnet Active</span>
            <span className="text-zinc-600">|</span>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>Contract: CB3AQG...67CLQQB</span>
              <ExternalLink className="w-3 h-3 text-purple-400" />
            </a>
          </div>
        </div>

        {/* Split Typography Header (Axon Layout with Authentic Protocol Copy) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          {/* Left: Giant Display Headline */}
          <div className="lg:col-span-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05]">
              Your assets, <br />
              <span className="text-gradient-control">fully in control</span>
            </h1>
          </div>

          {/* Right: Authentic Value Proposition & Web3 CTAs */}
          <div className="lg:col-span-4 flex flex-col justify-end gap-6 lg:pb-2">
            <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
              Autonomous digital asset vault primitive. Sellers retain non-custodial sovereignty while smart contracts atomically enforce creator royalties, upstream splits, and floor prices.
            </p>

            {/* Direct Web3 Protocol Action Pills */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary: Explore Marketplace */}
              <button
                onClick={onExploreMarket}
                className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-black font-bold text-xs tracking-tight hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span>Explore Catalog</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Secondary: Open Kiosk Vault */}
              <button
                onClick={onExploreVault}
                className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#12121e] border border-white/10 text-white font-semibold text-xs tracking-tight hover:bg-[#1a1a2a] hover:border-purple-500/30 transition-all duration-300 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Kiosk Vault</span>
              </button>

              {/* Testnet Explorer Link */}
              <a
                href="https://stellar.expert/explorer/testnet/contract/CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-mono hover:bg-purple-600/25 transition-all"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Centerpiece Visual: Iconic 3D Obsidian Emblem with Neon Violet Glow */}
        <div className="relative w-full rounded-[2.5rem] p-1.5 bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden group">
          <div className="relative w-full rounded-[calc(2.5rem-0.375rem)] bg-[#07070b] overflow-hidden min-h-[420px] sm:min-h-[520px] lg:min-h-[640px] flex items-center justify-center">
            {/* Ambient Backdrop Bloom */}
            <div className="absolute inset-0 bg-radial-glow opacity-80 pointer-events-none" />

            {/* High-Resolution Raytraced Emblem Asset */}
            <div
              className="relative w-full h-full max-w-4xl max-h-[580px] p-4 flex items-center justify-center cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={onExploreMarket}
            >
              <img
                src="/images/axon_emblem.jpg"
                alt="Axon Obsidian Emblem with Violet Glow"
                className={`w-full max-h-[580px] object-contain drop-shadow-[0_0_80px_rgba(168,85,247,0.5)] transition-all duration-700 ease-out ${
                  isHovered ? 'scale-105 rotate-1 filter brightness-110' : 'scale-100'
                }`}
              />

              {/* Floating Interactive Glass Badges over the Emblem */}
              <div className="absolute top-8 left-8 hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-[#0e0e18]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400 font-mono">Vault Invariant</div>
                  <div className="text-xs font-bold text-white">0% Custody Compromise</div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-[#0e0e18]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400 font-mono">Atomic Settlement</div>
                  <div className="text-xs font-bold text-white">100% Single-Envelope</div>
                </div>
              </div>
            </div>

            {/* Bottom Inner Bar inside the Hero container */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent flex flex-wrap items-center justify-between gap-4 border-t border-white/5">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">SETTLEMENT ESCROW</div>
                  <div className="text-sm font-semibold text-white">Atomic On-Chain</div>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <div className="text-[11px] font-mono text-zinc-500">TRANSFER POLICY</div>
                  <div className="text-sm font-semibold text-purple-300">Royalty & Multi-Split</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onExploreMarket}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  Explore Active Catalog
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Bottom Key Invariants Cards (Double Bezel) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            {
              title: 'Non-Custodial Primitive',
              desc: 'Assets stay in user-owned vault storage until programmatic purchase rules are fulfilled.',
              icon: Lock,
            },
            {
              title: 'Enforced Creator Royalties',
              desc: 'Hardcoded transfer policies guarantee creator percentages on every secondary sale.',
              icon: Sparkles,
            },
            {
              title: 'Multi-Split Upstream',
              desc: 'Distributes atomic payouts across protocol treasuries, DAOs, and affiliates instantaneously.',
              icon: RefreshCw,
            },
            {
              title: 'Soroban Smart Contract',
              desc: 'Built in Rust with soroban-sdk v21 running on Stellar Testnet ledger.',
              icon: Zap,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="double-bezel-outer group hover:border-purple-500/30 transition-all duration-300">
                <div className="double-bezel-inner p-5 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 group-hover:text-purple-300 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
