import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TopBar } from '@/components/TopBar';
import { WalletProvider } from '@/context/WalletContext';

function renderTopBar() {
  return render(
    <WalletProvider>
      <TopBar activeView="kiosk" onViewChange={() => {}} onExit={() => {}} />
    </WalletProvider>
  );
}

describe('Wallet & Network Switcher Integration', () => {
  it('opens detection modal when Connect Wallet is clicked without Freighter', async () => {
    renderTopBar();

    const connectBtn = screen.getByRole('button', { name: /connect wallet/i });
    expect(connectBtn).toBeInTheDocument();

    fireEvent.click(connectBtn);

    // Modal explaining Freighter detection should appear
    await waitFor(() => {
      expect(screen.getByText(/freighter wallet required/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /install freighter extension/i })).toHaveAttribute(
        'href',
        'https://www.freighter.app'
      );
    });
  });

  it('displays the dedicated TESTNET network badge', async () => {
    renderTopBar();

    // Network is fixed to TESTNET
    const testnetBadge = screen.getByText(/^TESTNET$/i);
    expect(testnetBadge).toBeInTheDocument();
  });
});
