import React, { useState } from 'react';
import { ListingItem, TransferPolicy } from '../types';
import { useWallet } from '../context/WalletContext';
import { executePurchase } from '../lib/soroban';
import { Zap, ShieldCheck, CheckCircle2, ExternalLink, X, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  item: ListingItem | null;
  policy: TransferPolicy;
  isOpen: boolean;
  onClose: () => void;
  onSuccessPurchase: (item: ListingItem) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  item,
  policy,
  isOpen,
  onClose,
  onSuccessPurchase,
}) => {
  const { isConnected, address, shortAddress, connectWallet, refreshBalance } = useWallet();
  const [step, setStep] = useState<'review' | 'signing' | 'settled'>('review');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const royaltyPct = (item.royaltyBps || policy.royaltyBps) / 10000;
  const upstreamPct = policy.upstreamSplits.reduce((acc, s) => acc + s.bps, 0) / 10000;
  const sellerPct = Math.max(0, 1 - royaltyPct - upstreamPct);

  const royaltyAmount = item.price * royaltyPct;
  const upstreamAmount = item.price * upstreamPct;
  const sellerAmount = item.price - royaltyAmount - upstreamAmount;

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    setStep('signing');
    setErrorMessage(null);

    try {
      const result = await executePurchase({
        buyerAddress: address,
        itemId: item.id,
      });

      setTxHash(result.txHash);
      setStep('settled');
      await refreshBalance();
      onSuccessPurchase(item);
    } catch (err: any) {
      console.error('Purchase failed:', err);
      setErrorMessage(err?.message || 'Transaction rejected or failed on Soroban testnet.');
      setStep('review');
    }
  };

  const handleResetAndClose = () => {
    setStep('review');
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in">
      <div className="relative w-full max-w-lg double-bezel-outer">
        <div className="double-bezel-inner p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Live Soroban Settlement</h3>
                <div className="text-[10px] font-mono text-zinc-400">On-Chain Single Ledger Tx</div>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              {/* Item Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0c0c14] border border-white/5">
                <img
                  src={item.image || '/images/axon_vault.jpg'}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{item.description}</p>
                  <div className="text-[11px] font-mono text-purple-300 mt-1">
                    Seller: {shortAddress(item.seller)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-white">{item.price} XLM</div>
                  <div className="text-[10px] font-mono text-zinc-500">Atomic Total</div>
                </div>
              </div>

              {/* Fee Decomposition */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono mb-2">
                  <span>Atomic Payment Routing</span>
                  <span className="text-[10px] text-purple-400 font-normal">
                    Token: {item.paymentToken ? shortAddress(item.paymentToken) : 'XLM (SAC)'}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Net Seller Payout ({(sellerPct * 100).toFixed(1)}%)</span>
                  <span className="text-white font-mono">{sellerAmount.toFixed(2)} XLM</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Creator Royalty ({(royaltyPct * 100).toFixed(1)}%)</span>
                  <span className="text-purple-300 font-mono">{royaltyAmount.toFixed(2)} XLM</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Upstream Protocol Split ({(upstreamPct * 100).toFixed(1)}%)</span>
                  <span className="text-fuchsia-300 font-mono">{upstreamAmount.toFixed(2)} XLM</span>
                </div>

                {item.assetContract && (
                  <div className="pt-2 border-t border-white/5 flex justify-between text-[11px] font-mono text-zinc-400">
                    <span>Escrowed Asset Delivery</span>
                    <span className="text-emerald-400 truncate max-w-[200px]">
                      {item.assetAmount || 1} unit(s) of {shortAddress(item.assetContract)}
                    </span>
                  </div>
                )}
              </div>

              {/* Invariant guarantee banner */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Non-Custodial Escrow: Atomic delivery directly to your wallet upon settlement.</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePurchase}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xs uppercase tracking-wider hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-95"
              >
                {isConnected ? 'Sign & Execute Atomic Purchase On-Chain' : 'Connect Wallet to Settle'}
              </button>
            </div>
          )}

          {step === 'signing' && (
            <div className="py-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin" />
                <div className="absolute inset-2 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-300">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white">Executing On-Chain via Soroban RPC...</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Building transaction envelope, verifying signatures, and broadcasting to Stellar Testnet RPC.
              </p>
            </div>
          )}

          {step === 'settled' && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white mb-1">On-Chain Settlement Confirmed!</h4>
                <p className="text-xs text-zinc-400">
                  Transaction successfully validated and closed into the Stellar Testnet ledger.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0c14] border border-white/10 text-left font-mono text-[11px] space-y-2">
                <div className="text-zinc-500 uppercase text-[9px]">Verified On-Chain Transaction Hash</div>
                <div className="text-purple-300 truncate">{txHash}</div>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-[11px] mt-1"
                >
                  <span>View Transaction on StellarExpert</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors"
              >
                Close & Return to Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
