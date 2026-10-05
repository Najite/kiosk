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
      expect(screen.getByText(/freighter wallet not detected/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with simulated demo account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /install freighter extension/i })).toHaveAttribute(
        'href',
        'https://www.freighter.app'
      );
    });
  });

  it('connects to simulated demo account and displays wallet dropdown with balance and status', async () => {
    renderTopBar();

    const connectBtn = screen.getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectBtn);

    // Click continue with demo account in modal
    const demoBtn = await screen.findByText(/continue with simulated demo account/i);
    fireEvent.click(demoBtn);

    // Wallet is now connected, modal is closed
    await waitFor(() => {
      expect(screen.queryByText(/freighter wallet not detected/i)).not.toBeInTheDocument();
    });

    // The wallet pill button displays the truncated address
    const walletAddressPill = await screen.findByTestId('wallet-address-pill');
    expect(walletAddressPill).toBeInTheDocument();

    // Click wallet pill to open dropdown
    fireEvent.click(walletAddressPill);

    // Verify wallet panel elements
    expect(screen.getByText(/connected address/i)).toBeInTheDocument();
    expect(screen.getByText(/^simulated$/i)).toBeInTheDocument();
    expect(screen.getByText(/100.00 xlm/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
  });

  it('switches between TESTNET and MAINNET seamlessly', async () => {
    renderTopBar();

    // Default network is TESTNET
    const networkToggle = screen.getByRole('button', { name: /testnet/i });
    expect(networkToggle).toBeInTheDocument();

    // Click to open network dropdown
    fireEvent.click(networkToggle);

    // Select MAINNET
    const mainnetOption = screen.getByRole('button', { name: /^mainnet$/i });
    fireEvent.click(mainnetOption);

    // Network toggle now shows MAINNET
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mainnet/i })).toBeInTheDocument();
    });

    // Switch back to TESTNET
    const mainnetToggle = screen.getByRole('button', { name: /mainnet/i });
    fireEvent.click(mainnetToggle);
    const testnetOption = screen.getByRole('button', { name: /^testnet$/i });
    fireEvent.click(testnetOption);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /testnet/i })).toBeInTheDocument();
    });
  });
});
