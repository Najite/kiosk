export type TabId = 'overview' | 'marketplace' | 'vault' | 'policy' | 'embed';

export interface TabConfig {
  id: TabId;
  path: string;
  label: string;
  title: string;
}

export const TABS: TabConfig[] = [
  {
    id: 'overview',
    path: '/',
    label: 'Protocol',
    title: 'StellarKiosk — Autonomous On-Chain Asset Vault & Policy Engine',
  },
  {
    id: 'marketplace',
    path: '/marketplace',
    label: 'Marketplace',
    title: 'Live Marketplace — StellarKiosk',
  },
  {
    id: 'vault',
    path: '/vault',
    label: 'Kiosk Vault',
    title: 'Kiosk Vault & Asset Manager — StellarKiosk',
  },
  {
    id: 'policy',
    path: '/policy',
    label: 'Policy Engine',
    title: 'Transfer Policy Engine — StellarKiosk',
  },
  {
    id: 'embed',
    path: '/embed',
    label: 'Widget Embed',
    title: 'Widget Embed & SDK — StellarKiosk',
  },
];

const TAB_MAP: Record<string, TabId> = {
  '': 'overview',
  overview: 'overview',
  protocol: 'overview',
  marketplace: 'marketplace',
  market: 'marketplace',
  vault: 'vault',
  kiosk: 'vault',
  policy: 'policy',
  embed: 'embed',
  widget: 'embed',
};

/**
 * Resolves the initial active tab from the browser URL (hash, pathname, or query param).
 */
export function getTabFromUrl(): TabId {
  if (typeof window === 'undefined') return 'overview';

  // 1. Check hash first (e.g. #/vault, #marketplace)
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (hash && TAB_MAP[hash]) {
    return TAB_MAP[hash];
  }

  // 2. Check pathname (e.g. /marketplace or /vault)
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase().trim();
  const segment = path.split('/')[0] || '';
  if (TAB_MAP[segment]) {
    return TAB_MAP[segment];
  }

  // 3. Check query param (e.g. ?tab=policy)
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab')?.toLowerCase() || '';
  if (tabParam && TAB_MAP[tabParam]) {
    return TAB_MAP[tabParam];
  }

  return 'overview';
}

/**
 * Pushes or replaces the current tab in browser history and updates the document title.
 */
export function navigateToTab(tab: TabId, replace = false): void {
  if (typeof window === 'undefined') return;

  const config = TABS.find((t) => t.id === tab) || TABS[0];
  const targetPath = config.path;

  if (window.location.pathname !== targetPath) {
    if (replace) {
      window.history.replaceState({ tab }, '', targetPath);
    } else {
      window.history.pushState({ tab }, '', targetPath);
    }
  }

  document.title = config.title;
}
