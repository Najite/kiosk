import React, { useState, useEffect } from 'react';
import { TransferPolicy, UpstreamSplit } from '../../types';
import { executeSetPolicy } from '../../lib/soroban';
import { ShieldAlert, Plus, Trash2, CheckCircle2, Lock, Save, ExternalLink, Sliders, AlertCircle, RefreshCw } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

interface PolicyEngineViewProps {
  policy: TransferPolicy;
  onRefreshData: () => Promise<void>;
}

export const PolicyEngineView: React.FC<PolicyEngineViewProps> = ({
  policy,
  onRefreshData,
}) => {
  const { address, isConnected, connectWallet } = useWallet();
  const [royaltyBps, setRoyaltyBps] = useState(policy.royaltyBps);
  const [royaltyRecipient, setRoyaltyRecipient] = useState(policy.royaltyRecipient);
  const [minFloorPrice, setMinFloorPrice] = useState(policy.minFloorPrice);
  const [upstreamSplits, setUpstreamSplits] = useState<UpstreamSplit[]>(policy.upstreamSplits);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  useEffect(() => {
    setRoyaltyBps(policy.royaltyBps);
    setRoyaltyRecipient(policy.royaltyRecipient);
    setMinFloorPrice(policy.minFloorPrice);
    setUpstreamSplits(policy.upstreamSplits);
  }, [policy]);

  const handleAddSplit = () => {
    setUpstreamSplits([
      ...upstreamSplits,
      {
        recipient: '',
        bps: 100,
        label: `Partner #${upstreamSplits.length + 1}`,
      },
    ]);
  };

  const handleRemoveSplit = (index: number) => {
    setUpstreamSplits(upstreamSplits.filter((_, i) => i !== index));
  };

  const handleSplitChange = (index: number, field: keyof UpstreamSplit, value: any) => {
    const updated = [...upstreamSplits];
    updated[index] = { ...updated[index], [field]: value };
    setUpstreamSplits(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessTxHash(null);

    try {
      const res = await executeSetPolicy({
        callerAddress: address,
        royaltyBps,
        royaltyRecipient,
        minFloorPriceInXlm: minFloorPrice,
        upstreamSplits: upstreamSplits.map((s) => ({
          recipient: s.recipient,
          shareBps: s.bps,
        })),
      });

      setSuccessTxHash(res.txHash);
      await onRefreshData();
    } catch (err: any) {
      console.error('Set policy failed:', err);
      setErrorMessage(err?.message || 'Failed to update policy on Soroban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUpstreamBps = upstreamSplits.reduce((acc, s) => acc + s.bps, 0);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-3">
            <Sliders className="w-3.5 h-3.5" />
            <span>On-Chain Policy Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transfer Policy Configuration
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Program enforceable royalties, upstream revenue splits, and floor prices executed atomically by the Soroban contract.
          </p>
        </div>
      </div>

      {successTxHash && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Policy Broadcasted to Soroban! Tx: <span className="font-mono">{successTxHash.slice(0, 16)}...</span></span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${successTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-mono underline"
          >
            <span>Explorer Receipt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Policy Fields */}
        <div className="lg:col-span-6 space-y-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Primary Royalty Parameters</span>
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Creator Royalty (in Basis Points, 100 bps = 1%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="25"
                    value={royaltyBps}
                    onChange={(e) => setRoyaltyBps(Number(e.target.value))}
                    className="flex-1 h-2 bg-[#12121e] rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <span className="w-24 text-right font-mono font-bold text-white text-sm">
                    {(royaltyBps / 100).toFixed(2)}% ({royaltyBps} bps)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Royalty Recipient Address
                </label>
                <input
                  type="text"
                  required
                  value={royaltyRecipient}
                  onChange={(e) => setRoyaltyRecipient(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Minimum Floor Price (XLM)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minFloorPrice}
                  onChange={(e) => setMinFloorPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Enforced on-chain by the smart contract before any listing can be confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upstream Splits */}
        <div className="lg:col-span-6 space-y-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-violet-400" />
                  <span>Upstream Splits ({upstreamSplits.length})</span>
                </h3>
                <span className="text-xs text-purple-400 font-mono">
                  Total: {(totalUpstreamBps / 100).toFixed(2)}%
                </span>
              </div>

              <div className="space-y-4">
                {upstreamSplits.map((split, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-[#12121e] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={split.label}
                        onChange={(e) => handleSplitChange(index, 'label', e.target.value)}
                        className="bg-transparent text-xs font-bold text-white focus:outline-none border-b border-white/20 pb-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSplit(index)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono mb-1">
                          Recipient
                        </label>
                        <input
                          type="text"
                          value={split.recipient}
                          onChange={(e) => handleSplitChange(index, 'recipient', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase font-mono mb-1">
                          Share (bps)
                        </label>
                        <input
                          type="number"
                          value={split.bps}
                          onChange={(e) => handleSplitChange(index, 'bps', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSplit}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Upstream Recipient</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting to Soroban...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update On-Chain Policy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
