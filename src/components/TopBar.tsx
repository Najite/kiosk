import { useState, useRef, useEffect } from 'react';
import {
  Boxes,
  Shield,
  Code2,
  Store,
  Wallet,
  Power,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Coins,
  Zap,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { STELLAR_CONFIG } from '@/lib/stellar';
import { ConnectModal } from '@/components/ConnectModal';

export type ViewId = 'kiosk' | 'policy' | 'widget' | 'marketplace';

const VIEWS: { id: ViewId; label: string; icon: typeof Boxes }[] = [
  { id: 'kiosk', label: 'Kiosk Manager', icon: Boxes },
  { id: 'policy', label: 'Escrow Policies', icon: Shield },
  { id: 'widget', label: 'Embed Widget', icon: Code2 },
  { id: 'marketplace', label: 'Live Marketplace', icon: Store },
];

export function TopBar({
  activeView,
  onViewChange,
  onExit,
}: {
  activeView: ViewId;
  onViewChange: (v: ViewId) => void;
  onExit: () => void;
}) {
  const {
    address,
    isConnected,
    connect,
    disconnect,
    network,
    freighterNetwork,
    shortAddr,
    xlmBalance,
    accountExists,
    refreshAccount,
    fundAccount,
  } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);
  const isMainnetMismatch =
    Boolean(isConnected &&
    freighterNetwork &&
    (freighterNetwork.includes('PUBLIC') || freighterNetwork.includes('MAIN')));
  const [funding, setFunding] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);

  const handleConnectClick = async () => {
    const success = await connect();
    if (!success) {
      setShowConnectModal(true);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setWalletOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-obsidian/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Zone 1: Brand */}
        <button onClick={onExit} className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-emerald/10 border border-cyan/20 group-hover:scale-105 transition-transform">
            <Zap className="h-4 w-4 text-cyan" fill="currentColor" />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">
            Stellar<span className="text-gradient-cyan">Kiosk</span>
          </span>
        </button>

        {/* Zone 2: View Switcher */}
        <nav className="hidden md:flex items-center gap-0.5 bg-white/3 rounded-lg p-0.5 border border-white/8">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const active = activeView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onViewChange(v.id)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  active
                    ? 'bg-white/8 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-cyan' : ''}`} />
                {v.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Network + Wallet */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Warning badge if Freighter extension is on Mainnet */}
          {isMainnetMismatch && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium animate-pulse" title="Freighter is on Mainnet. Please switch Freighter to Testnet.">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span>Switch Freighter to Testnet</span>
            </div>
          )}

          {/* Dedicated Testnet Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber/10 border border-amber/20 text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            <span className="text-amber font-semibold">TESTNET</span>
          </div>

          {/* Wallet */}
          <div className="relative" ref={walletRef}>
            {isConnected ? (
              <button
                data-testid="wallet-address-pill"
                onClick={() => setWalletOpen(!walletOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20 text-xs hover:bg-cyan/15 transition-colors"
              >
                <Wallet className="h-3.5 w-3.5 text-cyan" />
                <span className="mono text-gray-200">{shortAddr}</span>
                <ChevronDown className="h-3 w-3 text-cyan/60" />
              </button>
            ) : (
              <button
                onClick={handleConnectClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan text-obsidian text-xs font-semibold hover:bg-cyan-dim transition-colors"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect Wallet
              </button>
            )}
            {walletOpen && isConnected && (
              <div className="absolute right-0 mt-1.5 w-72 panel p-3 animate-slide-up z-50">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Connected Address</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isMainnetMismatch 
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald/10 text-emerald border border-emerald/20'
                  }`}>
                    {freighterNetwork || 'Freighter'}
                  </span>
                </div>
                <p className="mono text-xs text-cyan break-all leading-relaxed bg-black/40 p-2 rounded border border-white/5">{address}</p>

                {/* Network mismatch warning */}
                {isMainnetMismatch && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
                    <p className="font-semibold text-[11px] text-rose-300">Freighter is on Main Net</p>
                    <p className="text-[10px] text-rose-200/80 mt-0.5">
                      Open your Freighter browser extension and switch the top network selector to <strong>Test Net</strong>.
                    </p>
                  </div>
                )}
                
                {/* Live Balance & Network Info */}
                <div className="mt-2.5 p-2 rounded bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Balance:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-semibold text-white">
                      {xlmBalance !== null ? `${Number(xlmBalance).toLocaleString()} XLM` : 'Loading...'}
                    </span>
                    <button 
                      onClick={refreshAccount} 
                      title="Refresh balance" 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Fund on Testnet button if unfunded */}
                {network === 'TESTNET' && !accountExists && (
                  <button
                    onClick={async () => {
                      setFunding(true);
                      await fundAccount();
                      setFunding(false);
                    }}
                    disabled={funding}
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber/10 border border-amber/20 text-amber text-xs font-semibold hover:bg-amber/20 transition-all disabled:opacity-50"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>{funding ? 'Funding via Friendbot...' : 'Fund with 10,000 Testnet XLM'}</span>
                  </button>
                )}

                {/* View on Stellar Expert */}
                {address && (
                  <a
                    href={`${STELLAR_CONFIG[network].explorerAccountUrl}${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-cyan transition-colors"
                  >
                    <span>View on Stellar Expert ({network})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Live Freighter wallet
                  </span>
                  <button
                    onClick={() => {
                      disconnect();
                      setWalletOpen(false);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-rose hover:text-rose-dim transition-colors"
                  >
                    <Power className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile view switcher */}
      <nav className="md:hidden flex items-center gap-0.5 px-3 pb-2 overflow-x-auto">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const active = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-all ${
                active ? 'bg-white/8 text-white' : 'text-gray-500'
              }`}
            >
              <Icon className={`h-3 w-3 ${active ? 'text-cyan' : ''}`} />
              {v.label}
            </button>
          );
        })}
      </nav>

      {/* Wallet Connection Modal */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onRetry={handleConnectClick}
      />
    </header>
  );
}
