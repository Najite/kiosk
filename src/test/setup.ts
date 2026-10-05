import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock freighter-api by default in tests
vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
  isAllowed: vi.fn().mockResolvedValue({ isAllowed: false }),
  setAllowed: vi.fn().mockResolvedValue({ isAllowed: true }),
  requestAccess: vi.fn().mockResolvedValue({ address: null }),
  getAddress: vi.fn().mockResolvedValue({ address: null }),
  getNetwork: vi.fn().mockResolvedValue({ network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' }),
  getNetworkDetails: vi.fn().mockResolvedValue({ network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' }),
  WatchWalletChanges: vi.fn().mockImplementation(() => ({
    watch: vi.fn(),
    stop: vi.fn(),
  })),
}));

// Mock fetchLiveAccount to avoid real network requests in jsdom unit tests
vi.mock('@/lib/stellar', async () => {
  const actual = await vi.importActual<typeof import('@/lib/stellar')>('@/lib/stellar');
  return {
    ...actual,
    fetchLiveAccount: vi.fn().mockResolvedValue({
      exists: true,
      sequence: '100',
      xlmBalance: '100.00',
      balances: [],
    }),
  };
});
