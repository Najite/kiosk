import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  Palette,
  Eye,
  ShoppingCart,
  Type,
  Square,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { kioskStorage, type Kiosk, type KioskItem, type WidgetConfig } from '@/lib/kiosk';
import { useWallet } from '@/context/WalletContext';
import { formatTokenAmount, shortAddress } from '@/lib/stellar';
import { Panel, SectionTitle, Badge, Input, Label, Toggle } from '@/components/ui';

export function WidgetCustomizer() {
  const { address, isConnected, connect } = useWallet();
  const [kiosk, setKiosk] = useState<Kiosk | null>(null);
  const [items, setItems] = useState<KioskItem[]>([]);
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<'react' | 'html' | 'iframe'>('react');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewItem, setPreviewItem] = useState<KioskItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const kData = await kioskStorage.getKiosk(address);
    if (kData) {
      setKiosk(kData);
      const itemsList = await kioskStorage.getItems(kData.id, address);
      setItems(itemsList);
      if (itemsList.length > 0) setPreviewItem(itemsList[0]);

      const wData = await kioskStorage.getWidgetConfig(kData.id, address);
      setConfig(wData);
    } else {
      setKiosk(null);
      setItems([]);
      setPreviewItem(null);
      const wData = await kioskStorage.getWidgetConfig('', address);
      setConfig(wData);
    }
    setLoading(false);
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  const updateConfig = async (patch: Partial<WidgetConfig>) => {
    if (!config) return;
    const updated = await kioskStorage.updateWidgetConfig({ ...patch, kiosk_id: kiosk?.id }, address);
    setConfig(updated);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const accentColor = config?.accent_color || '#00E5FF';
  const isDark = config?.theme === 'dark';
  const borderRadius = config?.border_radius || 12;

  const codeSnippets = useMemo(() => {
    const kioskId = kiosk?.id || '';
    const itemId = previewItem?.id || '';

    const reactSnippet = `import { StellarKioskButton } from '@stellarkiosk/widget';

export default function DocsPage() {
  return (
    <StellarKioskButton
      kioskId="${kioskId}"
      itemId="${itemId}"
      theme="${config?.theme || 'dark'}"
      accentColor="${accentColor}"
      buttonText="${config?.button_text || 'Buy via StellarKiosk'}"
      borderRadius={${borderRadius}}
      showPreview={${config?.show_preview ?? true}}
    />
  );
}`;

    const htmlSnippet = `<script src="https://cdn.stellarkiosk.io/widget.js"></script>
<stellar-kiosk-button
  kiosk-id="${kioskId}"
  item-id="${itemId}"
  theme="${config?.theme || 'dark'}"
  accent-color="${accentColor}"
  button-text="${config?.button_text || 'Buy via StellarKiosk'}"
  border-radius="${borderRadius}"
  ${config?.show_preview ? 'show-preview' : ''}
></stellar-kiosk-button>`;

    const iframeSnippet = `<iframe
  src="https://widget.stellarkiosk.io/embed?kiosk=${kioskId}&item=${itemId}&theme=${config?.theme || 'dark'}&accent=${encodeURIComponent(accentColor)}"
  width="100%"
  height="120"
  frameborder="0"
  style="border:none; border-radius:${borderRadius}px;"
></iframe>`;

    return { react: reactSnippet, html: htmlSnippet, iframe: iframeSnippet };
  }, [kiosk, previewItem, config, accentColor, borderRadius]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="h-4 w-4 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
          Loading widget config...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Wallet Status Banner */}
      {!isConnected ? (
        <div className="p-3 rounded-xl bg-cyan/5 border border-cyan/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            <span>Connect your Freighter wallet on Stellar Testnet to generate embed codes for your escrow kiosks.</span>
          </div>
          <button onClick={() => connect()} className="text-[11px] font-semibold text-cyan hover:underline shrink-0">
            Connect Freighter &rarr;
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald/5 border border-emerald/20 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span><strong>Connected Wallet:</strong> <code className="font-mono text-white">{shortAddress(address || '')}</code></span>
          </div>
          <span className="text-[10px] font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded border border-emerald/20">Stellar Testnet</span>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_400px] gap-5">
        {/* Left: Customizer */}
        <div className="space-y-5">
          {/* Theme & Appearance */}
          <Panel className="p-5">
            <SectionTitle title="Widget Appearance" subtitle="Customize the embeddable checkout button" icon={<Palette className="h-4 w-4" />} />
            <div className="space-y-4">
              {/* Theme */}
              <div>
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateConfig({ theme: t })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        config?.theme === t
                          ? 'bg-cyan/10 border-cyan/30 text-cyan'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {t === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div>
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => updateConfig({ accent_color: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                  />
                  <Input value={accentColor} onChange={(v) => updateConfig({ accent_color: v })} className="mono flex-1" />
                  <div className="flex gap-1">
                    {['#00E5FF', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateConfig({ accent_color: c })}
                        className="h-9 w-9 rounded-lg border border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Button text */}
              <div>
                <Label>Button Text</Label>
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-gray-600" />
                  <Input value={config?.button_text || ''} onChange={(v) => updateConfig({ button_text: v })} />
                </div>
              </div>

              {/* Border radius */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Border Radius</Label>
                  <span className="mono text-xs text-cyan">{borderRadius}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-gray-600" />
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={2}
                    value={borderRadius}
                    onChange={(e) => updateConfig({ border_radius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Show preview toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-white/8">
                <div>
                  <p className="text-sm text-white font-medium">Show Asset Preview</p>
                  <p className="text-xs text-gray-500 mt-0.5">Display item thumbnail and price in the widget</p>
                </div>
                <Toggle checked={config?.show_preview ?? true} onChange={(v) => updateConfig({ show_preview: v })} />
              </div>
            </div>
          </Panel>

          {/* Item selector for preview */}
          {items.length > 0 && (
            <Panel className="p-5">
              <SectionTitle title="Preview Item" subtitle="Select which asset the widget shows" icon={<Eye className="h-4 w-4" />} />
              <div className="space-y-1.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      previewItem?.id === item.id ? 'bg-cyan/8 border-cyan/25' : 'bg-white/3 border-white/8 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${previewItem?.id === item.id ? 'text-white' : 'text-gray-300'}`}>{item.title}</span>
                      <span className="mono text-xs text-cyan">{formatTokenAmount(item.price, kiosk?.settlement_token || 'XLM')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <Panel className="p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan" />
                <span className="text-sm font-semibold text-white">Live Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Preview canvas */}
            <div
              className="rounded-xl border p-6 transition-all"
              style={{
                background: isDark ? '#0A0D14' : '#F8FAFC',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                borderRadius: `${borderRadius}px`,
              }}
            >
              {config?.show_preview && previewItem && (
                <div className="mb-3 flex items-center gap-3 p-3 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                    style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
                  >
                    <ShoppingCart className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate" style={{ color: isDark ? '#fff' : '#0A0D14' }}>{previewItem.title}</p>
                    <p className="text-xs mono font-bold mt-0.5" style={{ color: accentColor }}>
                      {formatTokenAmount(previewItem.price, kiosk?.settlement_token || 'XLM')}
                    </p>
                  </div>
                </div>
              )}
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: accentColor,
                  color: isDark ? '#0A0D14' : '#fff',
                  borderRadius: `${borderRadius}px`,
                  boxShadow: `0 4px 20px ${accentColor}30`,
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                {config?.button_text || 'Buy via StellarKiosk'}
              </button>
            </div>

            {/* Compatibility badges */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {['React', 'HTML', 'Next.js', 'Docusaurus', 'GitHub Pages'].map((p) => (
                <Badge key={p} size="xs">{p}</Badge>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Code Generator */}
      <Panel className="p-5">
        <SectionTitle
          title="Production-Ready Code"
          subtitle="Zero-dependency embeddable widget snippets"
          icon={<Code2 className="h-4 w-4" />}
        />
        <div className="flex items-center gap-1 mb-4 bg-white/5 rounded-lg p-0.5 w-fit">
          {([
            { id: 'react' as const, label: 'React' },
            { id: 'html' as const, label: 'HTML Web Component' },
            { id: 'iframe' as const, label: 'iframe Embed' },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                tab === t.id ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <pre className="panel-tight p-4 overflow-x-auto text-xs mono leading-relaxed text-gray-300 max-h-80">
            <code>{codeSnippets[tab]}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(codeSnippets[tab], tab)}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {copied === tab ? <Check className="h-3 w-3 text-emerald" /> : <Copy className="h-3 w-3" />}
            {copied === tab ? 'Copied' : 'Copy'}
          </button>
        </div>
      </Panel>
    </div>
  );
}
