import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isConnected as checkFreighter, requestAccess, getAddress } from '@stellar/freighter-api';
import {
  fetchLiveAccount,
  fundTestnetAccount,
  shortAddress,
  getOrCreateEphemeralKeypair,
  clearEphemeralKeypair,
} from '../lib/stellar';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  network: string;
  balance: number;
  isFreighterAvailable: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  connectDemoWallet: () => Promise<void>;
  disconnectWallet: () => void;
  fundFriendbot: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  shortAddress: (addr?: string | null) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => {
    return localStorage.getItem('kiosk_wallet_address') || null;
  });
  const [balance, setBalance] = useState<number>(0);
  const [isFreighterAvailable, setIsFreighterAvailable] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const network = 'Stellar Testnet';

  const refreshBalance = useCallback(async () => {
    if (!address) {
      setBalance(0);
      return;
    }
    try {
      const acc = await fetchLiveAccount(address, 'TESTNET');
      if (acc.exists) {
        setBalance(parseFloat(acc.xlmBalance));
      } else {
        setBalance(0);
      }
    } catch {
      // Ignore
    }
  }, [address]);

  useEffect(() => {
    const init = async () => {
      try {
        const hasFreighter = await checkFreighter();
        setIsFreighterAvailable(Boolean(hasFreighter));
      } catch {
        setIsFreighterAvailable(false);
      }
      await refreshBalance();
    };
    init();
  }, [refreshBalance]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const accessObj = await requestAccess();
      if (accessObj && accessObj.address) {
        setAddress(accessObj.address);
        localStorage.setItem('kiosk_wallet_address', accessObj.address);
        await refreshBalance();
      } else {
        const addrObj = await getAddress();
        if (addrObj && addrObj.address) {
          setAddress(addrObj.address);
          localStorage.setItem('kiosk_wallet_address', addrObj.address);
          await refreshBalance();
        } else {
          await connectDemoWallet();
        }
      }
    } catch {
      await connectDemoWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  const connectDemoWallet = async () => {
    const kp = getOrCreateEphemeralKeypair();
    const demoAddr = kp.publicKey();
    setAddress(demoAddr);
    localStorage.setItem('kiosk_wallet_address', demoAddr);
    const acc = await fetchLiveAccount(demoAddr, 'TESTNET');
    if (!acc.exists) {
      await fundTestnetAccount(demoAddr);
    }
    await refreshBalance();
  };

  const disconnectWallet = () => {
    setAddress(null);
    localStorage.removeItem('kiosk_wallet_address');
    clearEphemeralKeypair();
    setBalance(0);
  };

  const fundFriendbot = async (): Promise<boolean> => {
    if (!address) return false;
    const ok = await fundTestnetAccount(address);
    if (ok) {
      // Allow Stellar ledger to close the funding transaction
      setTimeout(async () => {
        await refreshBalance();
      }, 2500);
    }
    return ok;
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: !!address,
        address,
        network,
        balance,
        isFreighterAvailable,
        isConnecting,
        connectWallet,
        connectDemoWallet,
        disconnectWallet,
        fundFriendbot,
        refreshBalance,
        shortAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
