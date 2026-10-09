import React, { useState, useEffect } from 'react';
import { ExternalLink, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { STELLAR_CONFIG, TESTNET_CONTRACT_ID, formatAddress } from '../lib/stellar';

export const TelemetryBar: React.FC = () => {
  const [latency, setLatency] = useState<number | null>(null);
  const [latestLedger, setLatestLedger] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const ping = async () => {
      try {
        const start = performance.now();
        const res = await fetch(STELLAR_CONFIG.TESTNET.sorobanRpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getHealth' }),
        });
        const duration = Math.round(performance.now() - start);
        if (res.ok && active) {
          const data = await res.json();
          setLatency(duration);
          if (data.result?.latestLedger) {
            setLatestLedger(data.result.latestLedger);
          }
        }
      } catch {
        if (active) {
          setLatency(null);
        }
      }
    };

    ping();
    const interval = setInterval(ping, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="border-t border-b border-white/5 bg-[#050508]/80 backdrop-blur-md py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-500">SOROBAN RPC:</span>
            <span className="text-zinc-300">Testnet Protocol 21</span>
          </div>

          {latestLedger && (
            <div className="hidden lg:flex items-center gap-2 text-zinc-300">
              <span className="text-zinc-500">LEDGER:</span>
              <span className="text-purple-300">#{latestLedger.toLocaleString()}</span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-zinc-500">CONTRACT:</span>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 flex items-center gap-1"
            >
              <span>{formatAddress(TESTNET_CONTRACT_ID)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-2 text-zinc-300">
            <Database className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-500">SETTLEMENT TOKEN:</span>
            <span className="text-zinc-400">Native XLM SAC</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-zinc-500">
          <span>LATENCY: {latency !== null ? `${latency}ms` : 'Connecting...'}</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SYNCED</span>
          </span>
        </div>
      </div>
    </div>
  );
};
