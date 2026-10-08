import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Shield, Sparkles, Wallet, ExternalLink, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConnectModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenConnectModal,
}) => {
  const { isConnected, shortAddress, balance } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Protocol' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'vault', label: 'Kiosk Vault' },
    { id: 'policy', label: 'Policy Engine' },
    { id: 'embed', label: 'Widget Embed' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Floating Glass Island Bar */}
        <div className="w-full flex items-center justify-between px-4 sm:px-6 py-3 rounded-full bg-[#08080c]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto">
          {/* Logo / Brand */}
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 text-left group transition-all"
          >
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-purple-900 to-violet-600 flex items-center justify-center border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform duration-300">
              {/* Axon-inspired 4-petal SVG */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C9.5 2 7.5 4.5 8 8C4.5 7.5 2 9.5 2 12C2 14.5 4.5 16.5 8 16C7.5 19.5 9.5 22 12 22C14.5 22 16.5 19.5 16 16C19.5 16.5 22 14.5 22 12C22 9.5 19.5 7.5 16 8C16.5 4.5 14.5 2 12 2ZM12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-white text-base">STELLAR<span className="text-violet-400">KIOSK</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">v21</span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#101018]/60 p-1 rounded-full border border-white/5">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Network Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12121e] border border-white/5 text-[11px] text-zinc-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Testnet</span>
            </div>

            {/* Wallet Button */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right pr-1">
                  <span className="text-[10px] text-zinc-400 font-mono leading-none">Balance</span>
                  <span className="text-xs text-purple-300 font-semibold font-mono">{balance.toLocaleString()} XLM</span>
                </div>
                <button
                  onClick={onOpenConnectModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#171726] to-[#201d33] border border-purple-500/30 text-white text-xs font-mono hover:border-purple-500/60 transition-all shadow-[0_0_20px_rgba(168,85,247,0.15)] group"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span>{shortAddress()}</span>
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenConnectModal}
                className="group flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95"
              >
                <span>Connect Wallet</span>
                <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#050508]/95 backdrop-blur-2xl flex flex-col p-6 pointer-events-auto sm:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-lg">STELLARKIOSK</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col gap-3 py-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-3 rounded-2xl text-base font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConnectModal();
              }}
              className="w-full py-3 rounded-full bg-white text-black font-semibold text-center"
            >
              {isConnected ? shortAddress() : 'Connect Freighter Wallet'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
