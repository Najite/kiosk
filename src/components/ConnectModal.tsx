import { ExternalLink, Sparkles, X, ShieldAlert } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export function ConnectModal({ isOpen, onClose, onRetry }: ConnectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md panel border border-white/10 p-6 rounded-2xl shadow-2xl bg-[#0D1117] text-white animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-4 text-cyan">
          <ShieldAlert className="w-6 h-6" />
        </div>

        {/* Title & Desc */}
        <h3 className="text-lg font-bold text-white tracking-tight">Freighter Wallet Required</h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          StellarKiosk runs directly on <span className="text-white font-medium">Stellar Testnet</span> with live Soroban smart contracts. Connect with the <span className="text-white font-medium">Freighter Wallet</span> browser extension to sign transactions and manage escrow kiosks.
        </p>

        {/* Options */}
        <div className="mt-6 space-y-2.5">
          <a
            href="https://www.freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-cyan text-obsidian font-semibold text-xs hover:bg-cyan-dim transition-all shadow-lg shadow-cyan/20 group"
          >
            <span>Install Freighter Extension</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {onRetry && (
            <button
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-200 transition-all hover:border-cyan/30"
            >
              Retry Connection
            </button>
          )}
        </div>

        <p className="text-[11px] text-gray-500 mt-4 text-center">
          Make sure your Freighter wallet is set to Stellar Testnet.
        </p>
      </div>
    </div>
  );
}
