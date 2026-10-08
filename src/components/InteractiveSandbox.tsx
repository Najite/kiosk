import React, { useState } from 'react';
import { Sliders, ArrowRight, ShieldCheck, DollarSign, PieChart, Check } from 'lucide-react';

export const InteractiveSandbox: React.FC = () => {
  const [price, setPrice] = useState<number>(250);
  const [royaltyBps, setRoyaltyBps] = useState<number>(750); // 7.5%
  const [upstreamBps, setUpstreamBps] = useState<number>(250); // 2.5%

  const royaltyPct = royaltyBps / 100;
  const upstreamPct = upstreamBps / 100;
  const sellerPct = Math.max(0, 100 - royaltyPct - upstreamPct);

  const royaltyAmount = (price * royaltyPct) / 100;
  const upstreamAmount = (price * upstreamPct) / 100;
  const sellerAmount = price - royaltyAmount - upstreamAmount;

  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Payout Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Atomic Revenue Waterfall
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Test how Soroban atomically splits a single payment envelope across seller, creator, and upstream protocol treasuries in one ledger transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column */}
          <div className="lg:col-span-5 double-bezel-outer">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">Parameters</span>
                <span className="text-xs text-purple-400 font-mono">Zero-Rounding Precision</span>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-zinc-400">Checkout Price</span>
                  <span className="text-white font-mono font-bold text-sm">{price} XLM</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="2000"
                  step="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-2 bg-[#12121e] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>20 XLM</span>
                  <span>1000 XLM</span>
                  <span>2000 XLM</span>
                </div>
              </div>

              {/* Royalty Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-zinc-400">Creator Royalty</span>
                  <span className="text-purple-300 font-mono font-bold text-sm">
                    {royaltyPct.toFixed(1)}% ({royaltyBps} bps)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2500"
                  step="50"
                  value={royaltyBps}
                  onChange={(e) => setRoyaltyBps(Number(e.target.value))}
                  className="w-full h-2 bg-[#12121e] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>0% (0 bps)</span>
                  <span>12.5%</span>
                  <span>25% (2500 bps)</span>
                </div>
              </div>

              {/* Upstream Split Slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span className="text-zinc-400">Upstream Protocol Split</span>
                  <span className="text-violet-300 font-mono font-bold text-sm">
                    {upstreamPct.toFixed(1)}% ({upstreamBps} bps)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="25"
                  value={upstreamBps}
                  onChange={(e) => setUpstreamBps(Number(e.target.value))}
                  className="w-full h-2 bg-[#12121e] rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                  <span>0% (0 bps)</span>
                  <span>7.5%</span>
                  <span>15% (1500 bps)</span>
                </div>
              </div>

              {/* Summary Invariant */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>On-Chain Conservation Invariant</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Total output sum: <span className="text-white font-mono">{(sellerAmount + royaltyAmount + upstreamAmount).toFixed(2)} XLM</span> = 100% of incoming buyer payment envelope.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Waterfall Column */}
          <div className="lg:col-span-7 double-bezel-outer">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">Real-time Payout Breakdown</span>
                <span className="text-xs text-zinc-400 font-mono">Single Ledger Tx</span>
              </div>

              {/* Distribution Cards */}
              <div className="space-y-4">
                {/* Seller net */}
                <div className="p-4 rounded-2xl bg-[#141422] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                      {sellerPct.toFixed(1)}%
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Seller Net Payout</div>
                      <div className="text-sm font-bold text-white">Direct to Vault Owner</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">{sellerAmount.toFixed(2)} XLM</div>
                    <div className="text-[10px] font-mono text-zinc-400">SAC Token Transfer</div>
                  </div>
                </div>

                {/* Creator Royalty */}
                <div className="p-4 rounded-2xl bg-[#141422] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-sm">
                      {royaltyPct.toFixed(1)}%
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Creator Guaranteed Royalty</div>
                      <div className="text-sm font-bold text-white">Policy Recipient Address</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-purple-300">{royaltyAmount.toFixed(2)} XLM</div>
                    <div className="text-[10px] font-mono text-zinc-400">SAC Token Transfer</div>
                  </div>
                </div>

                {/* Upstream Protocol */}
                <div className="p-4 rounded-2xl bg-[#141422] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-600/20 text-fuchsia-300 flex items-center justify-center font-bold text-sm">
                      {upstreamPct.toFixed(1)}%
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Upstream Protocol Treasury</div>
                      <div className="text-sm font-bold text-white">Protocol DAO & Grants</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-fuchsia-300">{upstreamAmount.toFixed(2)} XLM</div>
                    <div className="text-[10px] font-mono text-zinc-400">SAC Token Transfer</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar Stack */}
              <div>
                <div className="h-3 w-full rounded-full bg-black/50 overflow-hidden flex p-0.5 border border-white/10">
                  <div
                    style={{ width: `${sellerPct}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-l-full transition-all duration-300"
                    title={`Seller: ${sellerPct}%`}
                  />
                  <div
                    style={{ width: `${royaltyPct}%` }}
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-300"
                    title={`Royalty: ${royaltyPct}%`}
                  />
                  <div
                    style={{ width: `${upstreamPct}%` }}
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-r-full transition-all duration-300"
                    title={`Upstream: ${upstreamPct}%`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 font-mono mt-2">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Seller ({sellerPct.toFixed(1)}%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400"></span> Royalty ({royaltyPct.toFixed(1)}%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-fuchsia-400"></span> Upstream ({upstreamPct.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
