import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  setAllowed as freighterSetAllowed,
  requestAccess as freighterRequestAccess,
  getAddress as freighterGetAddress,
  getNetworkDetails as freighterGetNetworkDetails,
  signTransaction as freighterSignTransaction,
  WatchWalletChanges,
} from '@stellar/freighter-api';
import {
  shortAddress,
  fetchLiveAccount,
  fundTestnetAccount,
  STELLAR_CONFIG,
  type StellarNetwork,
} from '@/lib/stellar';

export type Network = StellarNetwork;

export type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  network: Network;
  freighterNetwork: string | null;
  isFreighterInstalled: boolean;
  xlmBalance: string | null;
  accountExists: boolean;
  error: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  setNetwork: (n: Network) => Promise<void>;
  shortAddr: string;
  refreshAccount: () => Promise<void>;
  fundAccount: () => Promise<boolean>;
  signTx: (xdrBase64: string) => Promise<string | null>;
};

const WalletContext = createContext<WalletContextType | null>(null);

const DISCONNECTED_KEY = 'stellarkiosk_wallet_disconnected';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetworkState] = useState<Network>('TESTNET');
  const [freighterNetwork, setFreighterNetwork] = useState<string | null>(null);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean>(false);
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sequence tracker to prevent race conditions during rapid network switching
  const querySeqRef = useRef<number>(0);

  // Query Freighter's active network setting
  const checkFreighterNetwork = useCallback(async () => {
    try {
      const net = await freighterGetNetworkDetails();
      if (net && !net.error && net.network) {
        setFreighterNetwork(net.network.toUpperCase());
      }
    } catch {
      // Ignore network query error
    }
  }, []);

  // Helper to query live account status from Horizon RPC
  const refreshAccount = useCallback(async () => {
    if (!address) {
      setXlmBalance(null);
      setAccountExists(false);
      return;
    }
    const currentSeq = ++querySeqRef.current;
    const info = await fetchLiveAccount(address, network);
    if (currentSeq === querySeqRef.current) {
      setAccountExists(info.exists);
      setXlmBalance(info.xlmBalance);
    }
    await checkFreighterNetwork();
  }, [address, network, checkFreighterNetwork]);

  useEffect(() => {
    refreshAccount();
  }, [refreshAccount]);

  // Keep network locked to TESTNET for the dedicated Testnet implementation
  const syncNetworkFromFreighter = useCallback(async () => {
    setNetworkState('TESTNET');
    await checkFreighterNetwork();
  }, [checkFreighterNetwork]);

  // Listen to live wallet changes (accounts and networks) in Freighter
  useEffect(() => {
    let watcher: WatchWalletChanges | null = null;
    let isMounted = true;

    const setupFreighterWatcher = async () => {
      try {
        const res = await freighterIsConnected();
        if (isMounted) setIsFreighterInstalled(!!res?.isConnected);

        if (res?.isConnected) {
          await checkFreighterNetwork();
          watcher = new WatchWalletChanges(1500);
          watcher.watch((params) => {
            if (!isMounted) return;
            // If the user explicitly disconnected, ignore background watcher updates
            const isExplicitlyDisconnected = localStorage.getItem(DISCONNECTED_KEY) === 'true';
            if (isExplicitlyDisconnected) {
              return;
            }
            if (params.address) {
              setAddress(params.address);
            }
            checkFreighterNetwork();
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
  }, [checkFreighterNetwork]);

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
        // Clear disconnected flag since user explicitly connected
        localStorage.removeItem(DISCONNECTED_KEY);
        setAddress(userAddress);
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

  const disconnect = () => {
    // Persist disconnected intent across reloads
    localStorage.setItem(DISCONNECTED_KEY, 'true');
    setAddress(null);
    setError(null);
    setXlmBalance(null);
    setAccountExists(false);
  };

  const setNetwork = async (n: Network) => {
    setNetworkState(n);
    if (address) {
      const currentSeq = ++querySeqRef.current;
      const info = await fetchLiveAccount(address, n);
      if (currentSeq === querySeqRef.current) {
        setAccountExists(info.exists);
        setXlmBalance(info.xlmBalance);
      }
    }
  };

  const fundAccount = async (): Promise<boolean> => {
    if (!address) return false;
    const ok = await fundTestnetAccount(address);
    if (ok) {
      await refreshAccount();
    }
    return ok;
  };

  const signTx = async (xdrBase64: string): Promise<string | null> => {
    try {
      if (!isFreighterInstalled) {
        throw new Error('Freighter wallet extension is not installed');
      }

      // Check current Freighter network to give helpful feedback before signing
      try {
        const netDetails = await freighterGetNetworkDetails();
        if (netDetails?.network) {
          const currentFreighterNet = netDetails.network.toUpperCase();
          setFreighterNetwork(currentFreighterNet);
          if (currentFreighterNet.includes('PUBLIC') || currentFreighterNet.includes('MAIN')) {
            throw new Error(
              'Your Freighter extension is set to PUBLIC / MAINNET. Please open your Freighter extension, click the network dropdown in the top-right, and switch to "Test Net" to sign this transaction.'
            );
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('Freighter extension is set to PUBLIC')) {
          throw err;
        }
      }

      const signed = await freighterSignTransaction(xdrBase64, {
        networkPassphrase: STELLAR_CONFIG[network].passphrase,
      });
      if (typeof signed === 'string') {
        return signed;
      }
      if (signed && typeof signed === 'object' && 'signedTxXdr' in signed && typeof (signed as { signedTxXdr?: unknown }).signedTxXdr === 'string') {
        return (signed as { signedTxXdr: string }).signedTxXdr;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Freighter signing failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    network,
    freighterNetwork,
    isFreighterInstalled,
    xlmBalance,
    accountExists,
    error,
    connect,
    disconnect,
    setNetwork,
    shortAddr: address ? shortAddress(address, 4) : '',
    refreshAccount,
    fundAccount,
    signTx,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
