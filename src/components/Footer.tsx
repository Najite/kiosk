import React from 'react';
import { Shield, ExternalLink, Github, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#050508] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-900 to-violet-600 flex items-center justify-center text-white border border-purple-400/30">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.5 2 7.5 4.5 8 8C4.5 7.5 2 9.5 2 12C2 14.5 4.5 16.5 8 16C7.5 19.5 9.5 22 12 22C14.5 22 16.5 19.5 16 16C19.5 16.5 22 14.5 22 12C22 9.5 19.5 7.5 16 8C16.5 4.5 14.5 2 12 2ZM12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z" />
                </svg>
              </div>
              <span className="font-extrabold tracking-tight text-white text-lg">
                STELLAR<span className="text-violet-400">KIOSK</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Autonomous non-custodial digital asset kiosk standard and transfer policy engine on Stellar & Soroban. Zero centralized dependencies.
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-4">Protocol</h4>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <a
                    href="https://stellar.expert/explorer/testnet/contract/CB3AQGQ6MXJVJ26ICU5CDIGSVUKS2LNCEBMZEVM2GO6RARSJ367CLQQB"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>Contract Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300">
                    Soroban Docs
                  </a>
                </li>
                <li>
                  <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300">
                    Stellar Network
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-4">Developers</h4>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <a href="https://github.com/Najite/kiosk" target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 flex items-center gap-1">
                    <Github className="w-3 h-3" />
                    <span>GitHub Repository</span>
                  </a>
                </li>
                <li>
                  <span className="text-zinc-500">soroban-sdk v21.7.7</span>
                </li>
                <li>
                  <span className="text-zinc-500">Atomic Settlement</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-4">Network</h4>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Testnet Online</span>
                </li>
                <li>
                  <span className="text-zinc-500">RPC: soroban-testnet</span>
                </li>
                <li>
                  <span className="text-zinc-500">Horizon: horizon-testnet</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div>© 2026 StellarKiosk Protocol. MIT Open Source.</div>
          <div className="text-purple-400">Inspired by Axon Design Architecture</div>
        </div>
      </div>
    </footer>
  );
};
