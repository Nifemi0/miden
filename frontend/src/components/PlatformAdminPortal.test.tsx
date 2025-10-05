import { render, screen } from '@testing-library/react';
import { PlatformAdminPortal } from './PlatformAdminPortal';
import { useWallet } from '@demox-labs/miden-wallet-adapter-react';
import { vi } from 'vitest';

// Explicitly mock the module
vi.mock('@demox-labs/miden-wallet-adapter-react');

describe('PlatformAdminPortal', () => {
  it('renders connect wallet message when not connected', () => {
    // Now useWallet is guaranteed to be the mocked version
    (useWallet as vi.Mock).mockReturnValue({
      connected: false,
      publicKey: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      signMessage: vi.fn(),
      sendTransaction: vi.fn(),
    });

    render(<PlatformAdminPortal />);
    expect(screen.getByRole('heading', { name: /Wallet Connection Required/i })).toBeInTheDocument();
  });
});