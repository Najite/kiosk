import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Percent,
  GitBranch,
  Clock,
  Users,
  Plus,
  Trash2,
  Save,
  Zap,
  ScrollText,
} from 'lucide-react';
import { kioskStorage, type Kiosk, type KioskItem, type TransferPolicy, type UpstreamRecipient } from '@/lib/kiosk';
import { bpsToPercent, formatTokenAmount, formatDuration, calculatePayouts } from '@/lib/stellar';
import { Panel, SectionTitle, Badge, Button, Input, Label, EmptyState, StatCard } from '@/components/ui';

export function PolicyEngine() {
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [items, setItems] = useState<KioskItem[]>([]);
  const [policies, setPolicies] = useState<Record<string, TransferPolicy>>({});
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState<TransferPolicy | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const kData = await kioskStorage.getKiosk();
    if (kData) {
      setKiosk(kData);
      const itemsList = await kioskStorage.getItems(kData.id);
      setItems(itemsList);

      const policyMap = await kioskStorage.getPolicies();
      setPolicies(policyMap);
      if (itemsList.length > 0 && !selectedItemId) {
        setSelectedItemId(itemsList[0].id);
      }
    }
    setLoading(false);
  }, [selectedItemId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedItemId) {
      const existing = policies[selectedItemId];
      setDraft(
        existing || {
          id: '',
          item_id: selectedItemId,
          min_royalty_bps: 0,
          upstream_split_bps: 0,
          upstream_recipients: [],
          timelock_seconds: 0,
          escrow_mode: 'INSTANT',
          created_at: '',
        }
      );
      setSaved(false);
    }
  }, [selectedItemId, policies]);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const updateDraft = (patch: Partial<TransferPolicy>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setSaved(false);
  };

  const addRecipient = () => {
    updateDraft({
      upstream_recipients: [
        ...(draft?.upstream_recipients || []),
        { label: '', address: '', shareBps: 0 },
      ],
    });
  };

  const updateRecipient = (index: number, patch: Partial<UpstreamRecipient>) => {
    const recipients = [...(draft?.upstream_recipients || [])];
    recipients[index] = { ...recipients[index], ...patch };
    updateDraft({ upstream_recipients: recipients });
  };

  const removeRecipient = (index: number) => {
    const recipients = (draft?.upstream_recipients || []).filter((_, i) => i !== index);
    updateDraft({ upstream_recipients: recipients });
  };

  const savePolicy = async () => {
    if (!draft || !selectedItemId) return;
    setSaving(true);
    const payload = {
      id: draft.id,
      item_id: selectedItemId,
      min_royalty_bps: draft.min_royalty_bps,
      upstream_split_bps: draft.upstream_split_bps,
      upstream_recipients: draft.upstream_recipients,
      timelock_seconds: draft.timelock_seconds,
      escrow_mode: draft.escrow_mode,
    };
    const updated = await kioskStorage.savePolicy(payload);
    setPolicies({ ...policies, [selectedItemId]: updated });
    setDraft(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="h-4 w-4 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          Loading escrow policies...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Shield className="h-6 w-6" />}
        title="No items to configure"
        description="Add assets in the Kiosk Manager first, then configure their transfer policies here."
      />
    );
  }

  const payout =
    draft && selectedItem
      ? calculatePayouts(selectedItem.price, draft.min_royalty_bps, draft.upstream_split_bps)
      : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Items with Policy" value={String(Object.keys(policies).length)} icon={<Shield className="h-4 w-4" />} accent="cyan" />
        <StatCard label="Avg Royalty" value={Object.keys(policies).length ? bpsToPercent(Math.round(Object.values(policies).reduce((a, p) => a + p.min_royalty_bps, 0) / Object.keys(policies).length)) : '0%'} icon={<Percent className="h-4 w-4" />} accent="emerald" />
        <StatCard label="Avg Upstream Split" value={Object.keys(policies).length ? bpsToPercent(Math.round(Object.values(policies).reduce((a, p) => a + p.upstream_split_bps, 0) / Object.keys(policies).length)) : '0%'} icon={<GitBranch className="h-4 w-4" />} accent="amber" />
        <StatCard label="Active Recipients" value={String(Object.values(policies).reduce((a, p) => a + p.upstream_recipients.length, 0))} icon={<Users className="h-4 w-4" />} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        {/* Item selector */}
        <Panel className="p-4 h-fit">
          <SectionTitle title="Select Asset" subtitle={`${items.length} items`} icon={<ScrollText className="h-4 w-4" />} />
          <div className="space-y-1.5">
            {items.map((item) => {
              const hasPolicy = !!policies[item.id];
              const active = selectedItemId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    active
                      ? 'bg-cyan/8 border-cyan/25'
                      : 'bg-white/3 border-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-xs font-medium truncate ${active ? 'text-white' : 'text-gray-300'}`}>{item.title}</p>
                    {hasPolicy && <span className="h-1.5 w-1.5 rounded-full bg-emerald shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{item.asset_type}</span>
                    <span className="mono text-xs text-cyan font-medium">{formatTokenAmount(item.price, kiosk?.settlement_token || 'XLM')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Policy editor */}
        {draft && selectedItem && (
          <div className="space-y-5">
            {/* Item header */}
            <Panel className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-semibold text-white">{selectedItem.title}</h2>
                <Badge variant="cyan">{formatTokenAmount(selectedItem.price, kiosk?.settlement_token || 'XLM')}</Badge>
              </div>
              <p className="text-xs text-gray-500">{selectedItem.description}</p>
            </Panel>

            {/* Escrow Mode */}
            <Panel className="p-5">
              <SectionTitle title="Escrow Release Mode" subtitle="How funds are released after purchase" icon={<Clock className="h-4 w-4" />} />
              <div className="grid grid-cols-3 gap-2">
                {([
                  { mode: 'INSTANT', label: 'Instant Delivery', desc: 'Funds settle immediately', icon: Zap },
                  { mode: 'TIMELOCK', label: 'Timelock', desc: 'Release after delay', icon: Clock },
                  { mode: 'MULTISIG', label: 'Multi-sig', desc: 'Requires confirmation', icon: Users },
                ] as const).map((m) => {
                  const Icon = m.icon;
                  const active = draft.escrow_mode === m.mode;
                  return (
                    <button
                      key={m.mode}
                      onClick={() => updateDraft({ escrow_mode: m.mode, timelock_seconds: m.mode === 'TIMELOCK' ? (draft.timelock_seconds || 86400) : 0 })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        active ? 'bg-cyan/8 border-cyan/30' : 'bg-white/3 border-white/8 hover:border-white/15'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mb-2 ${active ? 'text-cyan' : 'text-gray-500'}`} />
                      <p className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-400'}`}>{m.label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
              {draft.escrow_mode === 'TIMELOCK' && (
                <div className="mt-4 pt-4 border-t border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Timelock Duration</Label>
                    <span className="mono text-xs text-amber font-medium">{formatDuration(draft.timelock_seconds)}</span>
                  </div>
                  <input
                    type="range"
                    min={3600}
                    max={604800}
                    step={3600}
                    value={draft.timelock_seconds}
                    onChange={(e) => updateDraft({ timelock_seconds: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>1h</span><span>24h</span><span>7d</span>
                  </div>
                </div>
              )}
            </Panel>

            {/* Royalty & Upstream Splits */}
            <Panel className="p-5">
              <SectionTitle title="Composable Revenue Splits" subtitle="Creator royalties and upstream dependency drips" icon={<Percent className="h-4 w-4" />} />

              {/* Royalty slider */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <Label>Creator Royalty</Label>
                  <span className="mono text-sm text-emerald font-bold">{bpsToPercent(draft.min_royalty_bps)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2500}
                  step={50}
                  value={draft.min_royalty_bps}
                  onChange={(e) => updateDraft({ min_royalty_bps: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>0%</span><span>12.5%</span><span>25%</span>
                </div>
              </div>

              {/* Upstream split slider */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <Label>Upstream Dependency Split</Label>
                  <span className="mono text-sm text-amber font-bold">{bpsToPercent(draft.upstream_split_bps)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={draft.upstream_split_bps}
                  onChange={(e) => updateDraft({ upstream_split_bps: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>0%</span><span>15%</span><span>30%</span>
                </div>
              </div>

              {/* Recipients */}
              <div className="pt-4 border-t border-white/8">
                <div className="flex items-center justify-between mb-3">
                  <Label>Upstream Recipients</Label>
                  <Button size="sm" variant="ghost" onClick={addRecipient}>
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
                {draft.upstream_recipients.length === 0 ? (
                  <p className="text-xs text-gray-600 py-3 text-center bg-white/3 rounded-lg border border-dashed border-white/10">
                    No upstream recipients configured. Add GitHub maintainers or Stellar addresses to drip funds automatically.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {draft.upstream_recipients.map((r, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 items-center panel-tight p-2">
                        <Input value={r.label} onChange={(v) => updateRecipient(i, { label: v })} placeholder="Label (e.g. crate name)" />
                        <Input value={r.address} onChange={(v) => updateRecipient(i, { address: v })} placeholder="G..." className="mono text-xs" />
                        <Input type="number" value={String(r.shareBps)} onChange={(v) => updateRecipient(i, { shareBps: parseInt(v) || 0 })} placeholder="bps" />
                        <button onClick={() => removeRecipient(i)} className="text-gray-600 hover:text-rose transition-colors flex items-center justify-center">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            {/* Payout Preview */}
            {payout && (
              <Panel className="p-5 glow-cyan">
                <SectionTitle title="Payout Simulation" subtitle={`For a ${formatTokenAmount(selectedItem.price, kiosk?.settlement_token || 'XLM')} purchase`} icon={<Zap className="h-4 w-4" />} />
                <div className="grid grid-cols-3 gap-3">
                  <div className="panel-tight p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Seller</p>
                    <p className="mono text-lg font-bold text-emerald mt-1">{formatTokenAmount(payout.sellerPayout, kiosk?.settlement_token || 'XLM')}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{((payout.sellerPayout / selectedItem.price) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="panel-tight p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Royalty</p>
                    <p className="mono text-lg font-bold text-cyan mt-1">{formatTokenAmount(payout.royaltyPayout, kiosk?.settlement_token || 'XLM')}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{((payout.royaltyPayout / selectedItem.price) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="panel-tight p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">Upstream</p>
                    <p className="mono text-lg font-bold text-amber mt-1">{formatTokenAmount(payout.upstreamPayout, kiosk?.settlement_token || 'XLM')}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{((payout.upstreamPayout / selectedItem.price) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </Panel>
            )}

            {/* Save */}
            <div className="flex items-center justify-end gap-3">
              {saved && (
                <span className="text-xs text-emerald flex items-center gap-1 animate-fade-in">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Policy saved to Soroban
                </span>
              )}
              <Button onClick={savePolicy} disabled={saving}>
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Deploying...' : draft.id ? 'Update Policy' : 'Deploy Policy'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
