import { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Package,
  Plus,
  Trash2,
  Settings2,
  Copy,
  Check,
  ExternalLink,
  Coins,
  TrendingUp,
  Layers,
  Lock,
} from 'lucide-react';
import { kioskStorage, type Kiosk, type KioskItem } from '@/lib/kiosk';
import {
  generateStellarAddress,
  shortAddress,
  formatTokenAmount,
  TESTNET_CONTRACT_ID,
} from '@/lib/stellar';
import {
  buildPlaceAndListTx,
  submitSignedTx,
} from '@/lib/soroban';
import { useWallet } from '@/context/WalletContext';
import {
  Panel,
  SectionTitle,
  StatCard,
  Badge,
  Button,
  Input,
  Label,
  Modal,
  StatusDot,
  EmptyState,
} from '@/components/ui';

export function KioskManager() {
  const { address, isConnected, connect, signTx, refreshAccount } = useWallet();
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [items, setItems] = useState<KioskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [initModalOpen, setInitModalOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    asset_type: 'License',
    price: '0',
    icon: 'Package',
  });

  const loadKiosk = useCallback(async () => {
    setLoading(true);
    const kData = await kioskStorage.getKiosk(address);
    if (kData) {
      setKiosk(kData);
      const iData = await kioskStorage.getItems(kData.id, address);
      setItems(iData);
    } else {
      setKiosk(null);
      setItems([]);
    }
    setLoading(false);
  }, [address]);

  useEffect(() => {
    loadKiosk();
  }, [loadKiosk]);

  const initializeKiosk = async (name: string, description: string, token: string) => {
    const owner = address || generateStellarAddress();
    const updated = await kioskStorage.updateKiosk({
      name,
      description,
      settlement_token: token,
      is_initialized: true,
      owner_address: owner,
      contract_id: TESTNET_CONTRACT_ID,
    }, address);
    setKiosk(updated);
    setInitModalOpen(false);
  };

  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const addItem = async () => {
    if (!kiosk || !newItem.title || isAdding) return;
    setIsAdding(true);
    setAddError(null);

    try {
      const priceVal = parseFloat(newItem.price) || 0;

      let onchainId: number | undefined;

      if (!address || !isConnected) {
        throw new Error('Please connect your Freighter wallet on Stellar Testnet to list assets.');
      }

      // 1. Build and simulate place_and_list transaction
      const { xdrBase64, nextItemId } = await buildPlaceAndListTx({
        sellerAddress: address,
        title: newItem.title,
        description: newItem.description,
        assetType: newItem.asset_type,
        priceInXlm: priceVal,
        contractId: kiosk.contract_id || undefined,
      });
      onchainId = nextItemId;

      // 2. Request Freighter signature
      const signedXdr = await signTx(xdrBase64);
      if (!signedXdr) {
        throw new Error('Listing signature declined or failed in Freighter');
      }

      // 3. Submit transaction to Soroban RPC
      await submitSignedTx(signedXdr, 'TESTNET');
      await refreshAccount();

      const created = await kioskStorage.addItem({
        kiosk_id: kiosk.id,
        onchain_id: onchainId,
        title: newItem.title,
        description: newItem.description,
        asset_type: newItem.asset_type,
        price: priceVal,
        icon: newItem.icon,
        status: 'AVAILABLE',
      }, address);

      setItems([created, ...items]);
      setNewItem({ title: '', description: '', asset_type: 'License', price: '0', icon: 'Package' });
      setAddItemOpen(false);
    } catch (err: any) {
      console.error('Failed to list item on-chain:', err);
      setAddError(err?.message || 'Failed to list asset on Soroban');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteItem = async (id: string) => {
    await kioskStorage.deleteItem(id, address);
    setItems(items.filter((i) => i.id !== id));
  };

  const copyContract = () => {
    if (kiosk?.contract_id) {
      navigator.clipboard.writeText(kiosk.contract_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="h-4 w-4 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          Syncing kiosk state...
        </div>
      </div>
    );
  }

  if (!kiosk) {
    return (
      <div className="space-y-4 animate-fade-in">
        {isConnected && (
          <div className="p-3.5 rounded-xl bg-emerald/5 border border-emerald/20 flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
              <span>Live Freighter Wallet Connected: <strong className="font-mono text-white">{shortAddress(address || '')}</strong></span>
            </div>
            <span className="text-[11px] font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded border border-emerald/20">Stellar Testnet</span>
          </div>
        )}
        <Panel className="p-8 text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-cyan/10 border border-cyan/20 text-cyan">
            <Boxes className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No Kiosk Initialized For This Account</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Your connected Stellar address does not have a registered Soroban Kiosk instance yet. Initialize a new escrow contract to deploy assets.
            </p>
          </div>
          <div className="pt-2">
            <Button size="sm" onClick={() => setInitModalOpen(true)}>
              <Settings2 className="h-3.5 w-3.5" />
              Initialize Soroban Kiosk
            </Button>
          </div>
        </Panel>

        <InitModal
          open={initModalOpen}
          onClose={() => setInitModalOpen(false)}
          onInit={initializeKiosk}
          defaults={{
            name: 'My Stellar Kiosk',
            description: 'Decentralized escrow kiosk for digital assets.',
            token: 'XLM',
          }}
        />
      </div>
    );
  }

  const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
  const escrowCount = items.filter((i) => i.status === 'IN_ESCROW').length;
  const settledCount = items.filter((i) => i.status === 'SETTLED').length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Wallet Status Banner */}
      {!isConnected ? (
        <div className="p-3 rounded-xl bg-cyan/5 border border-cyan/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            <span>Connect your Freighter wallet on Stellar Testnet to manage and list items on-chain.</span>
          </div>
          <button
            onClick={() => connect()}
            className="text-[11px] font-semibold text-cyan hover:underline shrink-0"
          >
            Connect Freighter &rarr;
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald/5 border border-emerald/20 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span><strong>Connected Wallet:</strong> <code className="text-white font-mono">{shortAddress(address || '')}</code></span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded text-emerald">Stellar Testnet</span>
        </div>
      )}
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Sales Volume"
          value={formatTokenAmount(Number(kiosk.total_sales_volume), kiosk.settlement_token)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="emerald"
        />
        <StatCard
          label="Stored Assets"
          value={String(items.length)}
          sub={`${availableCount} available · ${escrowCount} in escrow`}
          icon={<Package className="h-4 w-4" />}
          accent="cyan"
        />
        <StatCard
          label="Settlement Token"
          value={kiosk.settlement_token}
          sub={kiosk.settlement_token === 'XLM' ? 'Native Stellar Lumens' : 'Stellar USDC'}
          icon={<Coins className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Contract Status"
          value={kiosk.is_initialized ? 'INITIALIZED' : 'PENDING'}
          sub={kiosk.is_initialized ? 'Soroban deployed' : 'Awaiting deploy'}
          icon={<Lock className="h-4 w-4" />}
          accent={kiosk.is_initialized ? 'emerald' : 'amber'}
        />
      </div>

      {/* Kiosk Identity Panel */}
      <Panel className="p-5 scan-overlay">
        <SectionTitle
          title="Kiosk Identity"
          subtitle="Soroban smart contract escrow account"
          icon={<Boxes className="h-4 w-4" />}
          action={
            !kiosk.is_initialized && (
              <Button size="sm" onClick={() => (isConnected ? setInitModalOpen(true) : connect())}>
                <Settings2 className="h-3.5 w-3.5" />
                Initialize Kiosk
              </Button>
            )
          }
        />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Kiosk Name</Label>
              <p className="text-sm text-white font-medium">{kiosk.name}</p>
            </div>
            <div>
              <Label>Description</Label>
              <p className="text-sm text-gray-400 leading-relaxed">{kiosk.description}</p>
            </div>
            <div>
              <Label>Owner Address</Label>
              <p className="mono text-xs text-cyan break-all">{kiosk.owner_address}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <Label>Soroban Contract ID</Label>
              {kiosk.contract_id ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="mono text-xs text-gray-300 truncate flex-1">{kiosk.contract_id}</p>
                    <button
                      onClick={copyContract}
                      className="text-gray-500 hover:text-cyan transition-colors"
                      title="Copy Contract ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${kiosk.contract_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-cyan hover:underline"
                  >
                    <span>View Contract on Stellar Expert</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-600">Not yet deployed</p>
              )}
            </div>
            <div>
              <Label>Kiosk UID</Label>
              <p className="mono text-xs text-gray-400">{kiosk.id}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {kiosk.is_initialized ? (
                <Badge variant="emerald">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> Initialized
                </Badge>
              ) : (
                <Badge variant="amber">Pending Deploy</Badge>
              )}
              <Badge variant="cyan">Soroban</Badge>
            </div>
          </div>
        </div>
      </Panel>

      {/* Items Grid */}
      <Panel className="p-5">
        <SectionTitle
          title="Stored Assets"
          subtitle={`${items.length} items in this kiosk`}
          icon={<Package className="h-4 w-4" />}
          action={
            <Button size="sm" variant="secondary" onClick={() => setAddItemOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="No assets in this kiosk yet"
            description="List software licenses, digital passes, or compute vouchers to start selling."
            action={<Button size="sm" onClick={() => setAddItemOpen(true)}><Plus className="h-3.5 w-3.5" /> Add First Item</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="panel-tight p-4 group hover:border-white/15 transition-all relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/5 border border-cyan/15 text-cyan">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot status={item.status} />
                    <Badge variant={item.status === 'AVAILABLE' ? 'emerald' : item.status === 'IN_ESCROW' ? 'amber' : 'cyan'} size="xs">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">{item.asset_type}</p>
                    <p className="mono text-sm font-bold text-cyan mt-0.5">
                      {formatTokenAmount(item.price, kiosk.settlement_token)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-600 hover:text-rose transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Initialize Modal */}
      <InitModal
        open={initModalOpen}
        onClose={() => setInitModalOpen(false)}
        onInit={initializeKiosk}
        defaults={{ name: kiosk.name, description: kiosk.description, token: kiosk.settlement_token }}
      />

      {/* Add Item Modal */}
      <Modal open={addItemOpen} onClose={() => setAddItemOpen(false)} title="List New Asset">
        <div className="space-y-4">
          <div>
            <Label>Asset Title</Label>
            <Input value={newItem.title} onChange={(v) => setNewItem({ ...newItem, title: v })} placeholder="e.g. Soroban SDK License" />
          </div>
          <div>
            <Label>Description</Label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Describe what the buyer gets..."
              className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan/50 transition-all resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Asset Type</Label>
              <select
                value={newItem.asset_type}
                onChange={(e) => setNewItem({ ...newItem, asset_type: e.target.value })}
                className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 transition-all"
              >
                {['License', 'Pass', 'Token', 'Collectible'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Price ({kiosk.settlement_token})</Label>
              <Input type="number" value={newItem.price} onChange={(v) => setNewItem({ ...newItem, price: v })} placeholder="0" />
            </div>
          </div>
          {/* Error state */}
          {addError && (
            <div className="panel-tight p-3 border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5">
              <span className="text-rose-400 font-bold text-xs mt-0.5">✕</span>
              <div className="text-xs text-rose-300">
                <p className="font-semibold">Listing Error</p>
                <p className="text-[11px] text-rose-200/80 break-words mt-0.5">{addError}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddItemOpen(false)} disabled={isAdding}>Cancel</Button>
            <Button onClick={addItem} disabled={!newItem.title || isAdding}>
              {isAdding ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting to Soroban...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  List Asset On-Chain
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InitModal({
  open,
  onClose,
  onInit,
  defaults,
}: {
  open: boolean;
  onClose: () => void;
  onInit: (name: string, description: string, token: string) => void;
  defaults: { name: string; description: string; token: string };
}) {
  const [name, setName] = useState(defaults.name);
  const [description, setDescription] = useState(defaults.description);
  const [token, setToken] = useState(defaults.token);

  useEffect(() => {
    setName(defaults.name);
    setDescription(defaults.description);
    setToken(defaults.token);
  }, [defaults, open]);

  return (
    <Modal open={open} onClose={onClose} title="Initialize Soroban Kiosk" width="max-w-md">
      <div className="space-y-4">
        <div className="panel-tight p-3 flex items-center gap-2.5">
          <ExternalLink className="h-4 w-4 text-cyan shrink-0" />
          <p className="text-xs text-gray-400">
            Deploying a Kiosk creates a Soroban escrow contract on Stellar {`{TESTNET}`}. This binds the contract ID to your wallet address.
          </p>
        </div>
        <div>
          <Label>Kiosk Name</Label>
          <Input value={name} onChange={setName} />
        </div>
        <div>
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan/50 transition-all resize-none"
            rows={2}
          />
        </div>
        <div>
          <Label>Settlement Token</Label>
          <div className="grid grid-cols-2 gap-2">
            {['XLM', 'USDC'].map((t) => (
              <button
                key={t}
                onClick={() => setToken(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  token === t
                    ? 'bg-cyan/10 border-cyan/30 text-cyan'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {t === 'XLM' ? 'Native XLM' : 'Stellar USDC'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onInit(name, description, token)}>
            <Settings2 className="h-3.5 w-3.5" />
            Deploy & Initialize
          </Button>
        </div>
      </div>
    </Modal>
  );
}
