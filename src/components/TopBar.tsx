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
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { shortAddress } from '@/lib/stellar';

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
  const { address, isConnected, connect, disconnect, network, setNetwork, shortAddr } = useWallet();
  const [walletOpen, setWalletOpen] = useState(false);
  const [netOpen, setNetOpen] = useState(false);
  const walletRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setWalletOpen(false);
      if (netRef.current && !netRef.current.contains(e.target as Node)) setNetOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
              <div className="absolute right-0 mt-1.5 w-40 panel p-1 animate-slide-up z-50">
                {(['TESTNET', 'MAINNET'] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setNetwork(n);
                      setNetOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      network === n ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${n === 'TESTNET' ? 'bg-amber' : 'bg-emerald'}`} />
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wallet */}
          <div className="relative" ref={walletRef}>
            {isConnected ? (
              <button
                onClick={() => setWalletOpen(!walletOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20 text-xs hover:bg-cyan/15 transition-colors"
              >
                <Wallet className="h-3.5 w-3.5 text-cyan" />
                <span className="mono text-gray-200">{shortAddr}</span>
                <ChevronDown className="h-3 w-3 text-cyan/60" />
              </button>
            ) : (
              <button
                onClick={connect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan text-obsidian text-xs font-semibold hover:bg-cyan-dim transition-colors"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect Wallet
              </button>
            )}
            {walletOpen && isConnected && (
              <div className="absolute right-0 mt-1.5 w-64 panel p-3 animate-slide-up z-50">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Connected Address</p>
                <p className="mono text-xs text-cyan break-all leading-relaxed">{address}</p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Simulated Freighter session</span>
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
    </header>
  );
}
