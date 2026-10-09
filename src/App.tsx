import React, { useState, useEffect, useCallback } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TelemetryBar } from './components/TelemetryBar';
import { InteractiveSandbox } from './components/InteractiveSandbox';
import { MarketplaceView } from './components/views/MarketplaceView';
import { KioskManagerView } from './components/views/KioskManagerView';
import { PolicyEngineView } from './components/views/PolicyEngineView';
import { WidgetEmbedView } from './components/views/WidgetEmbedView';
import { ConnectModal } from './components/ConnectModal';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { fetchAllContractItems, fetchContractPolicy } from './lib/soroban';
import { stroopsToXlm } from './lib/stellar';
import { ListingItem, TransferPolicy, AssetCategory } from './types';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { getTabFromUrl, navigateToTab, TabId, TABS } from './lib/navigation';

const FALLBACK_POLICY: TransferPolicy = {
  owner: 'GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO',
  royaltyBps: 750,
  royaltyRecipient: 'GBOLOWBCVE2AZ3XTFKQURYTSLZHTXA2IM7JSKIYOJB37XVTDPJTAEB5X',
  minFloorPrice: 1,
  upstreamSplits: [
    {
      recipient: 'GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO',
      bps: 250,
      label: 'Protocol Treasury',
    },
  ],
};

export function AppContent() {
  const { address } = useWallet();
  const [activeTab, setActiveTabState] = useState<TabId>(() => getTabFromUrl());

  const setActiveTab = useCallback((tab: string, replace = false) => {
    const matched = TABS.find((t) => t.id === tab);
    const tabId: TabId = matched ? matched.id : 'overview';
    setActiveTabState(tabId);
    navigateToTab(tabId, replace);
  }, []);

  // Listen to browser Back/Forward (popstate) and hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const currentTab = getTabFromUrl();
      setActiveTabState(currentTab);
      const tabConfig = TABS.find((t) => t.id === currentTab) || TABS[0];
      document.title = tabConfig.title;
    };

    // Set initial document title matching current tab
    const initialConfig = TABS.find((t) => t.id === activeTab) || TABS[0];
    document.title = initialConfig.title;

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [activeTab]);

  const [items, setItems] = useState<ListingItem[]>([]);
  const [policy, setPolicy] = useState<TransferPolicy>(FALLBACK_POLICY);
  const [isLoadingOnChain, setIsLoadingOnChain] = useState<boolean>(true);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [selectedItemForCheckout, setSelectedItemForCheckout] = useState<ListingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOnChainData = useCallback(async () => {
    setIsLoadingOnChain(true);
    try {
      // 1. Fetch real on-chain policy
      const onChainPolicy = await fetchContractPolicy();
      if (onChainPolicy) {
        setPolicy({
          owner: 'GD54GYI3SRVER7O56DLEXZEXQ2UJVXIOOXZYVV5ITCZ4MOEJ3XFLXNVO',
          royaltyBps: onChainPolicy.royaltyBps,
          royaltyRecipient: onChainPolicy.royaltyRecipient,
          minFloorPrice: stroopsToXlm(onChainPolicy.minFloorPrice),
          upstreamSplits: onChainPolicy.upstreamSplits.map((s, idx) => ({
            recipient: s.recipient,
            bps: s.shareBps,
            label: idx === 0 ? 'Protocol Treasury' : `Affiliate #${idx + 1}`,
          })),
        });
      }

      // 2. Fetch real on-chain items
      const onChainItems = await fetchAllContractItems();
      if (onChainItems.length > 0) {
        const formatted: ListingItem[] = onChainItems.map((item) => {
          const typeLower = item.assetType.toLowerCase();
          const category: AssetCategory =
            typeLower.includes('pass')
              ? 'pass'
              : typeLower.includes('license')
              ? 'license'
              : typeLower.includes('credential') || typeLower.includes('badge')
              ? 'badge'
              : 'collectible';

          return {
            id: item.id,
            seller: item.seller,
            title: item.title,
            description: item.description,
            assetType: category,
            assetContract: item.assetContract,
            assetAmount: Number(item.assetAmount),
            paymentToken: item.paymentToken,
            price: stroopsToXlm(item.price),
            isListed: item.isListed,
            status: item.status,
            royaltyBps: onChainPolicy ? onChainPolicy.royaltyBps : 750,
            badge: item.assetType,
            image: category === 'license' ? '/images/axon_vault.jpg' : '/images/axon_emblem.jpg',
            createdAt: new Date().toISOString(),
          };
        });
        setItems(formatted);
      }
    } catch (err) {
      console.warn('Error loading on-chain data:', err);
    } finally {
      setIsLoadingOnChain(false);
    }
  }, []);

  useEffect(() => {
    loadOnChainData();
  }, [loadOnChainData]);

  const handleSuccessPurchase = async (purchasedItem: ListingItem) => {
    showToast(`Purchased "${purchasedItem.title}" on-chain!`);
    await loadOnChainData();
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col relative selection:bg-purple-600/30 selection:text-purple-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#0c0c16]/90 border border-purple-500/40 text-purple-200 text-xs font-medium shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Island Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'overview' && (
          <>
            <Hero
              onExploreMarket={() => setActiveTab('marketplace')}
              onExploreVault={() => setActiveTab('vault')}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
            />
            <TelemetryBar />
            <InteractiveSandbox />

            {/* Live On-Chain Item Preview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">Live On-Chain Vault Items</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Soroban Synced
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Fetched directly from deployed contract on Stellar Testnet</p>
                </div>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-purple-300 font-mono transition-colors"
                >
                  View Full Catalog →
                </button>
              </div>

              {isLoadingOnChain ? (
                <div className="py-12 text-center text-zinc-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-xs font-mono">Querying Soroban Testnet Contract...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 border border-white/5 rounded-2xl">
                  No items listed yet in the smart contract. Use Kiosk Vault to mint the first one!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="double-bezel-outer">
                      <div className="double-bezel-inner p-5 flex flex-col h-full">
                        <div className="w-full h-40 rounded-xl overflow-hidden mb-3 bg-[#0a0a12]">
                          <img src={item.image || '/images/axon_vault.jpg'} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{item.description}</p>
                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-base font-bold font-mono text-purple-300">{item.price} XLM</span>
                          {item.isListed ? (
                            <button
                              onClick={() => setSelectedItemForCheckout(item)}
                              className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                            >
                              Buy On-Chain
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Purchased</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView
            items={items}
            onSelectItemForCheckout={(item) => setSelectedItemForCheckout(item)}
          />
        )}

        {activeTab === 'vault' && (
          <KioskManagerView
            items={items}
            onRefreshData={loadOnChainData}
          />
        )}

        {activeTab === 'policy' && (
          <PolicyEngineView
            policy={policy}
            onRefreshData={loadOnChainData}
          />
        )}

        {activeTab === 'embed' && <WidgetEmbedView />}
      </main>

      {/* Modals */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <CheckoutModal
        item={selectedItemForCheckout}
        policy={policy}
        isOpen={!!selectedItemForCheckout}
        onClose={() => setSelectedItemForCheckout(null)}
        onSuccessPurchase={handleSuccessPurchase}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}
