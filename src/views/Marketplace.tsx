import { useState, useEffect, useCallback } from 'react';
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
  const { address, isConnected, connect, shortAddr } = useWallet();
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [items, setItems] = useState<KioskItem[]>([]);
  const [policies, setPolicies] = useState<Record<string, TransferPolicy>>({});
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<KioskItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('idle');
  const [completedTx, setCompletedTx] = useState<EscrowTransaction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const kData = await kioskStorage.getKiosk();
    if (kData) {
      setKiosk(kData);
      const iData = await kioskStorage.getItems(kData.id);
      setItems(iData);

      const pm = await kioskStorage.getPolicies();
      setPolicies(pm);

      const tData = await kioskStorage.getTransactions(kData.id);
      setTransactions(tData);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const policy = selectedItem ? policies[selectedItem.id] : null;
  const payout = selectedItem && policy
    ? calculatePayouts(selectedItem.price, policy.min_royalty_bps, policy.upstream_split_bps)
    : null;

  const startCheckout = (item: KioskItem) => {
    setSelectedItem(item);
    setCheckoutStep('review');
    setCompletedTx(null);
  };

  const executePurchase = async () => {
    if (!selectedItem || !kiosk || !payout || !policy) return;
    setCheckoutStep('signing');
    await new Promise((r) => setTimeout(r, 1200));

    setCheckoutStep('settling');
    await new Promise((r) => setTimeout(r, 1000));

    const buyer = address || generateStellarAddress();
    const txHash = generateTxHash();
    const newTx: Omit<EscrowTransaction, 'id' | 'created_at'> = {
      kiosk_id: kiosk.id,
      item_id: selectedItem.id,
      buyer_address: buyer,
      seller_address: kiosk.owner_address,
      amount: selectedItem.price,
      seller_payout: payout.sellerPayout,
      royalty_payout: payout.royaltyPayout,
      upstream_payout: payout.upstreamPayout,
      tx_hash: txHash,
      ledger_timestamp: new Date().toISOString(),
      status: policy.escrow_mode === 'INSTANT' ? 'SETTLED' : 'PENDING',
    };

    const tx = await kioskStorage.recordTransaction(newTx);
    setCompletedTx(tx);
    setTransactions([tx, ...transactions]);
    await kioskStorage.updateKiosk({
      total_sales_volume: Number(kiosk.total_sales_volume) + selectedItem.price,
    });
    setCheckoutStep('done');
  };

  const closeCheckout = () => {
    setCheckoutStep('idle');
    setSelectedItem(null);
    setCompletedTx(null);
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
          <EmptyState icon={<Store className="h-6 w-6" />} title="No items listed" description="Items added in the Kiosk Manager will appear here for purchase." />
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-2.5 px-2 mono text-gray-400">{shortAddress(tx.tx_hash, 8)}</td>
                    <td className="py-2.5 px-2 mono text-gray-400">{shortAddress(tx.buyer_address, 4)}</td>
                    <td className="py-2.5 px-2 mono text-cyan font-medium">{formatTokenAmount(Number(tx.amount), kiosk?.settlement_token || 'XLM')}</td>
                    <td className="py-2.5 px-2 mono text-gray-400">{formatTokenAmount(Number(tx.seller_payout), kiosk?.settlement_token || 'XLM')}</td>
                    <td className="py-2.5 px-2 mono text-emerald">{formatTokenAmount(Number(tx.royalty_payout), kiosk?.settlement_token || 'XLM')}</td>
                    <td className="py-2.5 px-2 mono text-amber">{formatTokenAmount(Number(tx.upstream_payout), kiosk?.settlement_token || 'XLM')}</td>
                    <td className="py-2.5 px-2">
                      <Badge size="xs" variant={tx.status === 'SETTLED' ? 'emerald' : tx.status === 'PENDING' ? 'amber' : 'cyan'}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 text-gray-500">{formatTimeAgo(tx.ledger_timestamp || tx.created_at)}</td>
                  </tr>
                ))}
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
                    <span className="mono text-cyan">{shortAddress(completedTx.tx_hash, 8)}</span>
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
