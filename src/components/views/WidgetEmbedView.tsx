import React, { useState } from 'react';
import { Code2, Copy, Check, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export const WidgetEmbedView: React.FC = () => {
  const [theme, setTheme] = useState<'obsidian' | 'violet' | 'glass'>('obsidian');
  const [buttonText, setButtonText] = useState('Buy with StellarKiosk');
  const [accentColor, setAccentColor] = useState('#8B5CF6');
  const [showCopied, setShowCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setShowCopied(id);
    setTimeout(() => setShowCopied(null), 2500);
  };

  const reactSnippet = `import { StellarKioskButton } from '@stellarkiosk/widget';

export function CheckoutPage() {
  return (
    <StellarKioskButton
      contractId="CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R"
      itemId={1}
      network="testnet"
      theme="${theme}"
      accentColor="${accentColor}"
      label="${buttonText}"
      onSuccess={(txHash) => console.log('Purchased:', txHash)}
    />
  );
}`;

  const webComponentSnippet = `<!-- Add script once in your <head> -->
<script src="https://cdn.stellarkiosk.io/widget/v1.js" async></script>

<!-- Drop-in Kiosk Checkout Button -->
<stellar-kiosk-button
  contract="CDRKM3ZZXKJQ7VHCQUBO3BZWS3NDPWHSVSNDXX54ZFWEW3AMSI224T4R"
  item-id="1"
  network="testnet"
  theme="${theme}"
  accent="${accentColor}"
  label="${buttonText}">
</stellar-kiosk-button>`;

  const iframeSnippet = `<iframe
  src="https://checkout.stellarkiosk.io/embed/1?theme=${theme}&accent=${encodeURIComponent(accentColor)}"
  width="100%"
  height="72px"
  frameborder="0"
  allow="web-share; payment"
></iframe>`;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Tooling</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Embeddable Checkout Widget
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Embed non-custodial Soroban checkout buttons into any Web2 or Web3 frontend in two lines of code.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customizer Controls */}
        <div className="lg:col-span-5 double-bezel-outer">
          <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Widget Customizer
            </h3>

            {/* Theme selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Theme Aesthetic</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'obsidian', label: 'Obsidian' },
                  { id: 'violet', label: 'Electric' },
                  { id: 'glass', label: 'Glass' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                      theme === t.id
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'bg-[#101018] text-zinc-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Button Label</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c14] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Accent Glow</label>
              <div className="flex items-center gap-3">
                {['#8B5CF6', '#A855F7', '#3B82F6', '#10B981', '#EC4899'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      accentColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-6 rounded-2xl bg-[#07070b] border border-white/10 text-center">
              <div className="text-[10px] font-mono text-zinc-500 uppercase mb-4">Live Preview</div>
              <button
                style={{
                  boxShadow: `0 0 25px ${accentColor}40`,
                }}
                className={`px-8 py-3.5 rounded-full font-bold text-xs transition-all active:scale-95 ${
                  theme === 'obsidian'
                    ? 'bg-[#12121d] text-white border border-white/15 hover:border-white/30'
                    : theme === 'violet'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:brightness-110'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/15'
                }`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>

        {/* Code Snippets Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* React */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-6 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white font-mono">React Component</span>
                <button
                  onClick={() => copyToClipboard(reactSnippet, 'react')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {showCopied === 'react' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy JSX</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#08080c] border border-white/5 overflow-x-auto text-xs font-mono text-purple-200">
                {reactSnippet}
              </pre>
            </div>
          </div>

          {/* Web Component */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-6 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white font-mono">HTML / Web Component</span>
                <button
                  onClick={() => copyToClipboard(webComponentSnippet, 'webcomponent')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {showCopied === 'webcomponent' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#08080c] border border-white/5 overflow-x-auto text-xs font-mono text-purple-200">
                {webComponentSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
