import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  setAllowed as freighterSetAllowed,
  requestAccess as freighterRequestAccess,
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
} from '@stellar/freighter-api';
import { shortAddress, generateStellarAddress } from '@/lib/stellar';

export type Network = 'TESTNET' | 'MAINNET';

export type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  network: Network;
  isFreighterInstalled: boolean;
  isSimulated: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  connectSimulated: () => void;
  disconnect: () => void;
  setNetwork: (n: Network) => void;
  shortAddr: string;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>('TESTNET');
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Detect Freighter extension availability
  useEffect(() => {
    let isMounted = true;
    const checkFreighter = async () => {
      try {
        const res = await freighterIsConnected();
        if (isMounted) {
          setIsFreighterInstalled(!!res?.isConnected);
        }
      } catch {
        if (isMounted) setIsFreighterInstalled(false);
      }
    };
    checkFreighter();
    return () => {
      isMounted = false;
    };
  }, []);

  const connect = async (): Promise<boolean> => {
    setError(null);
    try {
      const conn = await freighterIsConnected();
      if (!conn?.isConnected) {
        setIsFreighterInstalled(false);
        return false;
      }
      setIsFreighterInstalled(true);

      // Request user authorization in Freighter
      const accessObj = await freighterRequestAccess();
      let userAddress = accessObj?.address;

      if (!userAddress) {
        const allowed = await freighterIsAllowed();
        if (!allowed?.isAllowed) {
          await freighterSetAllowed();
        }
        const addrObj = await freighterGetAddress();
        userAddress = addrObj?.address;
      }

      if (userAddress) {
        setAddress(userAddress);
        setIsSimulated(false);
        // Sync network if available
        try {
          const net = await freighterGetNetwork();
          if (net?.network?.toUpperCase().includes('PUBLIC')) {
            setNetwork('MAINNET');
          } else {
            setNetwork('TESTNET');
          }
        } catch {
          // Keep current network
        }
        return true;
      } else {
        throw new Error('Could not retrieve address from Freighter.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Wallet connection error';
      setError(msg);
      return false;
    }
  };

  const connectSimulated = () => {
    setAddress(generateStellarAddress());
    setIsSimulated(true);
    setError(null);
  };

  const disconnect = () => {
    setAddress(null);
    setIsSimulated(false);
    setError(null);
  };

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    network,
    isFreighterInstalled,
    isSimulated,
    error,
    connect,
    connectSimulated,
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
