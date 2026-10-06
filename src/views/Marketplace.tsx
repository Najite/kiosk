import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Store,
  ShoppingCart,
  Check,
  Wallet,
  ArrowRight,
  Layers,
  Shield,
  Clock,
  Zap,
  Activity,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { kioskStorage, type Kiosk, type KioskItem, type TransferPolicy, type EscrowTransaction } from '@/lib/kiosk';
import {
  fetchContractPolicy,
  fetchContractItem,
  fetchContractEvents,
  buildPurchaseTx,
  submitSignedTx,
  type OnChainEvent,
} from '@/lib/soroban';
import {
  generateStellarAddress,
  generateTxHash,
  shortAddress,
  formatTokenAmount,
  calculatePayouts,
  bpsToPercent,
  formatTimeAgo,
  formatDuration,
} from '@/lib/stellar';
import { useWallet } from '@/context/WalletContext';
import { Panel, SectionTitle, Badge, Button, Modal, StatusDot, StatCard, EmptyState } from '@/components/ui';

type CheckoutStep = 'idle' | 'review' | 'signing' | 'settling' | 'done';

export function Marketplace() {
  const { address, isConnected, connect, shortAddr, signTx, refreshAccount } = useWallet();
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [items, setItems] = useState<KioskItem[]>([]);
  const [policies, setPolicies] = useState<Record<string, TransferPolicy>>({});
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<KioskItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [completedTx, setCompletedTx] = useState<EscrowTransaction | null>(null);
  const isPurchasingRef = useRef(false);

  const [onChainSync, setOnChainSync] = useState<{
    item1: any | null;
    policy: any | null;
    events: OnChainEvent[];
  }>({ item1: null, policy: null, events: [] });

  const load = useCallback(async () => {
    setLoading(true);
    const kData = await kioskStorage.getKiosk(address);
    if (kData) {
      setKiosk(kData);
      let iData = await kioskStorage.getItems(kData.id, address);

      // Query live on-chain items and policy directly from deployed Soroban contract
      try {
        const onChainItems = await fetchAllContractItems();
        const onChainPolicy = await fetchContractPolicy();
        const liveEvents = await fetchContractEvents();

        setOnChainSync({
          item1: onChainItems[0] || null,
          policy: onChainPolicy,
          events: liveEvents,
        });

        if (onChainItems.length > 0 && iData.length > 0) {
          // Index on-chain items by ID
          const onChainMap = new Map(onChainItems.map((c) => [c.id, c]));

          iData = iData.map((it) => {
            const ocId = it.onchain_id ?? (it.id === 'item-101' ? 1 : it.id === 'item-102' ? 2 : it.id === 'item-103' ? 3 : it.id === 'item-104' ? 4 : undefined);
            if (ocId && onChainMap.has(ocId)) {
              const live = onChainMap.get(ocId)!;
              return {
                ...it,
                onchain_id: live.id,
                title: live.title || it.title,
                price: Number(live.price) / 10000000 || it.price,
                status: live.isListed ? 'AVAILABLE' : 'SETTLED',
              };
            }
            return it;
          });
        }
      } catch (err) {
        console.warn('Live Soroban fetch fallback:', err);
      }

      setItems(iData);

      const pm = await kioskStorage.getPolicies(address);
      setPolicies(pm);

      const tData = await kioskStorage.getTransactions(kData.id, address);
      setTransactions(tData);
    } else {
      setKiosk(null);
      setItems([]);
      setPolicies({});
      setTransactions([]);
    }
    setLoading(false);
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  const defaultPolicy: TransferPolicy = {
    id: 'default-policy',
    item_id: selectedItem?.id || '',
    min_royalty_bps: onChainSync.policy?.royaltyBps ?? 750,
    upstream_split_bps: (onChainSync.policy?.upstreamSplits || []).reduce((acc, s) => acc + s.shareBps, 0) || 250,
    upstream_recipients: (onChainSync.policy?.upstreamSplits || []).map((s) => ({
      label: 'Protocol Treasury',
      address: s.recipient,
      shareBps: s.shareBps,
    })),
    timelock_seconds: 0,
    escrow_mode: 'INSTANT',
    created_at: new Date().toISOString(),
  };

  const policy = selectedItem
    ? (policies[selectedItem.id] ||
       policies[`item-${selectedItem.onchain_id}`] ||
       (selectedItem.onchain_id === 1 ? policies['item-101'] : undefined) ||
       (selectedItem.onchain_id === 2 ? policies['item-102'] : undefined) ||
       (selectedItem.onchain_id === 3 ? policies['item-103'] : undefined) ||
       (selectedItem.onchain_id === 4 ? policies['item-104'] : undefined) ||
       defaultPolicy)
    : null;

  const payout = selectedItem && policy
    ? calculatePayouts(selectedItem.price, policy.min_royalty_bps, policy.upstream_split_bps)
    : null;

  const startCheckout = (item: KioskItem) => {
    setSelectedItem(item);
    setCheckoutStep('review');
    setCompletedTx(null);
  };

  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const executePurchase = async () => {
    if (!selectedItem || !kiosk || !payout || !policy || isPurchasingRef.current) return;
    isPurchasingRef.current = true;
    setPurchaseError(null);

    try {
      if (!address || !isConnected) {
        throw new Error('Please connect your Freighter wallet on Stellar Testnet to purchase.');
      }

      setCheckoutStep('signing');

      // Determine numeric ID for Soroban contract:
      let numericId: number;
      if (selectedItem.onchain_id !== undefined) {
        numericId = selectedItem.onchain_id;
      } else if (selectedItem.id === 'item-101' || selectedItem.id === '1') {
        numericId = 1;
      } else if (selectedItem.id === 'item-102' || selectedItem.id === '2') {
        numericId = 2;
      } else if (selectedItem.id === 'item-103' || selectedItem.id === '3') {
        numericId = 3;
      } else if (selectedItem.id === 'item-104' || selectedItem.id === '4') {
        numericId = 4;
      } else {
        const parsed = parseInt(selectedItem.id.replace('item-', ''), 10);
        numericId = !isNaN(parsed) && parsed < 100 ? parsed : 1;
      }

      // 1. Build and simulate Soroban purchase transaction
      const { xdrBase64 } = await buildPurchaseTx({
        buyerAddress: address,
        itemId: numericId,
        contractId: kiosk.contract_id || undefined,
      });

      // 2. Sign transaction via Freighter
      const signedXdr = await signTx(xdrBase64);
      if (!signedXdr) {
        throw new Error('User declined or failed transaction signature in Freighter');
      }

      // 3. Submit transaction to Soroban Testnet RPC
      setCheckoutStep('settling');
      const submitResult = await submitSignedTx(signedXdr, 'TESTNET');
      const txHash = submitResult.txHash;

      const newTx: Omit<EscrowTransaction, 'id' | 'created_at'> = {
        kiosk_id: kiosk.id,
        item_id: selectedItem.id,
        buyer_address: address,
        seller_address: kiosk.owner_address,
        amount: selectedItem.price,
        seller_payout: payout.sellerPayout,
        royalty_payout: payout.royaltyPayout,
        upstream_payout: payout.upstreamPayout,
        tx_hash: txHash,
        ledger_timestamp: new Date().toISOString(),
        status: policy.escrow_mode === 'INSTANT' ? 'SETTLED' : 'PENDING',
      };

      const tx = await kioskStorage.recordTransaction(newTx, address);
      setCompletedTx(tx);
      setTransactions((prev) => [tx, ...prev]);

      // Update item status in local storage
      const updatedItems = items.map((it) => (it.id === selectedItem.id ? { ...it, status: 'SETTLED' } : it));
      setItems(updatedItems);

      await kioskStorage.updateKiosk({
        total_sales_volume: Number(kiosk.total_sales_volume) + selectedItem.price,
      }, address);

      // Refresh account balances
      await refreshAccount();

      setCheckoutStep('done');
    } catch (err: any) {
      console.error('Purchase execution error:', err);
      setPurchaseError(err?.message || 'Transaction execution failed');
      setCheckoutStep('review');
    } finally {
      isPurchasingRef.current = false;
    }
  };

  const closeCheckout = () => {
    isPurchasingRef.current = false;
    setCheckoutStep('idle');
    setSelectedItem(null);
    setCompletedTx(null);
    setPurchaseError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="h-4 w-4 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          Loading marketplace...
        </div>
      </div>
    );
  }

  const totalVolume = transactions.reduce((a, t) => a + Number(t.amount), 0);
  const settledCount = transactions.filter((t) => t.status === 'SETTLED').length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* On-Chain Soroban Protocol Status */}
      <div className="p-3 rounded-xl bg-cyan/5 border border-cyan/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
          <span>
            <strong>Soroban Testnet Contract:</strong>{' '}
            <code className="font-mono text-white bg-black/40 px-1.5 py-0.5 rounded text-[11px]">
              {kiosk?.contract_id ? shortAddress(kiosk.contract_id, 8) : 'Deploying...'}
            </code>
          </span>
          {onChainSync.item1 && (
            <span className="text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded font-mono">
              Item #1 On-Chain Verified
            </span>
          )}
        </div>
        {kiosk?.contract_id && (
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${kiosk.contract_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-cyan hover:underline font-mono"
          >
            <span>Stellar Expert Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Listed Items" value={String(items.length)} icon={<Store className="h-4 w-4" />} accent="cyan" />
        <StatCard label="Total Transactions" value={String(transactions.length)} icon={<Activity className="h-4 w-4" />} accent="emerald" />
        <StatCard label="Volume Traded" value={formatTokenAmount(totalVolume, kiosk?.settlement_token || 'XLM')} icon={<Zap className="h-4 w-4" />} accent="amber" />
        <StatCard label="Settled" value={String(settledCount)} icon={<Check className="h-4 w-4" />} accent="emerald" />
      </div>

      {/* Marketplace grid */}
      <Panel className="p-5">
        <SectionTitle title="Live Marketplace" subtitle="Browse and purchase assets via Soroban escrow" icon={<Store className="h-4 w-4" />} />
        {items.length === 0 ? (
          <EmptyState icon={<Store className="h-6 w-6" />} title="No items listed yet" description="Items added in the Kiosk Manager will appear here for purchase." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const p = policies[item.id];
              return (
                <div key={item.id} className="panel-tight p-4 group hover:border-cyan/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/10 to-emerald/5 border border-cyan/15">
                      <Layers className="h-6 w-6 text-cyan" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={item.status} />
                      <Badge variant={item.status === 'AVAILABLE' ? 'emerald' : item.status === 'IN_ESCROW' ? 'amber' : 'cyan'} size="xs">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.description}</p>

                  {/* Policy tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge size="xs" variant="neutral">{item.asset_type}</Badge>
                    {p && p.min_royalty_bps > 0 && <Badge size="xs" variant="emerald">{bpsToPercent(p.min_royalty_bps)} royalty</Badge>}
                    {p && p.upstream_split_bps > 0 && <Badge size="xs" variant="amber">{bpsToPercent(p.upstream_split_bps)} upstream</Badge>}
                    {p && p.escrow_mode !== 'INSTANT' && <Badge size="xs" variant="cyan">{formatDuration(p.timelock_seconds)}</Badge>}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <p className="mono text-lg font-bold text-cyan">{formatTokenAmount(item.price, kiosk?.settlement_token || 'XLM')}</p>
                    <Button
                      size="sm"
                      onClick={() => startCheckout(item)}
                      disabled={item.status !== 'AVAILABLE'}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Buy
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Transaction history */}
      <Panel className="p-5">
        <SectionTitle title="Escrow Transactions" subtitle="Real-time settlement ledger" icon={<Activity className="h-4 w-4" />} />
        {transactions.length === 0 ? (
          <EmptyState icon={<Activity className="h-6 w-6" />} title="No transactions yet" description="Purchase an item to see escrow settlements appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-white/8">
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Tx Hash</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Buyer</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Amount</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Seller</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Royalty</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Upstream</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Status</th>
                  <th className="py-2 px-2 text-[10px] uppercase tracking-wider text-gray-600 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isRealTx = tx.tx_hash && !tx.tx_hash.startsWith('tx-') && tx.tx_hash.length >= 32;
                  const explorerUrl = isRealTx ? `https://stellar.expert/explorer/testnet/tx/${tx.tx_hash}` : null;

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => {
                        if (explorerUrl) {
                          window.open(explorerUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={`border-b border-white/5 transition-colors ${
                        explorerUrl ? 'hover:bg-cyan/5 cursor-pointer group' : 'hover:bg-white/3'
                      }`}
                      title={explorerUrl ? 'Click to view transaction on StellarExpert Explorer' : undefined}
                    >
                      <td className="py-2.5 px-2 mono">
                        {explorerUrl ? (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-cyan group-hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <span>{shortAddress(tx.tx_hash, 8)}</span>
                            <ExternalLink className="w-3 h-3 text-cyan/70 group-hover:text-cyan transition-colors" />
                          </a>
                        ) : (
                          <span className="text-gray-400">{shortAddress(tx.tx_hash, 8)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 mono">
                        {tx.buyer_address && tx.buyer_address.startsWith('G') ? (
                          <a
                            href={`https://stellar.expert/explorer/testnet/account/${tx.buyer_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-300 hover:text-cyan hover:underline"
                            title="View buyer on StellarExpert"
                          >
                            {shortAddress(tx.buyer_address, 4)}
                          </a>
                        ) : (
                          <span className="text-gray-400">{shortAddress(tx.buyer_address, 4)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 mono text-cyan font-medium">{formatTokenAmount(Number(tx.amount), kiosk?.settlement_token || 'XLM')}</td>
                      <td className="py-2.5 px-2 mono text-gray-400">{formatTokenAmount(Number(tx.seller_payout), kiosk?.settlement_token || 'XLM')}</td>
                      <td className="py-2.5 px-2 mono text-emerald">{formatTokenAmount(Number(tx.royalty_payout), kiosk?.settlement_token || 'XLM')}</td>
                      <td className="py-2.5 px-2 mono text-amber">{formatTokenAmount(Number(tx.upstream_payout), kiosk?.settlement_token || 'XLM')}</td>
                      <td className="py-2.5 px-2">
                        <Badge size="xs" variant={tx.status === 'SETTLED' ? 'emerald' : tx.status === 'PENDING' ? 'amber' : 'cyan'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-2">
                          <span>{formatTimeAgo(tx.ledger_timestamp || tx.created_at)}</span>
                          {explorerUrl && (
                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Checkout Modal */}
      <Modal open={checkoutStep !== 'idle'} onClose={closeCheckout} title="Soroban Escrow Checkout" width="max-w-md">
        {selectedItem && payout && policy && (
          <div className="space-y-4">
            {/* Item summary */}
            <div className="panel-tight p-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10 border border-cyan/20">
                <Layers className="h-6 w-6 text-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{selectedItem.title}</p>
                <p className="mono text-lg font-bold text-cyan mt-0.5">{formatTokenAmount(selectedItem.price, kiosk?.settlement_token || 'XLM')}</p>
              </div>
            </div>

            {/* Payout breakdown */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">Atomic Fund Split</p>
              <div className="panel-tight p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Seller Payout</span>
                  <span className="mono text-emerald font-medium">{formatTokenAmount(payout.sellerPayout, kiosk?.settlement_token || 'XLM')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Creator Royalty ({bpsToPercent(policy.min_royalty_bps)})</span>
                  <span className="mono text-cyan font-medium">{formatTokenAmount(payout.royaltyPayout, kiosk?.settlement_token || 'XLM')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Upstream Drip ({bpsToPercent(policy.upstream_split_bps)})</span>
                  <span className="mono text-amber font-medium">{formatTokenAmount(payout.upstreamPayout, kiosk?.settlement_token || 'XLM')}</span>
                </div>
                <div className="border-t border-white/8 pt-1.5 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-medium">Total</span>
                  <span className="mono text-sm text-white font-bold">{formatTokenAmount(selectedItem.price, kiosk?.settlement_token || 'XLM')}</span>
                </div>
              </div>
            </div>

            {/* Escrow mode */}
            <div className="flex items-center gap-2 panel-tight p-3">
              {policy.escrow_mode === 'INSTANT' && <Zap className="h-4 w-4 text-emerald" />}
              {policy.escrow_mode === 'TIMELOCK' && <Clock className="h-4 w-4 text-amber" />}
              {policy.escrow_mode === 'MULTISIG' && <Shield className="h-4 w-4 text-cyan" />}
              <span className="text-xs text-gray-400">
                {policy.escrow_mode === 'INSTANT' && 'Funds settle instantly upon transaction confirmation.'}
                {policy.escrow_mode === 'TIMELOCK' && `Funds locked for ${formatDuration(policy.timelock_seconds)} before release.`}
                {policy.escrow_mode === 'MULTISIG' && 'Funds require multi-sig confirmation to release.'}
              </span>
            </div>

            {/* Wallet state */}
            {!isConnected && checkoutStep === 'review' && (
              <div className="panel-tight p-3 border-amber/20 flex items-center gap-2.5">
                <Wallet className="h-4 w-4 text-amber shrink-0" />
                <p className="text-xs text-gray-400">Connect a wallet to sign the purchase transaction.</p>
              </div>
            )}

            {/* Error state */}
            {purchaseError && checkoutStep === 'review' && (
              <div className="panel-tight p-3 border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5">
                <span className="text-rose-400 font-bold text-xs mt-0.5">✕</span>
                <div className="text-xs text-rose-300">
                  <p className="font-semibold">Transaction Error</p>
                  <p className="text-[11px] text-rose-200/80 break-words mt-0.5">{purchaseError}</p>
                </div>
              </div>
            )}

            {/* Signing state */}
            {checkoutStep === 'signing' && (
              <div className="panel-tight p-4 flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
                <div>
                  <p className="text-sm text-white font-medium">Awaiting wallet signature...</p>
                  <p className="text-xs text-gray-500">Sign the transaction in your Freighter wallet</p>
                </div>
              </div>
            )}

            {checkoutStep === 'settling' && (
              <div className="panel-tight p-4 flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
                <div>
                  <p className="text-sm text-white font-medium">Settling on Soroban...</p>
                  <p className="text-xs text-gray-500">Submitting atomic transaction to Stellar</p>
                </div>
              </div>
            )}

            {/* Success state */}
            {checkoutStep === 'done' && completedTx && (
              <div className="space-y-3 animate-fade-in">
                <div className="panel-tight p-4 border-emerald/20 flex items-center gap-3 glow-emerald">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/15">
                    <Check className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">Transaction Settled</p>
                    <p className="text-xs text-gray-500">Atomic escrow executed on Soroban</p>
                  </div>
                </div>
                <div className="panel-tight p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Tx Hash</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${completedTx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-cyan hover:underline inline-flex items-center gap-1"
                    >
                      <span>{shortAddress(completedTx.tx_hash, 8)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Buyer</span>
                    <span className="mono text-gray-400">{shortAddress(completedTx.buyer_address, 4)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Status</span>
                    <Badge size="xs" variant={completedTx.status === 'SETTLED' ? 'emerald' : 'amber'}>{completedTx.status}</Badge>
                  </div>
                </div>
                <Button variant="emerald" className="w-full" onClick={closeCheckout}>
                  <Check className="h-3.5 w-3.5" />
                  Done
                </Button>
              </div>
            )}

            {/* Action buttons */}
            {checkoutStep === 'review' && (
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={closeCheckout}>Cancel</Button>
                {isConnected ? (
                  <Button onClick={executePurchase}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    Sign & Pay {formatTokenAmount(selectedItem.price, kiosk?.settlement_token || 'XLM')}
                  </Button>
                ) : (
                  <Button onClick={connect}>
                    <Wallet className="h-3.5 w-3.5" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
