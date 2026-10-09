import React, { useState } from 'react';
import { ListingItem, AssetCategory } from '../../types';
import {
  executePlaceAndList,
  executePlace,
  executeList,
  executeDelist,
  executeWithdraw,
} from '../../lib/soroban';
import {
  Shield,
  Plus,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Tag,
  Download,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

interface KioskManagerViewProps {
  items: ListingItem[];
  onRefreshData: () => Promise<void>;
}

export const KioskManagerView: React.FC<KioskManagerViewProps> = ({
  items,
  onRefreshData,
}) => {
  const { address, shortAddress, isConnected, connectWallet, refreshBalance } = useWallet();
  const [showMintModal, setShowMintModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [assetType, setAssetType] = useState<AssetCategory>('pass');
  const [price, setPrice] = useState('15');
  const [mintMode, setMintMode] = useState<'place_and_list' | 'place_only'>('place_and_list');

  // Quick list modal state
  const [listingItemId, setListingItemId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState('20');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const typeStr =
        assetType === 'pass'
          ? 'Pass'
          : assetType === 'license'
          ? 'License'
          : assetType === 'badge'
          ? 'Credential'
          : 'Collectible';

      const fullDescription = imageUrl.trim() ? `${description.trim()} ${imageUrl.trim()}` : description.trim();

      let res;
      if (mintMode === 'place_and_list') {
        res = await executePlaceAndList({
          sellerAddress: address,
          title,
          description: fullDescription,
          assetType: typeStr,
          priceInXlm: parseFloat(price) || 10,
        });
      } else {
        res = await executePlace({
          sellerAddress: address,
          title,
          description: fullDescription,
          assetType: typeStr,
        });
      }

      setSuccessTxHash(res.txHash);
      await onRefreshData();
      await refreshBalance();

      setTitle('');
      setDescription('');
      setImageUrl('');
      setPrice('15');
      setShowMintModal(false);
    } catch (err: any) {
      console.error('Vault placement failed:', err);
      setErrorMessage(err?.message || 'Transaction rejected by Soroban RPC node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelist = async (itemId: number) => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    setErrorMessage(null);
    try {
      const res = await executeDelist({
        callerAddress: address,
        itemId,
      });
      setSuccessTxHash(res.txHash);
      await onRefreshData();
      await refreshBalance();
    } catch (err: any) {
      console.error('Delisting failed:', err);
      setErrorMessage(err?.message || 'Delisting failed on Soroban.');
    }
  };

  const handleWithdraw = async (itemId: number) => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    setErrorMessage(null);
    try {
      const res = await executeWithdraw({
        callerAddress: address,
        itemId,
      });
      setSuccessTxHash(res.txHash);
      await onRefreshData();
      await refreshBalance();
    } catch (err: any) {
      console.error('Withdrawal failed:', err);
      setErrorMessage(err?.message || 'Withdrawal failed on Soroban.');
    }
  };

  const handleList = async (itemId: number) => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    setErrorMessage(null);
    try {
      const res = await executeList({
        sellerAddress: address,
        itemId,
        priceInXlm: parseFloat(listingPrice) || 10,
      });
      setSuccessTxHash(res.txHash);
      setListingItemId(null);
      await onRefreshData();
      await refreshBalance();
    } catch (err: any) {
      console.error('Listing failed:', err);
      setErrorMessage(err?.message || 'Listing failed on Soroban.');
    }
  };

  const activeCount = items.filter((i) => i.isListed).length;
  const totalValue = items.reduce((acc, i) => acc + (i.isListed ? i.price : 0), 0);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>On-Chain Vault Storage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Kiosk Vault Manager
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Deposit, list, and control digital assets in autonomous Soroban smart contract instance storage.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setShowMintModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Mint & List On-Chain</span>
        </button>
      </div>

      {successTxHash && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>On-Chain Transaction Confirmed: <span className="font-mono">{successTxHash.slice(0, 16)}...</span></span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${successTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-mono underline"
          >
            <span>Explorer Receipt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-zinc-500">SOROBAN VAULT ITEMS</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{items.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-zinc-500">ACTIVE LISTINGS</div>
              <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{activeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer">
          <div className="double-bezel-inner p-5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-zinc-500">TOTAL VAULT VALUE</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{totalValue.toLocaleString()} XLM</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Vault Inventory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Live On-Chain Holdings</h3>
          <span className="text-xs text-zinc-500 font-mono">Contract: CB3AQG...67CLQQB</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="double-bezel-outer">
              <div className="double-bezel-inner p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                    On-Chain ID #{item.id}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full ${
                      item.isListed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {item.isListed ? 'LISTED ON SOROBAN' : 'DELISTED / VAULT'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{item.description}</p>

                <div className="mt-auto pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      {item.isListed ? 'PRICE' : 'STATUS'}
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {item.isListed ? `${item.price} XLM` : 'In Vault'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isListed ? (
                      <button
                        onClick={() => handleDelist(item.id)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all"
                      >
                        Delist
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setListingItemId(item.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>List</span>
                        </button>
                        <button
                          onClick={() => handleWithdraw(item.id)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1"
                          title="Withdraw escrowed asset from vault back to your wallet"
                        >
                          <Download className="w-3 h-3" />
                          <span>Withdraw</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick List Modal */}
      {listingItemId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-sm double-bezel-outer">
            <div className="double-bezel-inner p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white">List Vault Asset #{listingItemId}</h4>
                <button
                  onClick={() => setListingItemId(null)}
                  className="text-xs text-zinc-500 hover:text-white font-mono"
                >
                  Close
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Listing Price (XLM)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setListingItemId(null)}
                  className="px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleList(listingItemId)}
                  className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
                >
                  Confirm Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mint Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-lg double-bezel-outer">
            <div className="double-bezel-inner p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">On-Chain Asset Vault Deposit</h3>
                    <div className="text-[10px] font-mono text-zinc-400">
                      {mintMode === 'place_and_list' ? 'place_and_list() entry point' : 'place() entry point'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMintModal(false)}
                  disabled={isSubmitting}
                  className="text-zinc-500 hover:text-white text-xs font-mono"
                >
                  ESC / Close
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0c0c14] border border-white/5 mb-4 text-xs">
                <button
                  type="button"
                  onClick={() => setMintMode('place_and_list')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    mintMode === 'place_and_list'
                      ? 'bg-purple-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Place & List (1-Step)
                </button>
                <button
                  type="button"
                  onClick={() => setMintMode('place_only')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    mintMode === 'place_only'
                      ? 'bg-purple-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Vault Only (Unlisted)
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Asset Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Developer License Pass"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the utility or terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Image / Media URI <span className="text-zinc-500 font-normal">(Optional HTTPS or IPFS URL)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or ipfs://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono placeholder:text-zinc-600"
                  />
                </div>

                <div className={`grid ${mintMode === 'place_and_list' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Asset Type</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value as AssetCategory)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="pass">Developer Pass</option>
                      <option value="license">API License</option>
                      <option value="badge">Credential Badge</option>
                      <option value="collectible">Collectible</option>
                    </select>
                  </div>

                  {mintMode === 'place_and_list' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Price (XLM)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowMintModal(false)}
                    className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Broadcasting to Soroban...</span>
                      </>
                    ) : (
                      <span>Deposit into Vault</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
