import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  setAllowed as freighterSetAllowed,
  requestAccess as freighterRequestAccess,
  getAddress as freighterGetAddress,
  getNetworkDetails as freighterGetNetworkDetails,
  WatchWalletChanges,
} from '@stellar/freighter-api';
import {
  shortAddress,
  generateStellarAddress,
  fetchLiveAccount,
  STELLAR_CONFIG,
  type StellarNetwork,
} from '@/lib/stellar';

export type Network = StellarNetwork;

export type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  network: Network;
  isFreighterInstalled: boolean;
  isSimulated: boolean;
  xlmBalance: string | null;
  accountExists: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  connectSimulated: () => void;
  disconnect: () => void;
  setNetwork: (n: Network) => Promise<void>;
  shortAddr: string;
  refreshAccount: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetworkState] = useState<Network>('TESTNET');
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to query live account status from Horizon RPC
  const refreshAccount = useCallback(async () => {
    if (!address) {
      setXlmBalance(null);
      setAccountExists(false);
      return;
    }
    const info = await fetchLiveAccount(address, network);
    setAccountExists(info.exists);
    setXlmBalance(info.xlmBalance);
  }, [address, network]);

  useEffect(() => {
    refreshAccount();
  }, [refreshAccount]);

  // Synchronize network with Freighter
  const syncNetworkFromFreighter = useCallback(async () => {
    try {
      const details = await freighterGetNetworkDetails();
      if (details && !details.error && details.networkPassphrase) {
        if (details.networkPassphrase === STELLAR_CONFIG.MAINNET.passphrase) {
          setNetworkState('MAINNET');
        } else {
          setNetworkState('TESTNET');
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Listen to live wallet changes (accounts and networks) in Freighter
  useEffect(() => {
    let watcher: WatchWalletChanges | null = null;
    let isMounted = true;

    const setupFreighterWatcher = async () => {
      try {
        const res = await freighterIsConnected();
        if (isMounted) setIsFreighterInstalled(!!res?.isConnected);

        if (res?.isConnected) {
          watcher = new WatchWalletChanges(1000);
          watcher.watch((params) => {
            if (!isMounted) return;
            if (params.address) {
              setAddress(params.address);
              setIsSimulated(false);
            }
            if (params.networkPassphrase) {
              if (params.networkPassphrase === STELLAR_CONFIG.MAINNET.passphrase) {
                setNetworkState('MAINNET');
              } else {
                setNetworkState('TESTNET');
              }
            }
          });
        }
      } catch {
        if (isMounted) setIsFreighterInstalled(false);
      }
    };

    setupFreighterWatcher();

    return () => {
      isMounted = false;
      if (watcher) watcher.stop();
    };
  }, []);

  // Connect handler
  const connect = async (): Promise<boolean> => {
    setError(null);
    try {
      const conn = await freighterIsConnected();
      if (!conn?.isConnected) {
        setIsFreighterInstalled(false);
        return false;
      }
      setIsFreighterInstalled(true);

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
        await syncNetworkFromFreighter();
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
    setXlmBalance(null);
    setAccountExists(false);
  };

  const setNetwork = async (n: Network) => {
    setNetworkState(n);
  };

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    network,
    isFreighterInstalled,
    isSimulated,
    xlmBalance,
    accountExists,
    error,
    connect,
    connectSimulated,
    disconnect,
    setNetwork,
    shortAddr: address ? shortAddress(address, 4) : '',
    refreshAccount,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
