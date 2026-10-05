import { useState, useRef, useEffect } from 'react';
import {
  Boxes,
  Shield,
  Code2,
  Store,
  FileText,
  Wallet,
  Power,
  ChevronDown,
  Zap,
  ExternalLink,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { shortAddress, STELLAR_CONFIG } from '@/lib/stellar';
import { ConnectModal } from '@/components/ConnectModal';

export type ViewId = 'kiosk' | 'policy' | 'widget' | 'marketplace' | 'grant';

const VIEWS: { id: ViewId; label: string; icon: typeof Boxes }[] = [
  { id: 'kiosk', label: 'Kiosk Manager', icon: Boxes },
  { id: 'policy', label: 'Escrow Policies', icon: Shield },
  { id: 'widget', label: 'Embed Widget', icon: Code2 },
  { id: 'marketplace', label: 'Live Marketplace', icon: Store },
  { id: 'grant', label: 'SCF Grant Proposal', icon: FileText },
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
    connectSimulated,
    disconnect,
    network,
    setNetwork,
    shortAddr,
    isSimulated,
    xlmBalance,
    accountExists,
    refreshAccount,
    fundAccount,
  } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);
  const [netOpen, setNetOpen] = useState(false);
  const [networkToast, setNetworkToast] = useState<string | null>(null);

  const handleNetworkSelect = async (n: 'TESTNET' | 'MAINNET') => {
    setNetOpen(false);
    if (n === network) return;
    setNetworkToast(`Switching to Stellar ${n}...`);
    await setNetwork(n);
    setTimeout(() => {
      setNetworkToast(`Connected to Stellar ${n}`);
      setTimeout(() => setNetworkToast(null), 2500);
    }, 400);
  };
  const [funding, setFunding] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);

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
      if (netRef.current && !netRef.current.contains(e.target as Node)) {
        setNetOpen(false);
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
          {/* Network toggle */}
          <div className="relative" ref={netRef}>
            <button
              onClick={() => setNetOpen(!netOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${network === 'TESTNET' ? 'bg-amber' : 'bg-emerald'} animate-pulse`} />
              <span className="text-gray-300 font-medium">{network}</span>
              <ChevronDown className="h-3 w-3 text-gray-500" />
            </button>
            {netOpen && (
              <div className="absolute right-0 mt-1.5 w-44 panel p-1 animate-slide-up z-50 shadow-2xl">
                {(['TESTNET', 'MAINNET'] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNetworkSelect(n);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs transition-colors ${
                      network === n ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${n === 'TESTNET' ? 'bg-amber' : 'bg-emerald'}`} />
                      <span>{n}</span>
                    </div>
                    {network === n && <span className="text-[10px] text-cyan font-mono">Active</span>}
                  </button>
                ))}
              </div>
            )}
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
                    isSimulated 
                      ? 'bg-amber/10 text-amber border border-amber/20' 
                      : 'bg-emerald/10 text-emerald border border-emerald/20'
                  }`}>
                    {isSimulated ? 'Simulated' : 'Freighter'}
                  </span>
                </div>
                <p className="mono text-xs text-cyan break-all leading-relaxed bg-black/40 p-2 rounded border border-white/5">{address}</p>
                
                {/* Live Balance & Network Info */}
                <div className="mt-2.5 p-2 rounded bg-white/3 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Balance:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-semibold text-white">
                      {isSimulated ? '100.00 XLM' : xlmBalance !== null ? `${Number(xlmBalance).toLocaleString()} XLM` : 'Loading...'}
                    </span>
                    {!isSimulated && (
                      <button 
                        onClick={refreshAccount} 
                        title="Refresh balance" 
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fund on Testnet button if unfunded */}
                {!isSimulated && network === 'TESTNET' && !accountExists && (
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
                {!isSimulated && address && (
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
                    {isSimulated ? 'Demo session' : 'Live Freighter wallet'}
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

      {/* Network Switch Toast Notification */}
      {networkToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-obsidian-light border border-cyan/30 shadow-2xl text-xs text-white">
          <span className={`h-2 w-2 rounded-full ${network === 'TESTNET' ? 'bg-amber' : 'bg-emerald'} animate-pulse`} />
          <span className="font-medium">{networkToast}</span>
        </div>
      )}

      {/* Wallet Connection Modal */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onContinueSimulated={() => {
          connectSimulated();
          setShowConnectModal(false);
        }}
      />
    </header>
  );
}
