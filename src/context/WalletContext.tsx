import { createContext, useContext, useState, type ReactNode } from 'react';
import { generateStellarAddress, shortAddress } from '@/lib/stellar';

type Network = 'TESTNET' | 'MAINNET';

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  network: Network;
  connect: () => void;
  disconnect: () => void;
  setNetwork: (n: Network) => void;
  shortAddr: string;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>('TESTNET');

  const connect = () => {
    setAddress(generateStellarAddress());
  };

  const disconnect = () => {
    setAddress(null);
  };

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    network,
    connect,
    disconnect,
    setNetwork,
    shortAddr: address ? shortAddress(address, 4) : '',
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
