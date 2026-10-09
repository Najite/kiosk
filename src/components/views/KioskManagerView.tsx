import React, { useState, useEffect, useCallback } from 'react';
import { ListingItem, AssetCategory } from '../../types';
import {
  executePlaceAndList,
  executePlace,
  executeList,
  executeDelist,
  executeWithdraw,
  fetchTokenBalance,
  fetchTokenMetadata,
  addTokenToFreighter,
  type TokenMetadata,
} from '../../lib/soroban';
import {
  TESTNET_CONTRACT_ID,
  DEFAULT_TESTNET_ASSET_CONTRACT,
  NATIVE_SAC,
  formatAddress,
  fetchLiveAccount,
} from '../../lib/stellar';
import {
  Plus,
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
  Copy,
  Check,
  Search,
  Wallet,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

interface WalletAssetHolding {
  name: string;
  symbol: string;
  contractId: string;
  balanceFormatted: string;
  balanceRaw: bigint;
  isNative: boolean;
}

interface KioskManagerViewProps {
  items: ListingItem[];
  onRefreshData: () => Promise<void>;
}

export const KioskManagerView: React.FC<KioskManagerViewProps> = ({
  items,
  onRefreshData,
}) => {
  const { address, shortAddress, isConnected, connectWallet, refreshBalance } = useWallet();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  // Inspector tool state
  const [inspectorContractId, setInspectorContractId] = useState('');
  const [inspectorResult, setInspectorResult] = useState<TokenMetadata | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  // Deposit Form states
  const [depositSource, setDepositSource] = useState<'wallet' | 'custom'>('wallet');
  const [walletHoldings, setWalletHoldings] = useState<WalletAssetHolding[]>([]);
  const [selectedHoldingIdx, setSelectedHoldingIdx] = useState<number>(0);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false);

  // Custom contract input state
  const [customContractInput, setCustomContractInput] = useState('');
  const [customMeta, setCustomMeta] = useState<TokenMetadata | null>(null);
  const [customBalance, setCustomBalance] = useState<bigint | null>(null);
  const [isValidatingCustom, setIsValidatingCustom] = useState(false);

  // Form details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [assetType, setAssetType] = useState<AssetCategory>('license');
  const [assetAmount, setAssetAmount] = useState('1');
  const [price, setPrice] = useState('15');
  const [mintMode, setMintMode] = useState<'place_and_list' | 'place_only'>('place_and_list');

  // Quick list modal state
  const [listingItemId, setListingItemId] = useState<number | null>(null);
  const [listingPrice, setListingPrice] = useState('20');

  // Filter and wallet action states
  const [vaultFilter, setVaultFilter] = useState<'all' | 'my_holdings' | 'escrow'>('all');
  const [addingFreighterContract, setAddingFreighterContract] = useState<string | null>(null);
  const [freighterSuccessContract, setFreighterSuccessContract] = useState<string | null>(null);
  const [copiedContractId, setCopiedContractId] = useState<string | null>(null);

  const handleAddToFreighter = async (contractId: string) => {
    setAddingFreighterContract(contractId);
    const res = await addTokenToFreighter(contractId);
    setAddingFreighterContract(null);
    if (res.success) {
      setFreighterSuccessContract(contractId);
      setTimeout(() => setFreighterSuccessContract(null), 3000);
    }
  };

  // Load user's real wallet assets directly from Horizon and Soroban RPC
  const loadWalletHoldings = useCallback(async () => {
    if (!address) {
      setWalletHoldings([]);
      return;
    }
    setIsLoadingHoldings(true);
    try {
      const holdings: WalletAssetHolding[] = [];

      // 1. Always load Native XLM (SAC)
      const acc = await fetchLiveAccount(address, 'TESTNET');
      const xlmBal = parseFloat(acc.xlmBalance) || 0;
      holdings.push({
        name: 'Stellar Lumens',
        symbol: 'XLM',
        contractId: NATIVE_SAC.TESTNET,
        balanceFormatted: xlmBal.toLocaleString(undefined, { maximumFractionDigits: 4 }),
        balanceRaw: BigInt(Math.floor(xlmBal * 10_000_000)),
        isNative: true,
      });

      // 2. Query known Soroban SEP-0041 tokens owned by this wallet
      const candidateContracts = new Set<string>();
      candidateContracts.add(DEFAULT_TESTNET_ASSET_CONTRACT);
      items.forEach((item) => {
        if (
          item.assetContract &&
          item.assetContract.startsWith('C') &&
          item.assetContract !== NATIVE_SAC.TESTNET
        ) {
          candidateContracts.add(item.assetContract);
        }
      });

      for (const contractId of Array.from(candidateContracts)) {
        try {
          const bal = await fetchTokenBalance(contractId, address);
          if (bal !== null && bal > 0n) {
            const meta = await fetchTokenMetadata(contractId);
            holdings.push({
              name: meta?.name || 'Soroban Asset',
              symbol: meta?.symbol || 'TOKEN',
              contractId,
              balanceFormatted: bal.toString(),
              balanceRaw: bal,
              isNative: false,
            });
          }
        } catch (e) {
          console.warn(`Balance check for ${contractId} skipped:`, e);
        }
      }

      // 3. Check any other issued classic assets on Horizon
      for (const bal of acc.balances) {
        if (bal.asset_type !== 'native' && bal.asset_code) {
          holdings.push({
            name: `${bal.asset_code} Token`,
            symbol: bal.asset_code,
            contractId: NATIVE_SAC.TESTNET, // Placeholder for SAC
            balanceFormatted: bal.balance || '0',
            balanceRaw: BigInt(Math.floor(parseFloat(bal.balance || '0') * 10_000_000)),
            isNative: false,
          });
        }
      }

      setWalletHoldings(holdings);
    } catch (err) {
      console.warn('Failed to load wallet holdings:', err);
    } finally {
      setIsLoadingHoldings(false);
    }
  }, [address, items]);

  useEffect(() => {
    if (showDepositModal) {
      loadWalletHoldings();
    }
  }, [showDepositModal, loadWalletHoldings]);

  // Inspect custom contract in real time
  const validateCustomContract = useCallback(async (contractId: string) => {
    const clean = contractId.trim();
    if (!clean.startsWith('C') || clean.length !== 56) {
      setCustomMeta(null);
      setCustomBalance(null);
      return;
    }
    setIsValidatingCustom(true);
    try {
      const meta = await fetchTokenMetadata(clean);
      setCustomMeta(meta);

      if (address) {
        const bal = await fetchTokenBalance(clean, address);
        setCustomBalance(bal);
      } else {
        setCustomBalance(null);
      }
    } catch (err) {
      console.warn('Custom contract validation failed:', err);
      setCustomMeta(null);
      setCustomBalance(null);
    } finally {
      setIsValidatingCustom(false);
    }
  }, [address]);

  useEffect(() => {
    if (depositSource === 'custom' && customContractInput.length === 56) {
      validateCustomContract(customContractInput);
    } else if (depositSource === 'custom' && customContractInput.length !== 56) {
      setCustomMeta(null);
      setCustomBalance(null);
    }
  }, [depositSource, customContractInput, validateCustomContract]);

  // Run the standalone contract inspector
  const handleInspectContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inspectorContractId.trim();
    if (!clean.startsWith('C') || clean.length !== 56) return;
    setInspectorLoading(true);
    try {
      const meta = await fetchTokenMetadata(clean);
      setInspectorResult(meta);
    } catch (err) {
      console.warn('Inspection error:', err);
      setInspectorResult(null);
    } finally {
      setInspectorLoading(false);
    }
  };

  // Determine active contract and balance for submission
  const activeContractId =
    depositSource === 'wallet'
      ? walletHoldings[selectedHoldingIdx]?.contractId || NATIVE_SAC.TESTNET
      : customContractInput.trim();

  const activeHolding = depositSource === 'wallet' ? walletHoldings[selectedHoldingIdx] : null;

  const hasZeroBalance =
    depositSource === 'wallet'
      ? !activeHolding || activeHolding.balanceRaw <= 0n
      : customBalance !== null && customBalance <= 0n;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (!isConnected || !address) {
      await connectWallet();
      return;
    }

    if (!activeContractId || !activeContractId.startsWith('C') || activeContractId.length !== 56) {
      setErrorMessage('Please specify a valid 56-character Soroban contract ID starting with C.');
      return;
    }

    if (hasZeroBalance) {
      setErrorMessage('Cannot deposit: Your connected wallet holds 0 balance of this token on-chain.');
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
      const parsedAmount = Math.max(1, parseInt(assetAmount, 10) || 1);

      let res;
      if (mintMode === 'place_and_list') {
        res = await executePlaceAndList({
          sellerAddress: address,
          assetContract: activeContractId,
          assetAmount: parsedAmount,
          title,
          description: fullDescription,
          assetType: typeStr,
          priceInXlm: parseFloat(price) || 10,
        });
      } else {
        res = await executePlace({
          sellerAddress: address,
          assetContract: activeContractId,
          assetAmount: parsedAmount,
          title,
          description: fullDescription,
          assetType: typeStr,
        });
      }

      setSuccessTxHash(res.txHash);
      await onRefreshData();
      await refreshBalance();
      await loadWalletHoldings();

      setTitle('');
      setDescription('');
      setImageUrl('');
      setPrice('15');
      setShowDepositModal(false);
    } catch (err: any) {
      console.error('Vault deposit failed:', err);
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
      await loadWalletHoldings();
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
            <span>Autonomous Vault Custody</span>
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
            setShowDepositModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_25px_rgba(168,85,247,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Deposit Asset into Vault</span>
        </button>
      </div>

      {successTxHash && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              On-Chain Transaction Confirmed:{' '}
              <span className="font-mono">{formatAddress(successTxHash, 8, 8)}</span>
            </span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${successTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-mono underline"
          >
            <span>Explorer Receipt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Protocol Architecture Telemetry Strip */}
      <div className="mb-10 double-bezel-outer">
        <div className="double-bezel-inner p-5 sm:p-6 bg-[#0c0c16]/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Sui-Style Kiosk Standard on Stellar</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    Asset-Agnostic
                  </span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Universal non-custodial vault: escrow any SEP-0041 token or Stellar Asset Contract (SAC) with enforceable transfer policies.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-500">Contract:</span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                <span>{formatAddress(TESTNET_CONTRACT_ID, 6, 6)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Real-time Contract Inspector Tool */}
          <div className="pt-1">
            <div className="text-[11px] font-mono text-zinc-400 mb-2">INSPECT ANY SOROBAN CONTRACT ON TESTNET:</div>
            <form onSubmit={handleInspectContract} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Paste 56-char Contract ID starting with C..."
                  value={inspectorContractId}
                  onChange={(e) => setInspectorContractId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                disabled={inspectorLoading || inspectorContractId.trim().length !== 56}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all disabled:opacity-40"
              >
                {inspectorLoading ? 'Querying...' : 'Query On-Chain Metadata'}
              </button>
            </form>

            {inspectorResult && (
              <div className="mt-3 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">{inspectorResult.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {inspectorResult.symbol}
                  </span>
                  <span className="text-zinc-500">Decimals: {inspectorResult.decimals}</span>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${inspectorResult.contractId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-purple-200 flex items-center gap-1"
                >
                  <span>Stellar Expert Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

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
        {/* Freighter Tip Callout */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-violet-950/20 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Freighter Wallet Asset Synchronization</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  SEP-0041 Standard
                </span>
              </div>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                When you purchase Kiosk assets, Soroban delivers the smart-contract tokens directly to your wallet address. In Freighter, custom Soroban tokens live in the <strong className="text-white">Tokens</strong> tab once tracked. They do <strong className="text-white">not</strong> appear in Freighter's <strong className="text-white">Collectibles</strong> tab (which is reserved for classic NFTs). Click <strong className="text-purple-300">+ Add to Freighter</strong> on any asset below to view it in your wallet!
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setVaultFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                vaultFilter === 'all'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              All Protocol Items ({items.length})
            </button>
            <button
              onClick={() => setVaultFilter('my_holdings')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                vaultFilter === 'my_holdings'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              My Purchased Assets ({items.filter((i) => address && i.seller.toLowerCase() === address.toLowerCase()).length})
            </button>
            <button
              onClick={() => setVaultFilter('escrow')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                vaultFilter === 'escrow'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              Active In Vault ({items.filter((i) => i.status !== 'sold').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-mono">Contract:</span>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${TESTNET_CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>{formatAddress(TESTNET_CONTRACT_ID)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items
            .filter((item) => {
              if (vaultFilter === 'my_holdings') {
                return address && item.seller.toLowerCase() === address.toLowerCase();
              }
              if (vaultFilter === 'escrow') {
                return item.status !== 'sold';
              }
              return true;
            })
            .map((item) => {
              const isOwner = Boolean(address && item.seller.toLowerCase() === address.toLowerCase());
              return (
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
                        : item.status === 'sold'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {item.isListed ? 'LISTED ON SOROBAN' : item.status === 'sold' ? 'SOLD & DELIVERED' : 'IN VAULT CUSTODY'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{item.description}</p>

                {/* Token Asset Contract & Amount Details */}
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 mb-4 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-zinc-500">Asset Contract:</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/contract/${item.assetContract || NATIVE_SAC.TESTNET}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 flex items-center gap-1"
                      title={item.assetContract || NATIVE_SAC.TESTNET}
                    >
                      <span>{formatAddress(item.assetContract || NATIVE_SAC.TESTNET, 5, 5)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-zinc-500">Escrow Amount:</span>
                    <span className="text-white font-bold">{item.assetAmount ?? 1} Units</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-zinc-500">Current Owner:</span>
                    <span className={isOwner ? 'text-emerald-400 font-bold' : ''}>
                      {formatAddress(item.seller, 5, 5)} {isOwner ? '(You)' : ''}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      {item.isListed ? 'PRICE' : 'STATUS'}
                    </div>
                    <div className="text-base font-bold font-mono text-white">
                      {item.isListed ? `${item.price} XLM` : item.status === 'sold' ? 'Delivered' : 'In Vault'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'sold' ? (
                      item.assetContract && item.assetContract !== NATIVE_SAC.TESTNET ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAddToFreighter(item.assetContract!)}
                            disabled={addingFreighterContract === item.assetContract}
                            className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-600/30 text-purple-300 border border-purple-500/40 hover:bg-purple-600/50 transition-all flex items-center gap-1"
                            title="Add SEP-0041 token to Freighter Wallet"
                          >
                            {freighterSuccessContract === item.assetContract ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Added!</span>
                              </>
                            ) : addingFreighterContract === item.assetContract ? (
                              <span>Prompting...</span>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Add to Freighter</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.assetContract!);
                              setCopiedContractId(item.assetContract!);
                              setTimeout(() => setCopiedContractId(null), 2000);
                            }}
                            className="p-1 rounded-lg bg-black/40 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white"
                            title="Copy Contract ID"
                          >
                            {copiedContractId === item.assetContract ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Settled as XLM SAC
                        </span>
                      )
                    ) : item.isListed ? (
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
          );
        })}
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

      {/* Rebuilt, Asset-Agnostic Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="relative w-full max-w-lg double-bezel-outer max-h-[90vh] overflow-y-auto">
            <div className="double-bezel-inner p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Deposit Asset into Vault</h3>
                    <div className="text-[10px] font-mono text-zinc-400">
                      {mintMode === 'place_and_list' ? 'Atomic place_and_list()' : 'Custodial place()'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDepositModal(false)}
                  disabled={isSubmitting}
                  className="text-zinc-500 hover:text-white text-xs font-mono"
                >
                  ESC / Close
                </button>
              </div>

              {/* Mode Toggle (Place & List vs Place Only) */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0c0c14] border border-white/5 mb-5 text-xs">
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

              <form onSubmit={handleDepositSubmit} className="space-y-4">
                {/* Asset Source Selection Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white">Select Asset to Deposit</label>
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setDepositSource('wallet')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          depositSource === 'wallet'
                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        From My Wallet
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepositSource('custom')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          depositSource === 'custom'
                            ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        Custom Contract ID
                      </button>
                    </div>
                  </div>

                  {depositSource === 'wallet' ? (
                    <div className="space-y-2">
                      {isLoadingHoldings ? (
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs text-zinc-500">
                          Loading wallet assets from Stellar...
                        </div>
                      ) : walletHoldings.length === 0 ? (
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs text-zinc-400">
                          {isConnected
                            ? 'No assets found in your connected wallet.'
                            : 'Please connect your wallet to detect your assets.'}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {walletHoldings.map((h, idx) => (
                            <div
                              key={idx}
                              onClick={() => setSelectedHoldingIdx(idx)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                selectedHoldingIdx === idx
                                  ? 'bg-purple-600/15 border-purple-500/50 text-white'
                                  : 'bg-black/30 border-white/5 text-zinc-400 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold">
                                  {h.symbol.slice(0, 3)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <span>{h.name}</span>
                                    {h.isNative && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                                        SAC
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-mono text-zinc-500">
                                    {formatAddress(h.contractId, 6, 6)}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-xs font-bold font-mono text-white">
                                  {h.balanceFormatted} {h.symbol}
                                </div>
                                <div className="text-[10px] font-mono text-emerald-400">Available</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Paste 56-character Contract ID starting with C..."
                          value={customContractInput}
                          onChange={(e) => setCustomContractInput(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {isValidatingCustom ? (
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-zinc-400 text-center font-mono">
                          Simulating Soroban contract metadata...
                        </div>
                      ) : customMeta ? (
                        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Token Detected:</span>
                            <span className="text-white font-bold">
                              {customMeta.name} ({customMeta.symbol})
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Your Wallet Balance:</span>
                            <span className="text-white font-bold">
                              {customBalance !== null ? `${customBalance.toString()} ${customMeta.symbol}` : '0'}
                            </span>
                          </div>
                        </div>
                      ) : customContractInput.length === 56 ? (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                          Could not resolve SEP-0041 metadata on this contract ID.
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Zero Balance Warning if user tries to escrow asset they don't own */}
                  {hasZeroBalance && isConnected && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <strong>Insufficient Balance:</strong> Your wallet currently holds 0 units of this asset. In Soroban, depositing into the Kiosk vault transfers tokens from your wallet into the contract; you must hold tokens to deposit them.
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Quantity to Escrow</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={assetAmount}
                      onChange={(e) => setAssetAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Asset Classification</label>
                    <select
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value as AssetCategory)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="license">API License</option>
                      <option value="pass">Developer Pass</option>
                      <option value="badge">Credential Badge</option>
                      <option value="collectible">Digital Collectible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Listing Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Enterprise Developer Pass"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Terms / Utility Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe license utility, access privileges, or verification terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Media / Artwork URI <span className="text-zinc-500 font-normal">(Optional HTTPS or IPFS)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://... or ipfs://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono placeholder:text-zinc-600"
                  />
                </div>

                {mintMode === 'place_and_list' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Listing Price (XLM)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowDepositModal(false)}
                    className="px-4 py-2 rounded-full text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || hasZeroBalance}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold hover:from-purple-500 hover:to-violet-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
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
