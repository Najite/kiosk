import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, Check, ExternalLink, X, Shield, Coins, Sparkles, RefreshCw } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose }) => {
  const {
    isConnected,
    address,
    shortAddress,
    balance,
    connectWallet,
    connectDemoWallet,
    disconnectWallet,
    fundFriendbot,
    isConnecting,
    isFreighterAvailable,
  } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in">
      <div className="relative w-full max-w-md double-bezel-outer">
        <div className="double-bezel-inner p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">Stellar Wallet Session</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isConnected ? (
            <div className="space-y-6">
              {/* Connected Card */}
              <div className="p-4 rounded-2xl bg-[#0c0c14] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500">ACTIVE ACCOUNT</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Connected
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-white truncate">{address}</div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-zinc-400">Balance</span>
                  <span className="text-base font-bold font-mono text-purple-300">
                    {balance.toLocaleString()} XLM
                  </span>
                </div>
              </div>

              {/* Friendbot Faucet */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Coins className="w-4 h-4 text-purple-400" />
                  <span>Stellar Testnet Friendbot</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Fund this account with test XLM tokens directly from the Stellar testnet faucet.
                </p>
                <button
                  onClick={fundFriendbot}
                  className="w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-semibold hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Request +1,000 Testnet XLM</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://stellar.expert/explorer/testnet/account/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={disconnectWallet}
                  className="flex-1 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full p-4 rounded-2xl bg-[#0e0e18] hover:bg-[#141424] border border-white/10 hover:border-purple-500/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Freighter Wallet</div>
                    <div className="text-[11px] text-zinc-400">
                      {isFreighterAvailable ? 'Browser extension ready' : 'Connect or install extension'}
                    </div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </button>

              <button
                onClick={() => {
                  connectDemoWallet();
                  onClose();
                }}
                className="w-full p-4 rounded-2xl bg-[#0e0e18] hover:bg-[#141424] border border-white/10 hover:border-purple-500/40 text-left flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Ephemeral Testnet Wallet</div>
                    <div className="text-[11px] text-zinc-400">Browser-generated burner keypair (Friendbot funded)</div>
                  </div>
                </div>
                <div className="text-xs font-mono text-purple-400">Testnet</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
