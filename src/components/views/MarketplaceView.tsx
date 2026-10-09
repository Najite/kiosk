import React, { useState } from 'react';
import { ListingItem, AssetCategory } from '../../types';
import { ShoppingBag, ShieldCheck, Tag, ExternalLink, Zap, Sparkles, Filter } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

interface MarketplaceViewProps {
  items: ListingItem[];
  onSelectItemForCheckout: (item: ListingItem) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  onSelectItemForCheckout,
}) => {
  const { shortAddress } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'license', label: 'API Licenses' },
    { id: 'pass', label: 'Developer Passes' },
    { id: 'badge', label: 'Credentials' },
    { id: 'collectible', label: 'Collectibles' },
  ];

  const [statusFilter, setStatusFilter] = useState<'all' | 'available'>('available');

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.assetType === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.isListed;
    return matchesCategory && matchesSearch && matchesStatus;
  });


  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>On-Chain Marketplace Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live Soroban Assets
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Browse non-custodial digital assets protected by cryptographic transfer policies.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search licenses, passes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-[#10101a] border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Filter Tabs & Status Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'bg-[#10101a] text-zinc-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#10101a] border border-white/10 text-xs">
          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1 rounded-full transition-all ${
              statusFilter === 'available'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active Listings
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full transition-all ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white font-medium'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All On-Chain ({items.length})
          </button>
        </div>
      </div>

      {/* Catalog Grid (Double Bezel Architecture) */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center double-bezel-outer">
          <div className="double-bezel-inner p-12 text-center">
            <Tag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No Assets Match Filters</h3>
            <p className="text-zinc-400 text-xs">Try selecting 'All On-Chain' or clearing category filter.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="double-bezel-outer group hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300"
            >
              <div className="double-bezel-inner p-5 flex flex-col h-full">
                {/* Visual Image / Thumbnail */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 bg-[#0a0a12] border border-white/5 flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                  <img
                    src={item.image || '/images/axon_vault.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-purple-300">
                    {item.badge || item.assetType.toUpperCase()}
                  </div>
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-md text-[10px] font-mono flex items-center gap-1 ${
                      item.isListed
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                        : item.status === 'placed'
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                        : 'bg-zinc-800/80 border border-white/10 text-zinc-400'
                    }`}
                  >
                    {item.isListed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                    <span>{item.isListed ? 'LISTED' : item.status === 'placed' ? 'ESCROWED' : 'SETTLED'}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-purple-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Metadata tags */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono py-2.5 border-t border-b border-white/5 mb-4">
                    <span>Seller: {shortAddress(item.seller)}</span>
                    <span className="text-purple-400">Royalty: {(item.royaltyBps ? item.royaltyBps / 100 : 7.5)}%</span>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Settlement Price</div>
                      <div className="text-xl font-extrabold text-white font-mono flex items-baseline gap-1">
                        <span>{item.price}</span>
                        <span className="text-xs text-purple-400 font-normal">XLM</span>
                      </div>
                    </div>

                    {item.isListed ? (
                      <button
                        onClick={() => onSelectItemForCheckout(item)}
                        className="group/btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                      >
                        <span>Buy On-Chain</span>
                        <Zap className="w-3.5 h-3.5 fill-black group-hover/btn:scale-110 transition-transform" />
                      </button>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-500">
                        {item.status === 'placed' ? 'Escrowed (Unlisted)' : 'Settled In Vault'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
